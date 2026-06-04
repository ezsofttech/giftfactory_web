// components/sections/services.tsx
import { Truck, ShieldCheck, CreditCard, Headphones } from "lucide-react";

export function ServicesSection() {
  const services = [
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Free Shipping",
      description: "On all orders over $99",
    },
    {
      icon: <ShieldCheck className="h-8 w-8" />,
      title: "Secure Payment",
      description: "100% secure payment",
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Money Back",
      description: "30 day money back",
    },
    {
      icon: <Headphones className="h-8 w-8" />,
      title: "24/7 Support",
      description: "Dedicated support",
    },
  ];

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="mb-3 text-primary">{service.icon}</div>
              <h3 className="font-bold text-lg mb-1">{service.title}</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
