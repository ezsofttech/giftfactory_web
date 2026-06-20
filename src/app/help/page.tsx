"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  Mail,
  Package,
  CreditCard,
  Truck,
  User,
  Store,
  Search,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TOPIC_LINKS = [
  {
    icon: Package,
    title: "Orders",
    description: "Track, cancel or modify your orders",
    href: "/help#orders",
  },
  {
    icon: Truck,
    title: "Shipping & Delivery",
    description: "Delivery times, tracking and addresses",
    href: "/help#shipping",
  },
  {
    icon: FileText,
    title: "Returns & Refunds",
    description: "Return policy and refund process",
    href: "/help#returns",
  },
  {
    icon: User,
    title: "Account",
    description: "Login, profile and security",
    href: "/help#account",
  },
  {
    icon: CreditCard,
    title: "Payments",
    description: "Payment methods and billing",
    href: "/help#payments",
  },
  {
    icon: Store,
    title: "Selling",
    description: "Become a supplier and list products",
    href: "/sell",
  },
];

const FAQ_BY_TOPIC: { id: string; title: string; questions: { q: string; a: string }[] }[] = [
  {
    id: "orders",
    title: "Orders",
    questions: [
      {
        q: "How do I track my order?",
        a: "After your order ships, you’ll get an email with a tracking link. You can also go to Your Orders, select the order and view tracking there.",
      },
      {
        q: "How can I cancel or change my order?",
        a: "If the order hasn’t shipped, you can cancel it from Your Orders. Select the order and choose Cancel order. To change address or items, cancel and place a new order if it’s still before shipping.",
      },
      {
        q: "Why don’t I see my order in my account?",
        a: "Orders can take a few minutes to show. If you checked out as a guest, they won’t appear in Your Orders; use the link in your confirmation email to track.",
      },      {
        q: "Can I modify my order after placing it?",
        a: "If your order hasn't been processed or shipped, you can cancel it and place a new one with the desired changes. However, if it's already in the packing/shipping stage, modifications aren't possible.",
      },    ],
  },
  {
    id: "shipping",
    title: "Shipping & Delivery",
    questions: [
      {
        q: "What are the delivery options and charges?",
        a: "We offer standard and express delivery. Charges depend on order value and destination. Free delivery may apply on orders above a certain amount. Check the product and checkout pages for options.",
      },
      {
        q: "How long does delivery take?",
        a: "Standard delivery is typically 3–7 business days. Express options are faster. Exact dates are shown at checkout and in your order confirmation.",
      },
      {
        q: "How do I update my delivery address?",
        a: "You can manage addresses in Your Account → Addresses. For an order that hasn’t shipped, cancel and reorder with the correct address, or contact support.",
      },      {
        q: "Do you deliver to all areas?",
        a: "We deliver to most cities and towns across India. Check the delivery address field during checkout to see if your location is serviceable. If not shown, contact support for assistance.",
      },    ],
  },
  {
    id: "returns",
    title: "Returns & Refunds",
    questions: [
      {
        q: "What is your return policy?",
        a: "Most items can be returned within 30 days of delivery in unused condition with original packaging. Some categories may have different rules; check the product page.",
      },
      {
        q: "How do I start a return?",
        a: "Go to Your Orders, select the order and choose Return or replace items. Follow the steps and print the return label if provided. Pack the item and ship it back.",
      },
      {
        q: "When will I get my refund?",
        a: "Refunds are processed after we receive and inspect the return. It usually takes 5–10 business days for the amount to appear in your account.",
      },
      {
        q: "Can I return an item if it's been used or opened?",
        a: "Items must be in unused condition with original packaging and tags intact. If an item is used, damaged, or packaging is opened, returns may not be accepted. Contact support for special cases.",
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    questions: [
      {
        q: "How do I reset my password?",
        a: "On the sign-in page, click Forgot password and enter your email. We’ll send a link to reset your password.",
      },
      {
        q: "How do I update my profile or email?",
        a: "Sign in and go to Profile or Account settings. You can update your name, email and other details there.",
      },
      {
        q: "Is my data secure?",
        a: "We use industry-standard security to protect your account and payment details. Never share your password or OTP with anyone.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Account settings, click on Account preferences or Privacy settings, and look for Delete account. This will permanently remove your account and data. Contact support if you need assistance.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept major credit and debit cards, net banking, UPI and other methods shown at checkout.",
      },
      {
        q: "Is it safe to pay on Gift Factory?",
        a: "Yes. Payments are processed securely. We don’t store your full card details on our servers.",
      },
      {
        q: "I was charged but my order didn’t place. What do I do?",
        a: "If money was debited, it’s usually held and released back in 5–10 days. If not, contact us with your order ID and payment reference and we’ll help.",
      },      {
        q: "Can I save my payment method for future orders?",
        a: "Yes. During checkout, you can opt to save your card or UPI details securely for faster checkout next time. You can manage saved payment methods in Account settings.",
      },    ],
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg p-4 md:p-5 hover:border-primary/40 hover:shadow-md transition-all">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="font-semibold text-foreground text-base leading-snug">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-4 pt-4 border-t border-border/50 text-muted-foreground text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  const [search, setSearch] = useState("");

  const filteredTopics = search.trim()
    ? FAQ_BY_TOPIC.map((topic) => ({
        ...topic,
        questions: topic.questions.filter(
          (faq) =>
            faq.q.toLowerCase().includes(search.toLowerCase()) ||
            faq.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((t) => t.questions.length > 0)
    : FAQ_BY_TOPIC;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Help Center
          </h1>
          <p className="text-muted-foreground mb-6 max-w-xl">
            Find answers about orders, returns, shipping, account and more.
          </p>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for help (e.g. track order, return, refund)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-lg bg-background border-border"
              aria-label="Search help articles"
            />
          </div>
        </div>
      </section>

      {/* Topic quick links */}
      {!search.trim() && (
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-semibold text-foreground mb-6">Browse by topic</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOPIC_LINKS.map((item) => (
                <Link key={item.title} href={item.href}>
                  <Card className="h-full transition-colors hover:border-primary/40 hover:shadow-md">
                    <CardContent className="p-5 flex gap-4">
                      <div className="rounded-full bg-primary/10 text-primary w-10 h-10 flex items-center justify-center shrink-0">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ by topic */}
      <section className={`py-10 md:py-14 ${!search.trim() ? 'border-t border-border' : ''}`}>
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            {search.trim() ? `Search Results for "${search}"` : 'Frequently asked questions'}
          </h2>
          <div className="space-y-12">
            {filteredTopics.map((topic) => (
              <div key={topic.id} id={topic.id}>
                <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary"></div>
                  {topic.title}
                </h3>
                <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4">
                  {topic.questions.map((faq, i) => (
                    <FaqItem key={i} question={faq.q} answer={faq.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {filteredTopics.length === 0 && (
            <p className="text-muted-foreground">
              No results for &quot;{search}&quot;. Try different words or browse topics above.
            </p>
          )}
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 md:py-16 bg-muted/20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Still need help?</h2>
            <p className="text-muted-foreground mb-8">
              We’re here to help. Reach out and we’ll get back to you as soon as we can.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full gap-2" asChild>
                <a href="mailto:support@giftfactory.com">
                  <Mail className="h-5 w-5" />
                  Email support
                </a>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full gap-2" asChild>
                <Link href="/orders">
                  <Package className="h-5 w-5" />
                  Your orders
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
