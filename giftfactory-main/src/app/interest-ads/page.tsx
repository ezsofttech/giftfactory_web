import Link from "next/link";

export default function InterestAdsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-[#232f3e] to-[#37475a] text-white py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold mb-2">Interest-Based Ads</h1>
          <p className="text-gray-400 text-sm">Last updated: January 2026</p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-3xl py-14">
        <p className="text-gray-600 leading-relaxed mb-10">
          Gift Factory displays interest-based advertisements — ads tailored to your browsing
          behavior, purchases, and inferred interests — to help surface products and offers most
          relevant to you. This page explains how interest-based advertising works and how you can
          control it.
        </p>

        {[
          {
            title: "What are interest-based ads?",
            body: `Interest-based ads (also called targeted or personalised ads) are ads that are selected based on information about you — such as products you've viewed or searched for, your purchase history, and your location. Rather than showing you generic ads, we use this data to show you ads for products or categories you're more likely to find useful.`,
          },
          {
            title: "What information do we use?",
            body: `We may use the following types of data for interest-based advertising: browsing and search history on Gift Factory; products you've viewed, added to cart, or purchased; demographic information you've shared (e.g. gender, age range); your general location (city or region); device type and browser information; and inferences drawn from the above about your interests and preferences.`,
          },
          {
            title: "Do we share data with advertisers?",
            body: `We do not share your personal information (such as your name or email address) with advertisers or third-party ad networks without your explicit consent. We may share aggregated or anonymised data that cannot identify you individually. Sellers who run Sponsored Product campaigns on Gift Factory can see aggregate campaign performance data but not your personal details.`,
          },
          {
            title: "Third-party ad networks",
            body: `We work with third-party advertising partners (such as Google and Meta) to serve ads on other websites and apps. These partners may use cookies or device identifiers to show you Gift Factory ads across the web. Their data practices are governed by their own privacy policies. You can opt out of personalized ads from Google at adssettings.google.com and from Meta at facebook.com/settings.`,
          },
          {
            title: "How to opt out",
            body: `You can limit interest-based advertising in the following ways:\n\n• Account settings: Go to Profile → Preferences → Notifications and turn off "Marketing & personalized offers".\n\n• Browser: Delete or block cookies in your browser settings. Note that this may affect your experience on Gift Factory.\n\n• Device: On iOS, go to Settings → Privacy → Tracking and disable ad tracking. On Android, go to Settings → Privacy → Ads and opt out of ad personalization.\n\n• Industry opt-out: Visit the Digital Advertising Alliance (DAA) or Network Advertising Initiative (NAI) opt-out tools.`,
          },
          {
            title: "What happens if I opt out?",
            body: `If you opt out of interest-based ads, you will still see ads on Gift Factory, but they will be less relevant to you — they will be based on the page you're viewing at the time rather than your history. Opting out does not reduce the number of ads you see.`,
          },
          {
            title: "Children",
            body: `We do not use interest-based advertising for users who are under 13, or for users we have identified as minors.`,
          },
          {
            title: "Contact Us",
            body: `If you have questions about interest-based advertising or our data practices, please contact us at privacy@giftfactory.in.`,
          },
        ].map((section) => (
          <section key={section.title} className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{section.body}</p>
          </section>
        ))}

        <div className="mt-8 p-5 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600">
          <strong>Related pages: </strong>
          <Link href="/privacy" className="text-primary hover:underline mr-3">
            Privacy Notice
          </Link>
          <Link href="/conditions" className="text-primary hover:underline mr-3">
            Conditions of Use
          </Link>
          <Link href="/profile" className="text-primary hover:underline">
            Your Account Preferences
          </Link>
        </div>
      </div>
    </div>
  );
}
