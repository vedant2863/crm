# API Route Template

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { handleApiError, AppError } from "@/lib/errors";
import { validatePagination, sanitizeString } from "@/lib/validation";
import dbConnect from "@/lib/dbConnect";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { searchParams } = new URL(req.url);
    const { page, limit } = validatePagination({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    await dbConnect();
    // Execute database operations with lean(), select(), maxTimeMS()
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
```
