import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import dbConnect from "@/lib/dbConnect";
import Deal from "@/models/deal";
import { getAIProvider } from "@/lib/ai";
import { AIService } from "@/lib/ai/service";
import { getPreviousAiCall, hasAiQuota, logAiCall } from "@/lib/ai/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dealId, purpose, tone, force } = await req.json();
    if (!dealId || !purpose || !tone) {
      return NextResponse.json({ error: "dealId, purpose, and tone are required" }, { status: 400 });
    }

    const key = `email-generator:${dealId}:${purpose}:${tone}`;

    await dbConnect();

    // 1. Serve from DB cache if not forced
    if (force !== true) {
      const cachedResult = await getPreviousAiCall(session.user.id, key);
      if (cachedResult) {
        return NextResponse.json({
          email: cachedResult,
          noApiKey: false,
          aiError: false,
          provider: "Cached",
          isMock: false,
        });
      }
    }

    // 2. Fetch deal and verify ownership
    const deal = await Deal.findOne({ _id: dealId, userId: session.user.id });
    if (!deal) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const emailInput = {
      contactName: deal.contactName,
      company: deal.company,
      title: deal.title,
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
    let email;
    let aiError = false;

    try {
      email = await aiService.generateEmail(emailInput, purpose, tone);

      if (email && !email.noApiKey) {
        await logAiCall(session.user.id, "email-generator", key, email);
      }
    } catch (err) {
      console.error(`⚠️ [${aiService.providerName}] generateEmail failed:`, err);
      aiError = true;
    }

    // 5. Handle missing key or provider failures (no mock fallback)
    if (aiError || !email) {
      return NextResponse.json({
        error: "AI service failed or is temporarily unavailable."
      }, { status: 500 });
    }

    if (email.noApiKey) {
      return NextResponse.json({
        error: "No AI API key configured. Please set GEMINI_API_KEY in your .env file."
      }, { status: 400 });
    }

    return NextResponse.json({
      email,
      noApiKey: false,
      aiError: false,
      provider: aiService.providerName,
      isMock: false,
    });
  } catch (error) {
    console.error("Error in AI Email Generator route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
