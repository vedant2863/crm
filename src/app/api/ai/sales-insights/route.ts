import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import dbConnect from "@/lib/dbConnect";
import Deal from "@/models/deal";
import { getAIProvider } from "@/lib/ai";
import { AIService } from "@/lib/ai/service";
import { getPreviousAiCall, hasAiQuota, logAiCall, getAiRemaining } from "@/lib/ai/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";
    const key = "sales-insights";

    await dbConnect();

    const remaining = await getAiRemaining(session.user.id, "sales-insights");

    // 1. Serve from DB cache if not a forced refresh
    if (!force) {
      const cachedResult = await getPreviousAiCall(session.user.id, key);
      if (cachedResult) {
        return NextResponse.json({
          insights: cachedResult,
          noApiKey: false,
          aiError: false,
          provider: "Cached",
          isMock: false,
          remaining,
        });
      }
    }

    const deals = await Deal.find({ userId: session.user.id }).lean();
    const formattedDeals = (deals as unknown as {
      title: string; value: number; stage: string; priority: string; company?: string;
    }[]).map(d => ({ title: d.title, value: d.value, stage: d.stage, priority: d.priority, company: d.company }));

    // 2. Check rolling 24-hour quota — return rate limit error if exceeded
    const allowed = await hasAiQuota(session.user.id, "sales-insights");
    if (!allowed) {
      return NextResponse.json({
        error: "Rolling 24-hour AI quota exceeded. Limit is 5 requests.",
        noApiKey: false,
        aiError: true,
        isMock: false,
        quotaExceeded: true,
        remaining: 0,
      }, { status: 429 });
    }

    // 3. Call AI provider via dependency injection
    const aiService = new AIService(getAIProvider());
    let insights;
    let aiError = false;

    try {
      insights = await aiService.getSalesInsights(formattedDeals);

      if (insights && !insights.noApiKey) {
        await logAiCall(session.user.id, "sales-insights", key, insights);
      }
    } catch (err) {
      console.error(`⚠️ [${aiService.providerName}] getSalesInsights failed:`, err);
      aiError = true;
    }

    // 4. Handle missing key or provider failures (no mock fallback)
    if (aiError || !insights) {
      return NextResponse.json({
        error: "AI service failed or is temporarily unavailable.",
        noApiKey: false,
        aiError: true,
        insights: null,
        provider: aiService.providerName,
        isMock: false,
        remaining,
      }, { status: 500 });
    }

    if (insights.noApiKey) {
      return NextResponse.json({
        error: "No AI API key configured.",
        noApiKey: true,
        aiError: false,
        insights: null,
        provider: aiService.providerName,
        isMock: false,
        remaining,
      }, { status: 200 });
    }

    // Get updated remaining count after logging the call
    const updatedRemaining = await getAiRemaining(session.user.id, "sales-insights");

    return NextResponse.json({
      insights,
      noApiKey: false,
      aiError: false,
      provider: aiService.providerName,
      isMock: false,
      remaining: updatedRemaining,
    });
  } catch (error) {
    console.error("Error in AI Sales Insights route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
