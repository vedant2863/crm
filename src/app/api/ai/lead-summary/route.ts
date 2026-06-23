import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Deal from "@/models/deal";
import { getAIProvider } from "@/lib/ai";
import { AIService } from "@/lib/ai/service";

import { getPreviousAiCall, hasAiQuota, logAiCall } from "@/lib/ai/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dealId, force } = await req.json();
    if (!dealId) {
      return NextResponse.json({ error: "dealId is required" }, { status: 400 });
    }

    const key = `lead-summary:${dealId}`;

    await dbConnect();

    // 1. Try to serve from database cache if not forced
    if (force !== true) {
      const cachedResult = await getPreviousAiCall(session.user.id, key);
      if (cachedResult) {
        return NextResponse.json({
          summary: cachedResult,
          noApiKey: false,
          aiError: false,
          provider: "Cached",
        });
      }
    }

    // 2. Fetch deal and verify ownership
    const deal = await Deal.findOne({ _id: dealId, userId: session.user.id });
    if (!deal) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // 3. Check rolling 24-hour rate limit
    const allowed = await hasAiQuota(session.user.id);
    if (!allowed) {
      return NextResponse.json(
        { error: "Daily quota exceeded. You can only make 5 AI calls every 24 hours." },
        { status: 429 }
      );
    }

    // ── Injected provider via AIService Dependency Injection ──────
    const aiService = new AIService(getAIProvider());

    let summary;
    let aiError = false;
    try {
      summary = await aiService.getLeadSummary({
        title: deal.title,
        company: deal.company,
        value: deal.value,
        stage: deal.stage,
        priority: deal.priority,
        notes: deal.notes,
        contactName: deal.contactName,
      });

      // 4. Log the successful call with its result payload
      if (summary && !summary.noApiKey) {
        await logAiCall(session.user.id, "lead-summary", key, summary);
      }
    } catch (err) {
      console.error(`⚠️ [${aiService.providerName}] getLeadSummary failed:`, err);
      aiError = true;
    }

    return NextResponse.json({
      summary: summary ?? null,
      noApiKey: summary?.noApiKey ?? false,
      aiError,
      provider: aiService.providerName,
    });
  } catch (error) {
    console.error("Error in AI Lead Summary route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
