import Link from "next/link";
import { Briefcase, MapPin, Clock } from "lucide-react";

const openings = [
  {
    title: "Senior Backend Engineer",
    department: "Engineering",
    location: "Bangalore, India",
    type: "Full-time",
    description:
      "Build and scale our core platform services using Node.js, NestJS, and MongoDB. Own features end-to-end in a fast-moving environment.",
  },
  {
    title: "Frontend Engineer (React / Next.js)",
    department: "Engineering",
    location: "Remote (India)",
    type: "Full-time",
    description:
      "Craft beautiful, performant user interfaces. You will work closely with design and product to ship experiences that delight our customers.",
  },
  {
    title: "Product Manager",
    department: "Product",
    location: "Bangalore, India",
    type: "Full-time",
    description:
      "Define, prioritise, and ship product improvements across our buyer and seller experiences. Data-driven mindset required.",
  },
  {
    title: "Growth Marketing Manager",
    department: "Marketing",
    location: "Mumbai, India",
    type: "Full-time",
    description:
      "Own our acquisition and retention channels — email, SEO, paid, influencer. Scale what works, experiment relentlessly.",
  },
  {
    title: "Customer Success Associate",
    department: "Operations",
    location: "Remote (India)",
    type: "Full-time",
    description:
      "Be the voice of Gift Factory. Help our customers resolve issues quickly and leave every interaction feeling great.",
  },
  {
    title: "Data Analyst",
    department: "Analytics",
    location: "Bangalore, India",
    type: "Full-time",
    description:
      "Turn raw data into actionable insights. Work with leadership and product teams to guide key decisions.",
  },
];

const perks = [
  { emoji: "🏖️", label: "Flexible PTO" },
  { emoji: "🏠", label: "Remote-friendly" },
  { emoji: "📚", label: "Learning budget" },
  { emoji: "🏥", label: "Health insurance" },
  { emoji: "💻", label: "Home-office setup" },
  { emoji: "🎁", label: "Employee discounts" },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#232f3e] to-[#37475a] text-white py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Work at Gift Factory</h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            We are building the future of gifting and e-commerce in India. Join a small, ambitious
            team that moves fast, ships often, and has fun doing it.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Why join us?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {perks.map((p) => (
              <div
                key={p.label}
                className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100"
              >
                <div className="text-3xl mb-2">{p.emoji}</div>
                <div className="text-sm font-medium text-gray-700">{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Openings */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Open Positions</h2>
          <div className="space-y-4">
            {openings.map((job) => (
              <div
                key={job.title}
                className="border border-gray-200 rounded-xl p-6 hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <a
                    href="mailto:careers@giftfactory.in"
                    className="inline-block bg-primary text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-primary/90 transition-colors whitespace-nowrap"
                  >
                    Apply Now
                  </a>
                </div>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{job.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-gradient-to-br from-primary/5 to-dusty-rose/5 rounded-2xl p-8 text-center border border-primary/10">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Don&apos;t see a role that fits?
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              We&apos;re always interested in exceptional talent. Send us your resume and we&apos;ll
              keep you in mind.
            </p>
            <a
              href="mailto:careers@giftfactory.in"
              className="inline-block bg-primary text-white font-medium px-6 py-2.5 rounded-full hover:bg-primary/90 transition-colors text-sm"
            >
              Send an open application
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
