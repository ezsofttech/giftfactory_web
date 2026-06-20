import Link from "next/link";
import { Package, RefreshCw, Banknote, Clock } from "lucide-react";

const steps = [
  {
    icon: Package,
    title: "Initiate a Return",
    description:
      'Go to Your Orders in your account, select the item you want to return, and click "Return or Replace Items". Choose a reason and confirm.',
  },
  {
    icon: Clock,
    title: "Schedule a Pickup",
    description:
      "Once approved, our logistics partner will schedule a pickup from your doorstep within 2–3 business days. No need to visit a drop-off centre.",
  },
  {
    icon: RefreshCw,
    title: "Item is Inspected",
    description:
      "After pickup we inspect the item. Items must be unused, in original packaging, with all tags and accessories intact.",
  },
  {
    icon: Banknote,
    title: "Refund Issued",
    description:
      "Approved refunds are credited to your original payment method within 5–7 business days, or as Gift Factory credit within 24 hours.",
  },
];

const policies = [
  {
    title: "Electronics",
    window: "7 days",
    notes: "Must be sealed/unopened. Report damage on delivery within 48 hours.",
  },
  {
    title: "Clothing & Accessories",
    window: "30 days",
    notes: "Unworn with original tags. Innerwear and swimwear are non-returnable.",
  },
  {
    title: "Home & Kitchen",
    window: "30 days",
    notes: "Unused and in original packaging.",
  },
  {
    title: "Beauty & Personal Care",
    window: "10 days",
    notes: "Sealed/unused only.",
  },
  {
    title: "Books & Stationery",
    window: "15 days",
    notes: "Return only if damaged or defective.",
  },
  {
    title: "Food & Grocery",
    window: "Non-returnable",
    notes: "Report damage or wrong item within 24 hours for replacement.",
  },
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#232f3e] to-[#37475a] text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Returns & Replacements</h1>
          <p className="text-gray-300 text-lg">
            Not happy with your order? We make returns simple and hassle-free.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">How Returns Work</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="absolute top-5 left-12 h-0.5 bg-primary/20 w-[calc(100%-3rem)] hidden lg:block" />
                <span className="text-xs font-bold text-primary mb-1 block">Step {i + 1}</span>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/orders"
              className="inline-block bg-primary text-white font-medium px-8 py-3 rounded-full hover:bg-primary/90 transition-colors"
            >
              Go to My Orders
            </Link>
          </div>
        </div>
      </section>

      {/* Return windows by category */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Return Window by Category</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-700">Category</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-700">Return Window</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-700">Conditions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p, i) => (
                  <tr key={p.title} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-5 py-3.5 font-medium text-gray-900">{p.title}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          p.window === "Non-returnable"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {p.window}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{p.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Common Questions</h2>
          <div className="space-y-5">
            {[
              {
                q: "Can I return a gift?",
                a: "Yes. If you received an item as a gift, you can return it for Gift Factory credit. You'll need the order number from the person who sent it.",
              },
              {
                q: "What if my item arrives damaged?",
                a: "Report damaged or wrong items within 48 hours of delivery using the Help section in your order. We'll arrange a replacement or full refund immediately.",
              },
              {
                q: "When will I get my refund?",
                a: "Refunds to the original payment method take 5–7 business days after we receive your item. Gift Factory store credit is instant.",
              },
              {
                q: "Is return shipping free?",
                a: "Yes — for most eligible returns we offer free doorstep pickup. In some pin codes, you may need to drop the item at a designated partner location.",
              },
            ].map((item) => (
              <div key={item.q} className="border-b border-gray-100 pb-5">
                <h3 className="font-semibold text-gray-900 mb-1.5">{item.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm mb-3">Still have questions?</p>
            <Link
              href="/help"
              className="inline-block border border-primary text-primary font-medium px-8 py-2.5 rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              Visit Help Centre
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
