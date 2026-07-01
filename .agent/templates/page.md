# Page Template

```tsx
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "@/lib/auth/auth";
import { AppError } from "@/lib/errors";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CustomPage() {
  await dbConnect();
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw AppError.unauthorized();
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-black text-foreground">Custom Workspace Page</h1>
      <p className="text-muted-foreground text-sm">
        Welcome, {session.user.name}.
      </p>
    </div>
  );
}
```
