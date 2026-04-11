import useScrollReveal from "../hooks/useScrollReveal";

export default function PrivacyPage() {
  useScrollReveal();
  return (
    <div>
      <section className="pt-32 pb-16 bg-navy-gradient">
        <div className="container-custom text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="font-sans text-gray-400 text-sm">Last updated: April 8, 2026</p>
        </div>
      </section>
      <section className="section-pad bg-white">
        <div className="container-custom max-w-3xl">
          <div className="prose prose-navy font-sans space-y-8 text-gray-700 text-sm leading-relaxed">
            {[
              { title: "1. Introduction", body: "Global Allianz Insurance Brokers Ltd ('GAIB', 'we', 'our', 'us') is committed to protecting your personal information and privacy rights in accordance with the Nigeria Data Protection Regulation (NDPR) 2019. This Privacy Policy explains how we collect, use, store, and protect your personal data." },
              { title: "2. Information We Collect", body: "We collect personal information such as your name, email address, phone number, date of birth, BVN (for KYC compliance), financial information, vehicle or property details relevant to your insurance product, and any other information you provide during the insurance application process." },
              { title: "3. How We Use Your Information", body: "We use your information to provide insurance brokerage services, process policy applications and renewals, handle claims on your behalf, communicate important policy information, comply with regulatory requirements (NAICOM, NDPR), and improve our services through analytics." },
              { title: "4. Data Sharing", body: "We share your data only with licensed insurers and underwriters to facilitate your insurance coverage, regulatory bodies as required by law, payment processors (Paystack/Flutterwave) for premium transactions, and service providers who assist in operating our platform. We do not sell your personal data to third parties." },
              { title: "5. Data Security", body: "We implement industry-standard security measures including encryption, secure servers, and access controls to protect your data. All payment processing is handled by PCI-DSS compliant payment providers — we do not store card details." },
              { title: "6. Your Rights", body: "Under the NDPR, you have the right to access your personal data, correct inaccurate data, request deletion of your data, object to processing, and data portability. To exercise these rights, contact us at privacy@gaib.com.ng." },
              { title: "7. Contact Us", body: "For privacy-related enquiries, contact our Data Protection Officer at: privacy@gaib.com.ng | +234 (0)1 234 5678 | 1 Oba Akran Avenue, Ikeja, Lagos, Nigeria." },
            ].map((section) => (
              <div key={section.title} className="reveal">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-3">{section.title}</h2>
                <p>{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
