export default function ConditionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-[#232f3e] to-[#37475a] text-white py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold mb-2">Conditions of Use & Sale</h1>
          <p className="text-gray-400 text-sm">Last updated: January 2026</p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-3xl py-14 prose prose-gray max-w-none">
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Agreement to Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing or using the Gift Factory platform (website, mobile app, or any related
            service), you agree to be bound by these Conditions of Use & Sale. If you do not agree,
            please discontinue use immediately. Gift Factory reserves the right to update these
            conditions at any time; continued use after changes constitutes acceptance.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Account Registration</h2>
          <p className="text-gray-600 leading-relaxed">
            You must be at least 18 years old to create an account. You are responsible for
            maintaining the confidentiality of your login credentials and for all activity that
            occurs under your account. Gift Factory is not liable for any loss resulting from
            unauthorized use of your account.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Product Listings & Pricing</h2>
          <p className="text-gray-600 leading-relaxed">
            Gift Factory acts as a marketplace. Product listings, descriptions, and prices are
            provided by sellers. We make reasonable efforts to ensure accuracy but do not warrant
            that product descriptions or prices are error-free. In the event of a pricing error,
            we reserve the right to cancel orders placed at the incorrect price and notify you
            promptly.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Orders & Payment</h2>
          <p className="text-gray-600 leading-relaxed">
            An order confirmation email does not constitute acceptance of your order. Acceptance
            occurs when the item is dispatched. Payment must be made in full at checkout. We accept
            credit/debit cards, UPI, net banking, and Gift Factory wallet balance. All transactions
            are encrypted and processed securely.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Returns & Refunds</h2>
          <p className="text-gray-600 leading-relaxed">
            Returns and refunds are governed by our{" "}
            <a href="/returns" className="text-primary hover:underline">
              Returns & Replacements Policy
            </a>
            . Return eligibility varies by category and seller. Refunds are issued to the original
            payment method within 5–7 business days of return acceptance.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Intellectual Property</h2>
          <p className="text-gray-600 leading-relaxed">
            All content on Gift Factory — including logos, text, graphics, and software — is the
            property of Gift Factory Pvt. Ltd. or its licensors. You may not reproduce, distribute,
            or create derivative works without our written consent.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            To the maximum extent permitted by applicable law, Gift Factory shall not be liable for
            any indirect, incidental, special, or consequential damages arising from your use of the
            platform. Our aggregate liability shall not exceed the amount paid by you for the
            specific transaction giving rise to the claim.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Governing Law</h2>
          <p className="text-gray-600 leading-relaxed">
            These conditions are governed by the laws of India. Any disputes shall be subject to the
            exclusive jurisdiction of the courts in Bangalore, Karnataka.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">
            For questions about these conditions, please contact our legal team at{" "}
            <a href="mailto:legal@giftfactory.in" className="text-primary hover:underline">
              legal@giftfactory.in
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
