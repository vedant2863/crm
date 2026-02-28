"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  CheckCircle2,
  Target,
  Users,
  Zap,
  Shield,
  BarChart3,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* =========================================================
   MAIN PAGE
========================================================= */

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 pt-16">
        <HeroSection />
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
   NAVBAR
========================================================= */

function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <Link href="#features" className="hover:text-primary transition-all">
            Features
          </Link>
          <Link href="#about" className="hover:text-primary transition-all">
            About
          </Link>
          <Link href="#pricing" className="hover:text-primary transition-all">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {session ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="default" className="hidden md:flex">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
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
   HERO
========================================================= */

function HeroSection() {
  return (
    <section className="relative py-24 lg:py-40 overflow-hidden text-center">
      <div className="container mx-auto px-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-10">
          <Zap className="h-3 w-3 fill-current" />
          Revolutionizing Customer Relationships
        </div>

        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-8">
          Manage your business <br />
          with <span className="text-primary italic">Intelligence.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-muted-foreground text-xl mb-12">
          CRM OS helps high-growth teams manage deals, contacts and automate
          workflows.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button asChild size="lg">
            <Link href="/register">
              Start for free <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg">
            <Link href="#features">See features</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FEATURES
========================================================= */

function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "Smart Contacts",
      desc: "Organize communication history and customer details.",
    },
    {
      icon: Target,
      title: "Deal Pipeline",
      desc: "Track your sales process with visual Kanban boards.",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      desc: "Real-time reports and revenue forecasts.",
    },
    {
      icon: Zap,
      title: "Workflow Automation",
      desc: "Automate repetitive tasks and follow-ups.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      desc: "Encrypted data with industry-leading standards.",
    },
    {
      icon: Globe,
      title: "Global Collaboration",
      desc: "Built for distributed teams with real-time updates.",
    },
  ];

  return (
    <section id="features" className="py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-24">
          <h3 className="text-5xl font-black mb-8">
            Everything you need to <span className="text-primary">scale</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-10 rounded-3xl border bg-card">
      <Icon className="h-8 w-8 text-primary mb-6" />
      <h4 className="text-2xl font-black mb-4">{title}</h4>
      <p className="text-muted-foreground">{desc}</p>
    </div>
  );
}

/* =========================================================
   STATS
========================================================= */

function StatsSection() {
  const stats = [
    { label: "Active Users", val: "10k+" },
    { label: "Deals Managed", val: "$1.2B" },
    { label: "CSAT Score", val: "99.9%" },
    { label: "Uptime", val: "100%" },
  ];

  return (
    <section id="about" className="py-32 border-y">
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
        {stats.map((stat, i) => (
          <div key={i}>
            <div className="text-5xl font-black text-primary mb-3">
              {stat.val}
            </div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   PRICING
========================================================= */

function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "0",
      features: ["1,000 Contacts", "3 Deals", "Basic Analytics"],
    },
    {
      name: "Professional",
      price: "49",
      featured: true,
      features: [
        "Unlimited Contacts",
        "Unlimited Deals",
        "Workflow Automation",
      ],
    },
    {
      name: "Enterprise",
      price: "199",
      features: ["Custom Roles", "SSO", "24/7 Support"],
    },
  ];

  return (
    <section id="pricing" className="py-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
  features,
  featured,
}: {
  name: string;
  price: string;
  features: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={`p-10 rounded-3xl border flex flex-col ${
        featured ? "border-primary bg-primary/5" : "bg-card"
      }`}
    >
      <h4 className="text-2xl font-black mb-6">{name}</h4>
      <div className="text-5xl font-black mb-8">${price}</div>

      <ul className="space-y-4 mb-10 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {feature}
          </li>
        ))}
      </ul>

      <Button asChild variant={featured ? "default" : "outline"}>
        <Link href="/register">Get Started</Link>
      </Button>
    </div>
  );
}

/* =========================================================
   CTA
========================================================= */

function CTASection() {
  return (
    <section className="py-32 text-center bg-primary text-primary-foreground">
      <h2 className="text-5xl font-black mb-10">
        Ready to take your business to the next level?
      </h2>
      <Button asChild size="lg" variant="secondary">
        <Link href="/register">Create free account</Link>
      </Button>
    </section>
  );
}

/* =========================================================
   FOOTER
========================================================= */

function Footer() {
  return (
    <footer className="bg-muted/50 py-20 text-center">
      <Logo />
      <p className="text-muted-foreground mt-6">
        © 2026 CRM OS Inc. Built for modern teams.
      </p>
    </footer>
  );
}

/* =========================================================
   LOGO (Reusable)
========================================================= */

function Logo() {
  return (
    <div className="flex items-center gap-2 cursor-pointer">
      <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
        <span className="text-primary-foreground font-black text-xl italic">
          C
        </span>
      </div>
      <span className="text-2xl font-black">
        CRM<span className="text-primary">OS</span>
      </span>
    </div>
  );
}
