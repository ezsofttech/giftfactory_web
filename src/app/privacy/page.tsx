export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-[#232f3e] to-[#37475a] text-white py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold mb-2">Privacy Notice</h1>
          <p className="text-gray-400 text-sm">Last updated: January 2026</p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-3xl py-14">
        <p className="text-gray-600 leading-relaxed mb-10">
          Gift Factory Pvt. Ltd. (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is
          committed to protecting your privacy. This Privacy Notice explains what personal data we
          collect, how we use it, and your rights in relation to it.
        </p>

        {[
          {
            title: "1. Information We Collect",
            body: `We collect information you provide directly — such as name, email, phone number, and delivery addresses — as well as information generated through your use of the platform, including browsing history, search queries, orders, reviews, and device/IP data. If you connect via social login, we receive basic profile information from that provider.`,
          },
          {
            title: "2. How We Use Your Information",
            body: `We use your data to: process and deliver orders; personalise your shopping experience; send transactional and, with your consent, marketing emails; prevent fraud and abuse; improve our platform; and comply with legal obligations. We do not sell your personal data to third parties.`,
          },
          {
            title: "3. Sharing Your Information",
            body: `We share data with: sellers (limited order details needed to fulfil your order); logistics partners (delivery details); payment processors (for transaction processing); analytics and advertising partners (aggregated or pseudonymised data). All third parties are bound by data processing agreements.`,
          },
          {
            title: "4. Cookies & Tracking",
            body: `We use cookies and similar technologies for authentication, analytics, and personalised advertising. You can manage cookie preferences via your browser settings. Disabling certain cookies may affect platform functionality. See our Interest-Based Ads notice for details on advertising cookies.`,
          },
          {
            title: "5. Data Retention",
            body: `We retain personal data for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce agreements. You may request deletion of your account and associated data at any time.`,
          },
          {
            title: "6. Your Rights",
            body: `Under applicable law, you have the right to access, correct, delete, or port your personal data, and to object to or restrict certain processing. To exercise these rights, contact us at privacy@giftfactory.in. We will respond within 30 days.`,
          },
          {
            title: "7. Security",
            body: `We implement industry-standard technical and organisational measures to protect your data, including encryption in transit (TLS) and at rest, access controls, and regular security audits. No system is 100% secure; please use a strong, unique password and enable two-factor authentication if available.`,
          },
          {
            title: "8. Children's Privacy",
            body: `Our services are not directed to children under 13. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.`,
          },
          {
            title: "9. Changes to This Notice",
            body: `We may update this Privacy Notice periodically. We will notify you of material changes via email or a prominent notice on the platform. Your continued use after changes constitutes acceptance.`,
          },
          {
            title: "10. Contact",
            body: `For privacy-related questions, contact our Data Protection Officer at privacy@giftfactory.in or write to: Gift Factory Pvt. Ltd., 100 MG Road, Bangalore 560001, India.`,
          },
        ].map((section) => (
          <section key={section.title} className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
            <p className="text-gray-600 leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
