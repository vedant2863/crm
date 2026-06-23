import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Deal from "@/models/deal";
import { getAIProvider } from "@/lib/ai";
import { AIService } from "@/lib/ai/service";

import { getPreviousAiCall, hasAiQuota, logAiCall } from "@/lib/ai/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const key = "sales-insights";

    await dbConnect();

    // 1. Try to serve from database cache if not forced
    if (!force) {
      const cachedResult = await getPreviousAiCall(session.user.id, key);
      if (cachedResult) {
        return NextResponse.json({
          insights: cachedResult,
          noApiKey: false,
          aiError: false,
          provider: "Cached",
        });
      }
    }

    // 2. No cache or forced refresh -> Check rolling 24-hour rate limit
    const allowed = await hasAiQuota(session.user.id);
    if (!allowed) {
      return NextResponse.json(
        { error: "Daily quota exceeded. You can only make 5 AI calls every 24 hours." },
        { status: 429 }
      );
    }

    const deals = await Deal.find({ userId: session.user.id }).lean();

    const formattedDeals = (deals as unknown as {
      title: string; value: number; stage: string; priority: string; company?: string;
    }[]).map(d => ({ title: d.title, value: d.value, stage: d.stage, priority: d.priority, company: d.company }));

    // ── Injected provider via AIService Dependency Injection ──────
    const aiService = new AIService(getAIProvider());

    let insights;
    let aiError = false;
    try {
      insights = await aiService.getSalesInsights(formattedDeals);
      
      // 3. Log the successful call with its result payload
      if (insights && !insights.noApiKey) {
        await logAiCall(session.user.id, "sales-insights", key, insights);
      }
    } catch (err) {
      console.error(`⚠️ [${aiService.providerName}] getSalesInsights failed:`, err);
      aiError = true;
    }

    return NextResponse.json({
      insights: insights ?? null,
      noApiKey: insights?.noApiKey ?? false,
      aiError,
      provider: aiService.providerName,
    });
  } catch (error) {
    console.error("Error in AI Sales Insights route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
