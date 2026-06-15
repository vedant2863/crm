"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useTheme } from "@/components/providers";
import {
  ArrowRight,
  Shield,
  Globe,
  Bell,
  Calendar,
  MousePointer,
  Filter,
  FileSpreadsheet,
  Building,
  Key,
  MessageSquare,
  Mail,
  Activity,
  Sun,
  Moon,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* =========================================================
   MAIN LANDING PAGE
   ========================================================= */

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20 transition-colors duration-300">
      {/* Premium Decorative Grid/Glow Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(from_var(--border)_l_c_h_/_0.06)_1px,transparent_1px),linear-gradient(to_bottom,oklch(from_var(--border)_l_c_h_/_0.06)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <Navbar />

      <main className="flex-1 pt-24 pb-16 relative z-10">
        <HeroSection />
        <InteractivePlayground />
        <FeaturesSection />
        <StatsSection />
        <PricingSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

/* =========================================================
   NAVBAR COMPONENT
   ========================================================= */

function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl transition-all">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <Link href="#playground" className="hover:text-foreground transition-all">
            Live Sandbox
          </Link>
          <Link href="#features" className="hover:text-foreground transition-all">
            Features
          </Link>
          <Link href="#pricing" className="hover:text-foreground transition-all">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-10 h-10 text-muted-foreground hover:text-foreground transition-colors duration-300"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all" />
            ) : (
              <Moon className="h-5 w-5 rotate-0 scale-100 transition-all" />
            )}
          </Button>

          {session ? (
            <Button asChild className="shadow-lg shadow-primary/20">
              <Link href="/dashboard">
                Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:flex">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="shadow-lg shadow-primary/20">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   HERO SECTION
   ========================================================= */

function HeroSection() {
  return (
    <section className="relative pt-16 pb-20 overflow-hidden text-center">
      {/* Floating Ambient Glowing Blobs */}
      <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-8 animate-fade-in">
          <Sparkles className="h-3 w-3 fill-current animate-spin" style={{ animationDuration: '3s' }} />
          CRM OS Enterprise Collaborative Suite
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-tight">
          Supercharge Customer <br className="hidden md:inline" />
          Relationships with <span className="text-primary bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent italic">Intelligence.</span>
        </h1>

        <p className="max-w-3xl mx-auto text-muted-foreground text-lg sm:text-xl mb-12 leading-relaxed">
          Manage dynamic organization-wide contacts, drag-and-drop Kanban pipelines, 
          real-time SMTP logs, and automatic subdomain rewrites. Fully responsive, secure, 
          and collaborative for modern businesses.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-sm mx-auto sm:max-w-none">
          <Button asChild size="lg" className="w-full sm:w-auto shadow-xl shadow-primary/15">
            <Link href="/register">
              Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="#playground">Try Live Sandbox</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   INTERACTIVE LIVE CRM PLAYGROUND (WOW COMPONENT)
   ========================================================= */

function InteractivePlayground() {
  const [stage, setStage] = useState<"Proposal" | "Won">("Proposal");
  const [logs, setLogs] = useState<string[]>([
    "🟢 System initialized. Standing by for deal activity...",
  ]);
  const [notification, setNotification] = useState<{ title: string; desc: string; type: string } | null>(null);

  const triggerTransition = () => {
    if (stage === "Proposal") {
      setStage("Won");
      setLogs((prev) => [
        `📧 [SMTP Log] Sent to client: "Congratulations! Deal Acme Corp moved to won."`,
        `🛡️ [Audit Log] USER "John Doe" (admin) modified Deal "Acme Corp" status to "Won".`,
        `📈 [Activity Feed] Deal "Acme Corp" ($120,000) was successfully won.`,
        ...prev,
      ]);
      setNotification({
        title: "Deal moved to Won",
        desc: "Acme Corp ($120,000) stage finalized.",
        type: "deal",
      });
    } else {
      setStage("Proposal");
      setLogs((prev) => [
        `🛡️ [Audit Log] USER "John Doe" (admin) reset Deal "Acme Corp" status to "Proposal".`,
        `📈 [Activity Feed] Deal "Acme Corp" shifted back to negotiating stages.`,
        ...prev,
      ]);
      setNotification(null);
    }
  };

  return (
    <section id="playground" className="py-20 bg-muted/20 border-y border-border/30 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-black mb-4">
            Experience the <span className="text-primary">Collaborative Engine</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Test the live simulator below. Toggle the deal pipeline stage to see SMTP notifications, 
            organization activity feeds, and security audit logs dynamically synchronize.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch max-w-6xl mx-auto">
          {/* Left Side: Mock Kanban & Toggle */}
          <div className="lg:col-span-5 flex flex-col justify-between p-8 rounded-3xl border bg-card relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="text-[10px] bg-primary/10 text-primary font-black uppercase px-2.5 py-1 rounded-full border border-primary/20 tracking-wider">
                CRM Simulator
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Deal Pipeline</h3>
              <p className="text-xs text-muted-foreground mb-6">
                Drag-and-drop simulated. Click the toggle to won/negotiation.
              </p>

              {/* Deal Card Simulation */}
              <div className="border border-border/50 rounded-2xl p-5 bg-background/50 backdrop-blur-sm shadow-md hover:border-primary/30 transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Acme Corporation
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    stage === "Won" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-primary/10 text-primary border border-primary/20"
                  }`}>
                    {stage}
                  </span>
                </div>
                <h4 className="text-2xl font-black tracking-tight mb-1">$120,000</h4>
                <p className="text-[11px] text-muted-foreground mb-4">Enterprise CRM Suite contract</p>
                
                {/* Simulated Owner */}
                <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                  <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-[10px] font-bold">JD</div>
                  <span className="text-[11px] text-muted-foreground">Owned by John Doe (Admin)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/30">
              <Button onClick={triggerTransition} className="w-full font-bold shadow-lg shadow-primary/20 group">
                {stage === "Proposal" ? "Finalize & Win Deal" : "Reset Deal to Negotiation"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Right Side: Log Monitor / Notifications */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Live Bell Notification dropdown preview */}
            {notification && (
              <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center gap-4 animate-in">
                <div className="p-3 bg-primary rounded-xl text-primary-foreground">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-bold text-foreground">{notification.title}</h5>
                  <p className="text-xs text-muted-foreground">{notification.desc}</p>
                </div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Just Now</span>
              </div>
            )}

            {/* Simulated Live Console */}
            <div className="flex-1 p-6 rounded-3xl border bg-black text-lime-400 font-mono text-xs flex flex-col justify-between shadow-2xl min-h-[300px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 text-white font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs font-bold text-muted-foreground ml-2">Console Monitor</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Live System Feed
                  </span>
                </div>

                <div className="space-y-2.5 overflow-y-auto max-h-[240px] pr-2">
                  {logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed animate-fade-in break-words">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 text-[10px] text-muted-foreground font-sans">
                Activity records are pushed instantly through custom Mongoose schemas.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FEATURES GRID (ALL CRM FEATURES OUTLINED)
   ========================================================= */

function FeaturesSection() {
  const features = [
    {
      icon: Building,
      title: "Multi-Tenant Workspace Scoping",
      desc: "Isolate client records into corporate scopes. Toggle permissions to share accounts team-wide or restrict views globally.",
    },
    {
      icon: Bell,
      title: "Interactive Notification Center",
      desc: "Live status upgrades (Deal Won, Lead Assigned) aggregated into a navbar drop-menu. Dynamic scan of upcoming due tasks.",
    },
    {
      icon: Key,
      title: "RBAC & Security Audit Logs",
      desc: "Granular access limits based on user role. Admin-only dashboard tracks chronological action histories and client IP records.",
    },
    {
      icon: Activity,
      title: "Live Activity Timelines",
      desc: "Stay updated with real-time modifications made to contacts, tasks, and deal stages. Chronological collaborative logs.",
    },
    {
      icon: MessageSquare,
      title: "Comments & Discussions",
      desc: "Engage teams with post comments directly embedded into contact, deal, and task management modals.",
    },
    {
      icon: Mail,
      title: "SMTP Transactional Emails",
      desc: "Automatic simulation logs printed to console/database upon critical deal shifts, ensuring clients receive email notifications.",
    },
    {
      icon: MousePointer,
      title: "Drag-and-Drop Pipeline",
      desc: "Fluidly rearrange items across Deals Kanban lanes, Task priorities, and Calendar slots using robust dragging frameworks.",
    },
    {
      icon: Calendar,
      title: "Three-Way Calendar View",
      desc: "Switch between Month view, Week view, or structural Agenda layouts to monitor sales schedules and customer dates.",
    },
    {
      icon: Filter,
      title: "Custom Saved Filters",
      desc: "Filter and store customized database queries (e.g. 'My Leads', 'High Value Deals', 'Overdue Tasks') for instant recovery.",
    },
    {
      icon: FileSpreadsheet,
      title: "Spreadsheet Importers",
      desc: "Bulk upload contacts from raw CSV layouts, export forecasts to Excel spreadsheets, and trigger system updates.",
    },
    {
      icon: Globe,
      title: "Subdomain Routing rewrite",
      desc: "Dynamic hostname parsing rewritten internally. Redirects john.crm.com case-insensitively to customized welcome gateways.",
    },
    {
      icon: Shield,
      title: "Enterprise Grade Cryptography",
      desc: "Strict NextAuth session middleware protecting client routes and database endpoints from unauthorized requests.",
    },
  ];

  return (
    <section id="features" className="py-24 bg-muted/10 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h3 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
            Designed for <span className="text-primary">Collaborative Scaling</span>
          </h3>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm sm:text-base">
            CRM OS provides robust features designed to align sales teams, secure records, 
            and automate relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-8 rounded-3xl border border-border/50 bg-card hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group">
      <div className="p-3 w-fit rounded-2xl bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
        <Icon className="h-6 w-6" />
      </div>
      <h4 className="text-xl font-bold mb-3 text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{desc}</p>
    </div>
  );
}

/* =========================================================
   STATS SECTION
   ========================================================= */

function StatsSection() {
  const stats = [
    { label: "Active Enterprise Teams", val: "10,000+" },
    { label: "Deals Automated", val: "$1.2 Billion" },
    { label: "Client SLA Uptime", val: "99.99%" },
    { label: "Average Growth Yield", val: "42%" },
  ];

  return (
    <section className="py-20 border-y border-border/30 bg-muted/20 relative">
      <div className="container mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
        {stats.map((stat, i) => (
          <div key={i} className="space-y-2">
            <div className="text-3xl sm:text-5xl font-black tracking-tight text-primary">
              {stat.val}
            </div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   PRICING SECTION
   ========================================================= */

function PricingSection() {
  const plans = [
    {
      name: "Starter Bundle",
      price: "0",
      desc: "Perfect for single operators tracking local activities.",
      features: [
        "Up to 1,000 Active Contacts",
        "Visual Deals Kanban Board",
        "Basic Notifications & Bell Dropdown",
        "Standard Light / Dark Theme Toggle",
      ],
    },
    {
      name: "Professional Plan",
      price: "49",
      desc: "For growing teams that need cross-company collaborative sharing.",
      featured: true,
      features: [
        "Unlimited Scoped Contacts & Deals",
        "Drag-and-Drop Calendar Schedule",
        "Dynamic Task Due Reminders",
        "Collaborative Discussion Threads",
        "Mock SMTP Pipeline Logging",
        "CSV & Excel Sheet Syncing",
      ],
    },
    {
      name: "Enterprise Instance",
      price: "199",
      desc: "Ultimate workspace mapping and security controls.",
      features: [
        "Custom Tenant Subdomains (john.crm.com)",
        "Chronological Security Audit Logs",
        "Role-Based Permission (RBAC) Controls",
        "Dedicated Multi-Tenant Databases",
        "Priority 24/7/365 Developer Help",
        "Custom Transactional Email Integrations",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h3 className="text-4xl sm:text-5xl font-black mb-4">
            Transparent, <span className="text-primary">Predictable Pricing</span>
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base">
            Align your team&apos;s workflow, unlock subdomains, and monitor pipeline statistics. 
            Choose the tier that matches your company&apos;s growth rate.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <PricingCard key={i} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  name,
  price,
  desc,
  features,
  featured,
}: {
  name: string;
  price: string;
  desc: string;
  features: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={`p-8 rounded-3xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
        featured
          ? "border-primary bg-primary/[0.03] shadow-xl shadow-primary/5 scale-105 z-10"
          : "border-border/50 bg-card"
      }`}
    >
      {featured && (
        <div className="absolute top-0 right-0 p-4">
          <span className="text-[9px] bg-primary text-primary-foreground font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
            Most Popular
          </span>
        </div>
      )}

      <div>
        <h4 className="text-2xl font-black mb-2 text-foreground">{name}</h4>
        <p className="text-xs text-muted-foreground mb-6 min-h-[32px]">{desc}</p>
        
        <div className="flex items-baseline gap-1 mb-8">
          <span className="text-5xl font-black tracking-tight text-foreground">${price}</span>
          <span className="text-xs font-bold text-muted-foreground">/ month</span>
        </div>

        <ul className="space-y-4 mb-8">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button asChild variant={featured ? "default" : "outline"} className="w-full font-bold">
        <Link href="/register">Get Started Now</Link>
      </Button>
    </div>
  );
}

/* =========================================================
   CTA SECTION
   ========================================================= */

function CTASection() {
  return (
    <section className="py-24 text-center relative overflow-hidden">
      {/* Decorative Blur BG */}
      <div className="pointer-events-none absolute inset-0 bg-primary/[0.02] border-y border-border/30" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 relative z-10 max-w-4xl">
        <h2 className="text-4xl sm:text-6xl font-black mb-8 leading-tight tracking-tight">
          Ready to scale with <span className="text-primary italic">intelligence?</span>
        </h2>
        <p className="max-w-2xl mx-auto text-muted-foreground text-sm sm:text-base mb-10 leading-relaxed">
          Create an enterprise workspace today. Add collaborative teammates, organize your deal streams, 
          and track communications instantly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-sm mx-auto sm:max-w-none">
          <Button asChild size="lg" className="w-full sm:w-auto shadow-xl shadow-primary/20">
            <Link href="/register">Start for Free</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/login">Login to Workspace</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FOOTER COMPONENT
   ========================================================= */

function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border/30 py-16 relative z-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <Logo />
        
        <p className="text-xs text-muted-foreground text-center md:text-right">
          © 2026 CRM OS Inc. All rights reserved. Designed to supercharge workflows.
        </p>
      </div>
    </footer>
  );
}

/* =========================================================
   REUSABLE LOGO (Glow & Gradient)
   ========================================================= */

function Logo() {
  return (
    <div className="flex items-center gap-3 cursor-pointer select-none">
      <div className="w-10 h-10 bg-gradient-to-tr from-primary to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
        <span className="text-white font-black text-xl italic leading-none">
          C
        </span>
      </div>
      <span className="text-xl font-black tracking-tight text-foreground">
        CRM<span className="text-primary bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">OS</span>
      </span>
    </div>
  );
}
