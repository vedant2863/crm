import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import dbConnect from "@/lib/dbConnect";
import Deal from "@/models/deal";
import { getAIProvider } from "@/lib/ai";
import { AIService } from "@/lib/ai/service";
import { getPreviousAiCall, hasAiQuota, logAiCall } from "@/lib/ai/rate-limit";
import { mockEmail } from "@/lib/ai/mock";

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

    // 3. Check rolling 24-hour quota — serve mock if exceeded
    const allowed = await hasAiQuota(session.user.id);
    if (!allowed) {
      return NextResponse.json({
        email: mockEmail(emailInput, purpose, tone),
        noApiKey: false,
        aiError: false,
        provider: "Mock (quota exceeded)",
        isMock: true,
        quotaExceeded: true,
      });
    }

    // 4. Call AI provider via dependency injection
    const aiService = new AIService(getAIProvider());
    let email;
    let aiError = false;
    let isMock = false;

    try {
      email = await aiService.generateEmail(emailInput, purpose, tone);

      if (email && !email.noApiKey) {
        await logAiCall(session.user.id, "email-generator", key, email);
      }
    } catch (err) {
      console.error(`⚠️ [${aiService.providerName}] generateEmail failed — serving mock:`, err);
      aiError = true;
    }

    // 5. Fall back to mock if provider failed or no key
    if (!email || email.noApiKey || aiError) {
      email = mockEmail(emailInput, purpose, tone);
      isMock = true;
    }

    return NextResponse.json({
      email,
      noApiKey: false,
      aiError,
      provider: isMock ? "Mock (AI unavailable)" : aiService.providerName,
      isMock,
    });
  } catch (error) {
    console.error("Error in AI Email Generator route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
