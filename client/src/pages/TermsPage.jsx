import useScrollReveal from "../hooks/useScrollReveal";

export default function TermsPage() {
  useScrollReveal();
  return (
    <div>
      <section className="pt-32 pb-16 bg-navy-gradient">
        <div className="container-custom text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="font-sans text-gray-400 text-sm">Last updated: April 8, 2026</p>
        </div>
      </section>
      <section className="section-pad bg-white">
        <div className="container-custom max-w-3xl">
          <div className="font-sans space-y-8 text-gray-700 text-sm leading-relaxed">
            {[
              { title: "1. Acceptance of Terms", body: "By accessing or using the Global Allianz Insurance Brokers platform ('the Platform'), you agree to be bound by these Terms of Service. If you do not agree, please discontinue use of our services." },
              { title: "2. Services Description", body: "GAIB provides insurance brokerage services — we act as an intermediary between clients and licensed insurance companies. We do not underwrite insurance directly. All policies are issued by NAICOM-licensed insurance companies." },
              { title: "3. User Accounts", body: "You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information during registration and to update your information as needed. GAIB reserves the right to suspend accounts found to be in violation of these terms." },
              { title: "4. Payment Terms", body: "Insurance premiums are processed via secure payment gateways (Paystack/Flutterwave). Premiums are non-refundable once a policy is in force except as required by applicable insurance law. Installment plans are subject to individual insurer terms." },
              { title: "5. Claims", body: "GAIB will assist in the filing and follow-up of claims, but claim decisions are made by the relevant insurer. We cannot guarantee the outcome of any claim but are committed to advocating on your behalf." },
              { title: "6. Limitation of Liability", body: "GAIB's liability is limited to direct damages arising from our own negligence or wilful misconduct. We are not liable for any indirect, incidental, or consequential damages." },
              { title: "7. Governing Law", body: "These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved through the Lagos State court system." },
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
