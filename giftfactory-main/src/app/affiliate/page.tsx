import Link from "next/link";
import { TrendingUp, Link2, DollarSign, BarChart2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Sign Up",
    description: "Create your free affiliate account. No approval wait — get started instantly.",
  },
  {
    number: "02",
    title: "Get Your Links",
    description:
      "Browse any product on Gift Factory and generate a unique tracking link from your dashboard.",
  },
  {
    number: "03",
    title: "Share & Earn",
    description:
      "Share links on your blog, social media, or YouTube. Earn a commission on every sale you drive.",
  },
  {
    number: "04",
    title: "Get Paid",
    description:
      "Receive monthly payouts directly to your bank account. Minimum payout ₹500.",
  },
];

const features = [
  { icon: DollarSign, title: "Up to 10% commission", desc: "Earn on every sale you refer — commissions vary by category." },
  { icon: Link2, title: "Easy link generation", desc: "One-click links for any product, category, or search page." },
  { icon: BarChart2, title: "Real-time analytics", desc: "Track clicks, conversions, and earnings in your dashboard." },
  { icon: TrendingUp, title: "Bonuses & incentives", desc: "Top affiliates get bonus payouts and early access to deals." },
];

const faqs = [
  {
    q: "Who can join the affiliate program?",
    a: "Anyone — bloggers, YouTubers, Instagram creators, WhatsApp community managers, or simply anyone with an audience. There are no traffic minimums.",
  },
  {
    q: "How long does the cookie last?",
    a: "Our tracking cookie is valid for 30 days. If a user clicks your link and purchases within 30 days, you earn the commission.",
  },
  {
    q: "When and how will I be paid?",
    a: "Payouts are processed on the 15th of each month for the previous month's confirmed commissions. Payment is via NEFT/IMPS to your registered bank account.",
  },
  {
    q: "Are there any costs to join?",
    a: "Absolutely not — joining and using the affiliate program is completely free.",
  },
];

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#232f3e] to-[#37475a] text-white py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Earn with Gift Factory</h1>
          <p className="text-lg text-gray-300 mb-8">
            Join our affiliate program and earn commissions by recommending products you love.
            Thousands of creators are already earning.
          </p>
          <a
            href="mailto:affiliate@giftfactory.in"
            className="inline-block bg-primary text-white font-semibold px-8 py-3.5 rounded-full hover:bg-primary/90 transition-colors"
          >
            Join for Free
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-primary text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
            {[
              { val: "Up to 10%", label: "Commission rate" },
              { val: "₹500", label: "Min payout" },
              { val: "30 days", label: "Cookie window" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold">{s.val}</div>
                <div className="text-sm text-white/70 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-medium">Simple Process</span>
            <h2 className="text-3xl font-bold mt-2 text-gray-900">How it works</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.number} className="text-center">
                <div className="text-5xl font-black text-primary/10 mb-3">{s.number}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Why affiliate with us?</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100 flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {faqs.map((item) => (
              <div key={item.q} className="border-b border-gray-100 pb-5">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary to-dusty-rose text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to start earning?</h2>
          <p className="text-white/80 mb-6 text-sm">
            Email us to get your affiliate account set up today.
          </p>
          <a
            href="mailto:affiliate@giftfactory.in"
            className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            Get Started
          </a>
        </div>
      </section>
    </div>
  );
}
