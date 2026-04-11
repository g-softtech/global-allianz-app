import { useState } from "react";
import ContactForm from "../components/ContactForm";
import useScrollReveal from "../hooks/useScrollReveal";

const CONTACT_INFO = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
    label: "Office Address",
    value: "1 Oba Akran Avenue, Ikeja",
    sub: "Lagos, Nigeria",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
      </svg>
    ),
    label: "Phone Number",
    value: "+234 (0)1 234 5678",
    sub: "+234 (0)90 123 4567",
    href: "tel:+2341234567890",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    ),
    label: "Email Address",
    value: "info@gaib.com.ng",
    sub: "claims@gaib.com.ng",
    href: "mailto:info@gaib.com.ng",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    label: "Office Hours",
    value: "Monday – Friday: 8am – 5pm",
    sub: "Saturday: 9am – 1pm (Enquiries only)",
  },
];

const FAQS = [
  {
    q: "How long does it take to get a quote?",
    a: "Most quotes are provided within 24 hours. For complex commercial risks, we may need 2–3 business days to source competitive options from multiple insurers.",
  },
  {
    q: "What documents do I need to purchase insurance?",
    a: "Requirements vary by product. Motor insurance needs your vehicle registration and ID. Life and health insurance may require a medical questionnaire. Our brokers will guide you through the exact requirements.",
  },
  {
    q: "How do I file a claim?",
    a: "Contact us immediately via phone, WhatsApp, or email. Our dedicated claims team will guide you through the entire process and advocate on your behalf with the insurer.",
  },
  {
    q: "Are you NAICOM licensed?",
    a: "Yes, Global Allianz Insurance Brokers is fully licensed and regulated by the National Insurance Commission (NAICOM) of Nigeria.",
  },
  {
    q: "Can I pay my premium in installments?",
    a: "Yes, many of our products support quarterly or monthly payment plans. Our brokers will work with you to find a payment structure that fits your budget.",
  },
];

function FAQItem({ q, a, delay }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="reveal border border-gray-200 rounded-xl overflow-hidden bg-white"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-navy-50 transition-colors duration-200"
      >
        <span className="font-sans font-semibold text-navy-900 text-sm pr-4">{q}</span>
        <svg
          className={`w-5 h-5 text-gold-500 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40" : "max-h-0"}`}>
        <p className="font-sans text-sm text-gray-600 leading-relaxed px-6 pb-5">{a}</p>
      </div>
    </div>
  );
}

export default function ContactPage() {
  useScrollReveal();

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-navy-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(212,175,55,0.4) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        </div>
        <div className="container-custom relative z-10 text-center">
          <span className="section-label text-gold-400 mb-4 block">Get in Touch</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
            We're Here to Help
          </h1>
          <p className="font-sans text-gray-300 max-w-xl mx-auto text-lg leading-relaxed">
            Have a question, need a quote, or want to file a claim? Our team of expert brokers is ready to assist you.
          </p>
          <a
            href="https://wa.me/2341234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-8 bg-gsuccess-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-sans font-medium text-sm transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat on WhatsApp — We reply fast
          </a>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="section-pad bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* Contact Info */}
            <div className="lg:col-span-2 reveal-left space-y-6">
              <div>
                <span className="section-label">Contact Details</span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-navy-900 mt-3 mb-2">Reach Our Team</h2>
                <p className="font-sans text-gray-500 text-sm leading-relaxed">
                  Multiple ways to connect with us. We respond to all inquiries within 24 hours on business days.
                </p>
              </div>

              {CONTACT_INFO.map((info) => (
                <div key={info.label} className="flex gap-4">
                  <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center text-navy-600 flex-shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <p className="font-sans text-xs text-gray-400 uppercase tracking-wide font-medium">{info.label}</p>
                    {info.href ? (
                      <a href={info.href} className="font-sans font-semibold text-navy-900 text-sm hover:text-gold-600 transition-colors">
                        {info.value}
                      </a>
                    ) : (
                      <p className="font-sans font-semibold text-navy-900 text-sm">{info.value}</p>
                    )}
                    <p className="font-sans text-gray-500 text-xs mt-0.5">{info.sub}</p>
                  </div>
                </div>
              ))}

              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-card">
                <iframe
                  title="Global Allianz Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.1380890394!2d3.3382!3d6.6018!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b93c6c8a7f7b7%3A0x0!2sIkeja%2C+Lagos%2C+Nigeria!5e0!3m2!1sen!2sng!4v1680000000000"
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3 reveal-right">
              <div className="card border border-gray-100 shadow-card p-8">
                <span className="section-label mb-3 block">Send a Message</span>
                <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Get a Free Quote or Consultation</h2>
                <p className="font-sans text-gray-500 text-sm mb-7">
                  Fill the form and one of our licensed brokers will contact you within 24 hours.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-pad bg-section-gradient">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-12">
            <span className="section-label">
              <span className="gold-divider w-8 h-px" />
              FAQ
              <span className="gold-divider w-8 h-px" />
            </span>
            <h2 className="font-display text-3xl font-bold text-navy-900 mt-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}