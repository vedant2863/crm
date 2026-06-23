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

    const body = await req.json();
    const { dealId, purpose, tone, force } = body;
    if (!dealId || !purpose || !tone) {
      return NextResponse.json({ error: "dealId, purpose, and tone are required" }, { status: 400 });
    }

    const key = `email-generator:${dealId}:${purpose}:${tone}`;

    await dbConnect();

    // 1. Try to serve from database cache if not forced
    if (force !== true) {
      const cachedResult = await getPreviousAiCall(session.user.id, key);
      if (cachedResult) {
        return NextResponse.json({
          email: cachedResult,
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
    let email;
    let aiError = false;
    try {
      email = await aiService.generateEmail(
        { contactName: deal.contactName, company: deal.company, title: deal.title },
        purpose,
        tone
      );

      // 4. Log the successful call with its result payload
      if (email && !email.noApiKey) {
        await logAiCall(session.user.id, "email-generator", key, email);
      }
    } catch (err) {
      console.error(`⚠️ [${aiService.providerName}] generateEmail failed:`, err);
      aiError = true;
    }

    return NextResponse.json({
      email: email ?? null,
      noApiKey: email?.noApiKey ?? false,
      aiError,
      provider: aiService.providerName,
    });
  } catch (error) {
    console.error("Error in AI Email Generator route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
