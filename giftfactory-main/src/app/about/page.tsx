import Link from "next/link";
import { Gift, Heart, Shield, Users } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Customer First",
    description:
      "Every decision we make starts with our customers. We are committed to delivering an experience that delights, every single time.",
  },
  {
    icon: Gift,
    title: "Curated Selection",
    description:
      "From everyday essentials to one-of-a-kind gifts, we handpick products that meet our quality standards before they reach you.",
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description:
      "Secure payments, verified sellers, and a hassle-free return policy — shop with total confidence on Gift Factory.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We support thousands of small businesses and artisans across India, helping them reach customers who truly care.",
  },
];

const team = [
  { name: "Priya Sharma", role: "CEO & Co-Founder", initials: "PS" },
  { name: "Arjun Mehta", role: "CTO & Co-Founder", initials: "AM" },
  { name: "Neha Kapoor", role: "Head of Operations", initials: "NK" },
  { name: "Rohit Singh", role: "Head of Marketing", initials: "RS" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#232f3e] to-[#37475a] text-white py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">About Gift Factory</h1>
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
            We started with a simple idea — gifting should be joyful, not stressful. Today, Gift
            Factory is India&apos;s trusted destination for curated products, thoughtful gifts, and
            everyday essentials.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary text-sm font-medium">Our Story</span>
              <h2 className="text-3xl font-bold mt-2 mb-5 text-gray-900">
                Born from a love of giving
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Gift Factory was founded in 2022 by a team of product enthusiasts who believed that
                finding the perfect gift should be easy and fun. We partnered with artisans, brands,
                and sellers across India to build a curated marketplace unlike any other.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today we serve over 500,000 customers across the country, offering millions of
                products spanning fashion, electronics, home décor, beauty, and more — all backed by
                our quality promise.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-dusty-rose/10 rounded-2xl p-10 text-center">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "500K+", label: "Happy Customers" },
                  { value: "10K+", label: "Sellers" },
                  { value: "2M+", label: "Products" },
                  { value: "2022", label: "Founded" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-medium">What We Stand For</span>
            <h2 className="text-3xl font-bold mt-2 text-gray-900">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-medium">The People Behind It</span>
            <h2 className="text-3xl font-bold mt-2 text-gray-900">Our Leadership Team</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-dusty-rose flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                  {member.initials}
                </div>
                <div className="font-semibold text-gray-900">{member.name}</div>
                <div className="text-sm text-gray-500">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary to-dusty-rose text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Want to be part of our journey?</h2>
          <p className="text-white/80 mb-6">
            We&apos;re always looking for passionate people to join our team.
          </p>
          <Link
            href="/careers"
            className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            View Open Positions
          </Link>
        </div>
      </section>
    </div>
  );
}
