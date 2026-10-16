import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import dbConnect from "@/lib/dbConnect";
import Deal from "@/models/deal";
import { getAIProvider } from "@/lib/ai";
import { AIService } from "@/lib/ai/service";
import { getPreviousAiCall, hasAiQuota, logAiCall } from "@/lib/ai/rate-limit";
import { handleApiError, AppError } from "@/lib/errors";
import { validateObjectId } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      throw AppError.unauthorized();
    }

    const { dealId, force } = await req.json();
    if (!dealId) {
      throw AppError.validationFailed("dealId is required");
    }
    validateObjectId(dealId, "dealId");

    const key = `lead-summary:${dealId}`;

    await dbConnect();

    // 1. Serve from DB cache if not forced
    if (force !== true) {
      const cachedResult = await getPreviousAiCall(session.user.id, key);
      if (cachedResult) {
        return NextResponse.json({
          summary: cachedResult,
          noApiKey: false,
          aiError: false,
          provider: "Cached",
          isMock: false,
        });
      }
    }

    // 2. Fetch deal and verify ownership
    const deal = await Deal.findOne({ _id: dealId, userId: session.user.id })
      .select("title company value stage priority notes contactName")
      .maxTimeMS(10_000)
      .lean();
    if (!deal) {
      throw AppError.notFound("Lead not found");
    }

    const leadInput = {
      title: deal.title,
      company: deal.company,
      value: deal.value,
      stage: deal.stage,
      priority: deal.priority,
      notes: deal.notes,
      contactName: deal.contactName,
    };

    // 3. Check rolling 24-hour quota — return rate limit error if exceeded
    const allowed = await hasAiQuota(session.user.id);
    if (!allowed) {
      return NextResponse.json({
        error: "Rolling 24-hour AI quota exceeded. Limit is 5 requests."
      }, { status: 429 });
    }

    // 4. Call AI provider via dependency injection
    const aiService = new AIService(getAIProvider());
    let summary;
    let aiError = false;

    try {
      summary = await aiService.getLeadSummary(leadInput);

      if (summary && !summary.noApiKey) {
        await logAiCall(session.user.id, "lead-summary", key, summary);
      }
    } catch (err) {
      console.error(`⚠️ [${aiService.providerName}] getLeadSummary failed:`, err);
      aiError = true;
    }

    // 5. Handle missing key or provider failures (no mock fallback)
    if (aiError || !summary) {
      return NextResponse.json({
        error: "AI service failed or is temporarily unavailable."
      }, { status: 500 });
    }

    if (summary.noApiKey) {
      return NextResponse.json({
        error: "No AI API key configured. Please set GEMINI_API_KEY in your .env file."
      }, { status: 400 });
    }

    return NextResponse.json({
      summary,
      noApiKey: false,
      aiError: false,
      provider: aiService.providerName,
      isMock: false,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
