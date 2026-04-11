import { useState } from "react";

export default function ContactForm({ dark = false }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  const inputClass = `input-field ${dark ? "bg-navy-800 border-navy-700 text-white placeholder-gray-500 focus:ring-gold-500" : ""}`;
  const labelClass = `form-label ${dark ? "text-gray-300" : "text-navy-700"}`;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gsuccess-50 rounded-full flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-gsuccess-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className={`font-display text-2xl font-semibold mb-2 ${dark ? "text-white" : "text-navy-900"}`}>Message Sent!</h3>
        <p className={`font-sans text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
          Thank you for reaching out. Our team will respond within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="form-group">
          <label className={labelClass}>Full Name *</label>
          <input name="name" type="text" required value={form.name} onChange={handleChange}
            placeholder="John Adeyemi" className={inputClass} />
        </div>
        <div className="form-group">
          <label className={labelClass}>Email Address *</label>
          <input name="email" type="email" required value={form.email} onChange={handleChange}
            placeholder="john@example.com" className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="form-group">
          <label className={labelClass}>Phone Number</label>
          <input name="phone" type="tel" value={form.phone} onChange={handleChange}
            placeholder="+234 (0)1 234 5678" className={inputClass} />
        </div>
        <div className="form-group">
          <label className={labelClass}>Subject *</label>
          <select name="subject" required value={form.subject} onChange={handleChange} className={inputClass}>
            <option value="">Select a subject</option>
            <option>Motor Insurance</option>
            <option>Health Insurance</option>
            <option>Life Insurance</option>
            <option>Business Insurance</option>
            <option>Travel Insurance</option>
            <option>Property Insurance</option>
            <option>Claims Support</option>
            <option>General Inquiry</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className={labelClass}>Message *</label>
        <textarea name="message" required rows={5} value={form.message} onChange={handleChange}
          placeholder="Tell us how we can help you..." className={`${inputClass} resize-none`} />
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary w-full py-3.5">
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Sending...
          </span>
        ) : (
          <>Send Message <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></>
        )}
      </button>
    </form>
  );
}
