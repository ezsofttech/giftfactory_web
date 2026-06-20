import { BarChart2, Target, Users, Zap } from "lucide-react";

const adFormats = [
  {
    title: "Sponsored Products",
    description:
      "Appear at the top of search results and category pages. Pay only when shoppers click your ad.",
    badge: "Most Popular",
    color: "border-primary/50 bg-primary/5",
  },
  {
    title: "Display Banners",
    description:
      "High-visibility banners on the homepage, category pages, and product detail pages. Multiple sizes available.",
    badge: null,
    color: "border-gray-200 bg-white",
  },
  {
    title: "Brand Store",
    description:
      "A dedicated page for your brand on Gift Factory — showcase your full catalogue, story, and videos.",
    badge: null,
    color: "border-gray-200 bg-white",
  },
  {
    title: "Newsletter Feature",
    description:
      "Get featured in our weekly newsletter sent to 100,000+ active subscribers.",
    badge: "High ROI",
    color: "border-primary/30 bg-primary/5",
  },
];

const benefits = [
  { icon: Target, title: "Precise targeting", desc: "Reach shoppers by category, location, device, and purchase intent." },
  { icon: Users, title: "Large audience", desc: "Access 500,000+ monthly active buyers across India." },
  { icon: BarChart2, title: "Transparent reporting", desc: "Real-time dashboards with impressions, clicks, spend, and ROAS." },
  { icon: Zap, title: "Fast launch", desc: "Create and activate campaigns in under 24 hours." },
];

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#232f3e] to-[#37475a] text-white py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Advertise on Gift Factory</h1>
          <p className="text-lg text-gray-300 mb-8">
            Reach millions of engaged shoppers at the moment they are ready to buy. Drive awareness,
            consideration, and sales with our suite of ad products.
          </p>
          <a
            href="mailto:advertise@giftfactory.in"
            className="inline-block bg-primary text-white font-semibold px-8 py-3.5 rounded-full hover:bg-primary/90 transition-colors"
          >
            Contact our Sales Team
          </a>
        </div>
      </section>

      {/* Audience stats */}
      <div className="bg-primary text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
            {[
              { val: "500K+", label: "Monthly active buyers" },
              { val: "2M+", label: "Product views / month" },
              { val: "100K+", label: "Newsletter subscribers" },
              { val: "50+", label: "Categories" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold">{s.val}</div>
                <div className="text-xs text-white/70 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ad formats */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-medium">Ad Products</span>
            <h2 className="text-3xl font-bold mt-2 text-gray-900">Choose the right format</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {adFormats.map((f) => (
              <div
                key={f.title}
                className={`rounded-xl p-6 border-2 relative ${f.color}`}
              >
                {f.badge && (
                  <span className="absolute top-4 right-4 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {f.badge}
                  </span>
                )}
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Why advertise with us?</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-xl p-6 border border-gray-100 flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{b.title}</h3>
                  <p className="text-sm text-gray-600">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to grow your brand?</h2>
          <p className="text-gray-600 mb-6">
            Our sales team will help you build a campaign that meets your goals and budget.
          </p>
          <a
            href="mailto:advertise@giftfactory.in"
            className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-full hover:bg-primary/90 transition-colors"
          >
            Get in Touch
          </a>
          <p className="text-sm text-gray-400 mt-4">advertise@giftfactory.in</p>
        </div>
      </section>
    </div>
  );
}
