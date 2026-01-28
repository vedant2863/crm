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
    Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
    const { data: session } = useSession();

    return (
        <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20">
            {/* Navigation */}
            <header className="fixed top-0 w-full z-50 border-b border-white/10 dark:border-primary/10 bg-background/60 backdrop-blur-xl">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 rotate-6 group-hover:rotate-0 transition-transform">
                            <span className="text-primary-foreground font-black text-xl italic tracking-tighter">C</span>
                        </div>
                        <span className="text-2xl font-black tracking-tighter">CRM<span className="text-primary">OS</span></span>
                    </div>
                    <nav className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <a href="#features" className="hover:text-primary transition-all hover:tracking-[0.2em]">Features</a>
                        <a href="#about" className="hover:text-primary transition-all hover:tracking-[0.2em]">About</a>
                        <a href="#pricing" className="hover:text-primary transition-all hover:tracking-[0.2em]">Pricing</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        {session ? (
                            <Button asChild variant="default" className="rounded-2xl h-11 px-8 font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost" className="hidden md:flex rounded-2xl h-11 px-8 font-bold">
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button asChild variant="default" className="rounded-2xl h-11 px-8 font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                    <Link href="/register">Get Started</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-16">
                {/* Hero Section */}
                <section className="relative py-24 lg:py-40 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
                        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[160px] -mr-64 -mt-32 animate-pulse" />
                        <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[160px] -ml-64 -mb-32 animate-pulse" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <Zap className="h-3 w-3 fill-current" />
                            Revolutionizing Customer Relationships
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-foreground/40 leading-[0.95] drop-shadow-sm">
                            Manage your business <br /> with <span className="text-primary italic">Intelligence.</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-muted-foreground text-xl lg:text-2xl mb-12 leading-relaxed font-medium">
                            CRM OS is the modern platform built for high-growth teams. Track deals,
                            manage contacts, and automate your workflow in one beautiful interface.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Button asChild size="lg" className="w-full sm:w-auto rounded-2xl h-16 px-12 text-xl font-black shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                                <Link href="/register">Start for free <ArrowRight className="ml-2 h-6 w-6" /></Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-2xl h-16 px-12 text-xl font-bold hover:bg-muted/50 transition-all border-2">
                                <Link href="#features">See features</Link>
                            </Button>
                        </div>

                        <div className="mt-32 relative px-4 max-w-6xl mx-auto group">
                            <div className="absolute inset-0 bg-primary/20 blur-[120px] opacity-20 transform group-hover:scale-110 transition-transform duration-1000" />
                            <div className="relative border-4 border-white/10 rounded-[3rem] overflow-hidden shadow-3xl bg-card transition-all duration-700 group-hover:border-primary/30 group-hover:shadow-primary/10">
                                <img
                                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426"
                                    alt="Dashboard Preview"
                                    className="w-full h-auto opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-[1.02]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-32 bg-muted/30 relative">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-3xl mx-auto mb-24">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-6">Core Capabilities</h2>
                            <h3 className="text-5xl lg:text-6xl font-black tracking-tight mb-8">Everything you need to <span className="text-primary italic">scale</span> your sales.</h3>
                            <p className="text-muted-foreground text-xl font-medium leading-relaxed">
                                We've built CRM OS to be powerful yet incredibly simple to use. Focus on closing, not configuration.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                {
                                    icon: Users,
                                    title: "Smart Contacts",
                                    desc: "Keep all your communication history and customer details organized in one searchable place.",
                                    color: "bg-blue-500"
                                },
                                {
                                    icon: Target,
                                    title: "Deal Pipeline",
                                    desc: "Visual Kanban boards to track your sales process from lead to closed won with automated insights.",
                                    color: "bg-emerald-500"
                                },
                                {
                                    icon: BarChart3,
                                    title: "Advanced Analytics",
                                    desc: "Real-time reports on conversion rates, revenue forecasts, and team performance metrics.",
                                    color: "bg-violet-500"
                                },
                                {
                                    icon: Zap,
                                    title: "Workflow Automation",
                                    desc: "Automate repetitive tasks and follow-ups so you can focus on building relationships.",
                                    color: "bg-amber-500"
                                },
                                {
                                    icon: Shield,
                                    title: "Enterprise Security",
                                    desc: "Your data is encrypted and protected with industry-leading security standards and 2FA.",
                                    color: "bg-rose-500"
                                },
                                {
                                    icon: Globe,
                                    title: "Global Collaboration",
                                    desc: "Built for distributed teams with real-time updates and seamless communication tools.",
                                    color: "bg-cyan-500"
                                }
                            ].map((feature, i) => (
                                <div key={i} className="group p-10 rounded-[2.5rem] border border-white/5 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2">
                                    <div className={`w-16 h-16 rounded-2xl ${feature.color}/10 flex items-center justify-center ${feature.color.replace('bg-', 'text-')} mb-8 transition-all group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg shadow-${feature.color}/20`}>
                                        <feature.icon className="h-8 w-8" />
                                    </div>
                                    <h4 className="text-2xl font-black mb-4 tracking-tight">{feature.title}</h4>
                                    <p className="text-muted-foreground leading-relaxed font-medium">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About/Stats Section */}
                <section id="about" className="py-32 border-y border-white/5 bg-background relative overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                            {[
                                { label: "Active Users", val: "10k+" },
                                { label: "Deals Managed", val: "$1.2B" },
                                { label: "CSAT Score", val: "99.9%" },
                                { label: "Uptime", val: "100%" }
                            ].map((stat, i) => (
                                <div key={i} className="text-center group">
                                    <div className="text-5xl lg:text-7xl font-black tracking-tighter text-primary mb-3 italic group-hover:scale-110 transition-transform duration-500">{stat.val}</div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-32 relative overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-3xl mx-auto mb-24">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-6">Simple Pricing</h2>
                            <h3 className="text-5xl lg:text-6xl font-black tracking-tight mb-8">Choose the plan that's right for your <span className="text-primary italic">growth</span>.</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {[
                                { name: "Starter", price: "0", desc: "Perfect for solopreneurs", features: ["1,000 Contacts", "3 Active Deals", "Basic Analytics", "Community Support"] },
                                { name: "Professional", price: "49", featured: true, desc: "For fast-growing teams", features: ["Unlimited Contacts", "Unlimited Deals", "Advanced Analytics", "Priority Email Support", "Workflow Automation"] },
                                { name: "Enterprise", price: "199", desc: "For large organizations", features: ["Custom Roles & Permissions", "SAML SSO", "Dedicated Account Manager", "24/7 Phone Support", "Custom API Access"] }
                            ].map((plan, i) => (
                                <div key={i} className={`relative p-10 rounded-[2.5rem] border ${plan.featured ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10' : 'border-white/5 bg-card'} flex flex-col`}>
                                    {plan.featured && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full">
                                            Most Popular
                                        </div>
                                    )}
                                    <h4 className="text-2xl font-black mb-2 tracking-tight">{plan.name}</h4>
                                    <p className="text-muted-foreground text-sm font-medium mb-8 leading-relaxed">{plan.desc}</p>
                                    <div className="flex items-baseline gap-1 mb-10">
                                        <span className="text-5xl font-black tracking-tighter">${plan.price}</span>
                                        <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">/mo</span>
                                    </div>
                                    <ul className="space-y-4 mb-12 flex-1">
                                        {plan.features.map((feature, j) => (
                                            <li key={j} className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button asChild variant={plan.featured ? 'default' : 'outline'} className={`w-full rounded-2xl h-14 font-black text-lg ${plan.featured ? 'shadow-xl shadow-primary/20 hover:scale-105 active:scale-95' : 'hover:bg-muted'}`}>
                                        <Link href="/register">Get Started</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 relative">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="relative rounded-[3.5rem] overflow-hidden bg-primary px-8 py-24 text-center text-primary-foreground shadow-[0_40px_100px_-20px_rgba(var(--primary),0.4)]">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/20 rounded-full -mr-48 -mt-48 blur-[80px] animate-pulse" />
                            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/20 rounded-full -ml-48 -mb-48 blur-[80px] animate-pulse" />

                            <div className="relative z-10 max-w-3xl mx-auto">
                                <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-10 leading-[0.9]">
                                    Ready to take your business to the <span className="text-black italic">next level?</span>
                                </h2>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                    <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto rounded-2xl h-18 px-14 text-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-2xl">
                                        <Link href="/register">Create free account</Link>
                                    </Button>
                                    <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto rounded-2xl h-18 px-14 text-2xl font-bold hover:bg-white/10 text-primary-foreground transition-all">
                                        <Link href="/login">Schedule Demo</Link>
                                    </Button>
                                </div>
                                <p className="mt-10 text-white/70 text-sm font-bold uppercase tracking-widest">
                                    No credit card required. 14-day free trial.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-muted/50 border-t border-white/5 py-32">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex justify-center mb-10">
                        <div className="flex items-center gap-2.5 group cursor-pointer">
                            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-6 group-hover:rotate-0 transition-transform">
                                <span className="text-primary-foreground font-black text-xl italic">C</span>
                            </div>
                            <span className="text-2xl font-black tracking-tighter">CRM<span className="text-primary">OS</span></span>
                        </div>
                    </div>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto mb-12 font-medium leading-relaxed">
                        The next generation CRM for modern teams. <br /> Built for speed, scaled for intelligence.
                    </p>
                    <div className="flex justify-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-4 flex-wrap">
                        <a href="#" className="hover:text-primary transition-all">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-all">Terms of Service</a>
                        <a href="#" className="hover:text-primary transition-all">Twitter / X</a>
                        <a href="#" className="hover:text-primary transition-all">LinkedIn</a>
                        <a href="#" className="hover:text-primary transition-all">Status</a>
                    </div>
                    <div className="mt-16 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">
                        © 2026 CRM OS Inc. Crafted with excellence.
                    </div>
                </div>
            </footer>
        </div>
    );
}
