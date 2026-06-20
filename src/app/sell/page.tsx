"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Globe,
  Headphones,
  ShieldCheck,
  Store,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";

const BENEFITS = [
  {
    icon: Store,
    title: "Reach millions of buyers",
    description: "List your products on Gift Factory and get in front of customers searching for gifts and more.",
  },
  {
    icon: Truck,
    title: "Fulfilment & shipping",
    description: "Focus on your products. We help with discovery, payments and optional fulfilment support.",
  },
  {
    icon: BarChart3,
    title: "Grow your business",
    description: "Use seller tools and reports to understand demand and scale with confidence.",
  },
  {
    icon: ShieldCheck,
    title: "Secure payments",
    description: "Get paid on time with secure processing. We handle disputes and chargebacks.",
  },
];

const STEPS = [
  { step: 1, title: "Register as a seller", body: "Sign up with your business details and complete verification." },
  { step: 2, title: "List your products", body: "Add your catalogue with images, pricing and inventory." },
  { step: 3, title: "Receive orders", body: "Get notified when customers order. Pack and ship on time." },
  { step: 4, title: "Get paid", body: "We transfer your earnings to your bank account on schedule." },
];

export default function SellPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/20" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-4">
              Become a supplier
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Sell on Gift Factory
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Join thousands of sellers reaching customers across the country. List your products, manage orders, and grow your business with us.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link href="https://vendor.giftfactory.com/login">
                  Start selling
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                <Link href="#how-it-works">How it works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Why sell with us?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to start and grow your seller account.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {BENEFITS.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="rounded-full bg-primary/10 text-primary w-12 h-12 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From registration to payouts in four simple steps.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {STEPS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="https://vendor.giftfactory.com/login">
                Register now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Support & trust */}
      <section className="py-16 md:py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 text-primary w-14 h-14 flex items-center justify-center shrink-0">
                <Headphones className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Seller support</h3>
                <p className="text-sm text-muted-foreground">
                  Dedicated help for onboarding, listing and order management.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 text-primary w-14 h-14 flex items-center justify-center shrink-0">
                <Globe className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Wide reach</h3>
                <p className="text-sm text-muted-foreground">
                  Your products visible to shoppers across the platform.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 text-primary w-14 h-14 flex items-center justify-center shrink-0">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Trusted marketplace</h3>
                <p className="text-sm text-muted-foreground">
                  Buyers trust Gift Factory. Join a growing community of sellers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to start selling?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Create your seller account in minutes. No upfront fees to list.
          </p>
          <Button size="lg" className="rounded-full px-10 text-base" asChild>
            <Link href="https://vendor.giftfactory.com/login">
              Become a supplier
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
