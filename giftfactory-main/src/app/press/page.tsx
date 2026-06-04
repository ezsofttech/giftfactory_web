const pressReleases = [
  {
    date: "March 2026",
    title: "Gift Factory crosses 500,000 customers milestone",
    summary:
      "India's curated gifting platform celebrates half a million registered shoppers, with 40% growth quarter-over-quarter driven by mobile adoption.",
  },
  {
    date: "January 2026",
    title: "Gift Factory launches B2B gifting suite for corporates",
    summary:
      "The new corporate gifting dashboard lets HR and procurement teams order branded gifts in bulk, with real-time tracking and invoice management.",
  },
  {
    date: "October 2025",
    title: "Gift Factory raises ₹25 crore in seed funding",
    summary:
      "Funding round led by Sequoia Surge will accelerate seller acquisition, logistics infrastructure, and technology development.",
  },
  {
    date: "July 2025",
    title: "Gift Factory onboards 10,000 artisan sellers",
    summary:
      "The platform's seller marketplace now features over 10,000 verified small businesses and artisans from across India.",
  },
];

const coverageLinks = [
  { outlet: "Economic Times", headline: "Gift Factory bets on curated e-commerce to stand out", date: "Feb 2026" },
  { outlet: "YourStory", headline: "How Gift Factory is reinventing gifting for digital-native Indians", date: "Nov 2025" },
  { outlet: "Inc42", headline: "Seed-funded Gift Factory eyes tier-2 expansion", date: "Oct 2025" },
  { outlet: "The Hindu BusinessLine", headline: "Artisan sellers find a home on Gift Factory's marketplace", date: "Aug 2025" },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#232f3e] to-[#37475a] text-white py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Press & Media</h1>
          <p className="text-lg text-gray-300">
            News, announcements, and resources for journalists and media professionals.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Press Releases */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Press Releases</h2>
              <div className="space-y-6">
                {pressReleases.map((pr) => (
                  <div
                    key={pr.title}
                    className="border-l-4 border-primary pl-5 py-1"
                  >
                    <span className="text-xs font-medium text-primary uppercase tracking-wide">
                      {pr.date}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-2">{pr.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{pr.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Media Coverage */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Media Coverage</h2>
              <div className="space-y-3">
                {coverageLinks.map((item) => (
                  <div
                    key={item.headline}
                    className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-gray-50 transition-all"
                  >
                    <div>
                      <span className="text-xs font-semibold text-primary">{item.outlet}</span>
                      <p className="text-sm text-gray-800 mt-0.5">{item.headline}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Press Kit */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Press Kit</h3>
              <p className="text-sm text-gray-600 mb-4">
                Download our logo, brand guidelines, and high-resolution images.
              </p>
              <a
                href="mailto:press@giftfactory.in"
                className="block w-full text-center bg-primary text-white text-sm font-medium py-2.5 rounded-full hover:bg-primary/90 transition-colors"
              >
                Request Press Kit
              </a>
            </div>

            {/* Media Contact */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Media Contact</h3>
              <p className="text-sm text-gray-600 mb-1">For press inquiries:</p>
              <a
                href="mailto:press@giftfactory.in"
                className="text-sm text-primary font-medium hover:underline"
              >
                press@giftfactory.in
              </a>
              <p className="text-xs text-gray-400 mt-2">
                We respond to all media requests within 24 hours.
              </p>
            </div>

            {/* Key Facts */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Key Facts</h3>
              <dl className="space-y-3 text-sm">
                {[
                  ["Founded", "2022"],
                  ["Headquarters", "Bangalore, India"],
                  ["Customers", "500,000+"],
                  ["Sellers", "10,000+"],
                  ["Categories", "50+"],
                ].map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="text-gray-500">{key}</dt>
                    <dd className="font-medium text-gray-900">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
