import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Building2, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import envConfig from "@/lib/config/envconfig";

type Props = {
  params: Promise<{ tenant: string }>;
};

export default async function TenantPage({ params }: Props) {
  const { tenant } = await params;
  const mainSiteUrl = envConfig.auth.url;

  await dbConnect();

  // Find user matching tenant name or company name case-insensitively
  const cleanTenant = tenant.toLowerCase();
  const escapedTenant = cleanTenant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tenantUser = await User.findOne({
    $or: [
      { name: { $regex: new RegExp("^" + escapedTenant, "i") } },
      { company: { $regex: new RegExp("^" + escapedTenant + "$", "i") } },
    ],
  })
    .select("name company avatar bio")
    .lean(); // lean is use to get the plain javascript object instead of mongoose document object.

  if (!tenantUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md space-y-6 rounded-3xl border border-destructive/20 bg-destructive/5 p-8 backdrop-blur-md">
          <h1 className="text-3xl font-black text-destructive tracking-tight">Workspace Not Found</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The workspace subdomain <span className="font-bold text-foreground">&quot;{tenant}&quot;</span> is not registered in our CRM database.
          </p>
          <Button asChild variant="outline" className="w-full font-bold">
            <Link href={mainSiteUrl}>Go to CRM OS Main Site</Link>
          </Button>
        </div>
      </div>
    );
  }

  const companyName = tenantUser.company || "Enterprise Tenant";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Dynamic Glassmorphism Background Blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[150px] animate-pulse" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[150px]" />

      <main className="relative z-10 max-w-lg w-full rounded-3xl border bg-card/45 p-8 md:p-10 backdrop-blur-xl shadow-2xl hover:border-primary/20 transition-all duration-300">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
            <Sparkles className="h-3 w-3 text-primary shrink-0" />
            Verified Workspace
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tight text-foreground">{companyName}</h1>
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
              <Building2 className="h-4 w-4" />
              <span>CRM Tenant Space</span>
            </div>
          </div>

          <div className="border-y border-border/50 py-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-foreground/95">
              <UserCircle className="h-5 w-5 text-primary" />
              <span>Workspace Owner: <strong className="text-foreground">{tenantUser.name}</strong></span>
            </div>
            {tenantUser.bio && (
              <p className="text-xs text-muted-foreground italic leading-relaxed px-4">
                &quot;{tenantUser.bio}&quot;
              </p>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed">
              Login below to access your organization&apos;s custom contacts, pipeline deals, security audit logs, and collaborative activity feeds.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button asChild size="lg" className="w-full font-bold">
              <Link href="/login">
                Access Workspace <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full font-bold">
              <Link href={mainSiteUrl}>
                Main Site Homepage
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <div className="mt-8 text-center text-xs text-muted-foreground flex items-center gap-1.5">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>Secure NextAuth Session Gateway</span>
      </div>
    </div>
  );
}
