import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import dbConnect from "@/lib/dbConnect";
import Deal from "@/models/deal";
import { getAIProvider } from "@/lib/ai";
import { AIService } from "@/lib/ai/service";
import { getPreviousAiCall, hasAiQuota, logAiCall } from "@/lib/ai/rate-limit";
import { mockSalesInsights } from "@/lib/ai/mock";

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
        });
      }
    }

    const deals = await Deal.find({ userId: session.user.id }).lean();
    const formattedDeals = (deals as unknown as {
      title: string; value: number; stage: string; priority: string; company?: string;
    }[]).map(d => ({ title: d.title, value: d.value, stage: d.stage, priority: d.priority, company: d.company }));

    // 2. Check rolling 24-hour quota — serve mock if exceeded
    const allowed = await hasAiQuota(session.user.id);
    if (!allowed) {
      return NextResponse.json({
        insights: mockSalesInsights(formattedDeals),
        noApiKey: false,
        aiError: false,
        provider: "Mock (quota exceeded)",
        isMock: true,
        quotaExceeded: true,
      });
    }

    // 3. Call AI provider via dependency injection
    const aiService = new AIService(getAIProvider());
    let insights;
    let aiError = false;
    let isMock = false;

    try {
      insights = await aiService.getSalesInsights(formattedDeals);

      if (insights && !insights.noApiKey) {
        await logAiCall(session.user.id, "sales-insights", key, insights);
      }
    } catch (err) {
      console.error(`⚠️ [${aiService.providerName}] getSalesInsights failed — serving mock:`, err);
      aiError = true;
    }

    // 4. Fall back to mock if provider failed or no key
    if (!insights || insights.noApiKey || aiError) {
      insights = mockSalesInsights(formattedDeals);
      isMock = true;
    }

    return NextResponse.json({
      insights,
      noApiKey: false,
      aiError,
      provider: isMock ? "Mock (AI unavailable)" : aiService.providerName,
      isMock,
    });
  } catch (error) {
    console.error("Error in AI Sales Insights route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
