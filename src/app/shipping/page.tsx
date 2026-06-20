import Link from "next/link";
import { Truck, Package, MapPin, Clock } from "lucide-react";

const deliveryOptions = [
  {
    name: "Standard Delivery",
    time: "4–7 business days",
    cost: "₹49 (Free above ₹499)",
    description: "Available for all pin codes across India.",
  },
  {
    name: "Express Delivery",
    time: "1–2 business days",
    cost: "₹99",
    description: "Available in 50+ major cities. Order before 2 PM for next-day delivery.",
  },
  {
    name: "Same-day Delivery",
    time: "Within hours",
    cost: "₹149",
    description: "Available in select areas of Bangalore, Mumbai, and Delhi NCR.",
  },
  {
    name: "Scheduled Delivery",
    time: "Choose your slot",
    cost: "₹79",
    description: "Pick a 2-hour delivery window that works for you.",
  },
];

const trackingSteps = [
  { label: "Order Placed", desc: "Your order is confirmed and being processed." },
  { label: "Packed", desc: "The seller has packed your item and it's ready for dispatch." },
  { label: "Shipped", desc: "Your package is on its way with our logistics partner." },
  { label: "Out for Delivery", desc: "Your delivery partner is en route to your address." },
  { label: "Delivered", desc: "Package delivered. Enjoy!" },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#232f3e] to-[#37475a] text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Shipping & Delivery</h1>
          <p className="text-gray-300 text-lg">
            Fast, reliable delivery to your doorstep across India.
          </p>
        </div>
      </section>

      {/* Delivery options */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Delivery Options</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {deliveryOptions.map((opt) => (
              <div
                key={opt.name}
                className="border border-gray-200 rounded-xl p-6 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{opt.name}</h3>
                  <span className="text-primary font-semibold text-sm whitespace-nowrap">
                    {opt.cost}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{opt.time}</span>
                </div>
                <p className="text-sm text-gray-600">{opt.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracking */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Track Your Order</h2>
          <div className="relative">
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {trackingSteps.map((step, i) => (
                <div key={step.label} className="flex items-start gap-5 pl-1">
                  <div className="relative z-10 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="pt-1.5">
                    <div className="font-semibold text-gray-900">{step.label}</div>
                    <div className="text-sm text-gray-600 mt-0.5">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/orders"
              className="inline-block bg-primary text-white font-medium px-8 py-3 rounded-full hover:bg-primary/90 transition-colors"
            >
              Track My Order
            </Link>
          </div>
        </div>
      </section>

      {/* Policies */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Shipping Policies</h2>
          <div className="space-y-5">
            {[
              {
                q: "Do you ship to all pin codes in India?",
                a: "We ship to 25,000+ pin codes across India. At checkout, enter your pin code to see available delivery options and estimated arrival times.",
              },
              {
                q: "What if I miss the delivery?",
                a: "Our delivery partner will attempt delivery 3 times. You can also reschedule via the tracking link in your SMS/email. After 3 failed attempts, the package is returned and refunded.",
              },
              {
                q: "Do you ship internationally?",
                a: "We currently ship within India only. International shipping is planned for a future update.",
              },
              {
                q: "Can I change my delivery address after placing the order?",
                a: "You can update your delivery address within 1 hour of placing the order from the Orders page, as long as the order hasn't been dispatched.",
              },
              {
                q: "My order is delayed — what should I do?",
                a: "If your estimated delivery date has passed, check your tracking link first. If the issue persists, contact us through the Help Centre and we'll resolve it within 24 hours.",
              },
            ].map((item) => (
              <div key={item.q} className="border-b border-gray-100 pb-5">
                <h3 className="font-semibold text-gray-900 mb-1.5">{item.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm mb-3">Need more help?</p>
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
