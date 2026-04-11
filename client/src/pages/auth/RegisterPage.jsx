import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import apiClient from "../../services/apiClient";

const STEPS = ["Personal Info", "Account Setup", "Confirm"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phone: "",
    email: "", password: "", confirmPassword: "",
  });
  const [showPass, setShowPass]   = useState(false);
  const [error,    setError]      = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (error) setError("");
  };

  const validateStep = () => {
    if (step === 0) {
      if (!formData.firstName.trim() || !formData.lastName.trim())
        return "Please enter your full name.";
      if (!formData.phone.trim())
        return "Please enter your phone number.";
    }
    if (step === 1) {
      if (!formData.email.trim())
        return "Please enter your email address.";
      if (formData.password.length < 6)
        return "Password must be at least 6 characters.";
      if (formData.password !== formData.confirmPassword)
        return "Passwords do not match.";
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/register", formData);
      setAuth(response.data.data);
      navigate("/verify-otp");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "input-field";

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-navy-gradient flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(212,175,55,0.6) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center shadow-gold">
            <span className="font-display font-bold text-navy-900 text-sm">GA</span>
          </div>
          <div>
            <span className="block font-display font-bold text-white text-base leading-none">Global Allianz</span>
            <span className="block font-sans text-gold-400 text-[10px] uppercase tracking-widest mt-0.5">Insurance Brokers</span>
          </div>
        </Link>

        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold text-white leading-snug mb-4">
            Join thousands of Nigerians who trust GAIB.
          </h2>
          <p className="font-sans text-gray-400 text-sm leading-relaxed mb-8">
            Create a free account to purchase policies, manage coverage, and file claims — all digitally.
          </p>
          {/* Benefits */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "⚡", text: "Instant policy issuance" },
              { icon: "📞", text: "Dedicated broker support" },
              { icon: "🔒", text: "Bank-level data security" },
              { icon: "📱", text: "Manage from any device" },
            ].map((b) => (
              <div key={b.text} className="bg-navy-800/60 rounded-xl p-4 border border-navy-700">
                <div className="text-2xl mb-2">{b.icon}</div>
                <p className="font-sans text-xs text-gray-300">{b.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 font-sans text-xs text-gray-600">
          NAICOM Licensed · NDPR Compliant · Secured by 256-bit SSL
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-gold-gradient rounded-xl flex items-center justify-center">
              <span className="font-display font-bold text-navy-900 text-xs">GA</span>
            </div>
            <span className="font-display font-bold text-navy-900 text-base">Global Allianz</span>
          </Link>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${
                    i < step ? "bg-gsuccess-600 text-white" :
                    i === step ? "bg-navy-900 text-white" :
                    "bg-gray-100 text-gray-400"
                  }`}>
                    {i < step ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${i < step ? "bg-gsuccess-600" : "bg-gray-100"}`} />
                  )}
                </div>
              ))}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-navy-900">{STEPS[step]}</h1>
              <p className="font-sans text-gray-500 text-sm mt-1">
                Step {step + 1} of {STEPS.length} · Already have an account?{" "}
                <Link to="/login" className="text-navy-600 font-semibold hover:text-gold-600 transition-colors">Sign in</Link>
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-gerror-50 border border-gerror-200 text-gerror-600 px-4 py-3 rounded-xl mb-6 text-sm font-sans">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="space-y-5">

            {/* Step 0 — Personal Info */}
            {step === 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input name="firstName" type="text" value={formData.firstName}
                      onChange={handleChange} required className={inputClass} placeholder="John" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input name="lastName" type="text" value={formData.lastName}
                      onChange={handleChange} required className={inputClass} placeholder="Adeyemi" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input name="phone" type="tel" value={formData.phone}
                    onChange={handleChange} required className={inputClass} placeholder="+234 (0)80 123 4567" />
                </div>
              </>
            )}

            {/* Step 1 — Account Setup */}
            {step === 1 && (
              <>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input name="email" type="email" value={formData.email}
                    onChange={handleChange} required className={inputClass} placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <input name="password" type={showPass ? "text" : "password"} value={formData.password}
                      onChange={handleChange} required className={`${inputClass} pr-12`} placeholder="Min. 6 characters" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d={showPass ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                      </svg>
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {formData.password && (
                    <div className="mt-2 flex gap-1">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                          formData.password.length >= i * 3
                            ? i <= 1 ? "bg-gerror-600" : i <= 2 ? "bg-orange-400" : i <= 3 ? "bg-gold-500" : "bg-gsuccess-600"
                            : "bg-gray-100"
                        }`} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input name="confirmPassword" type="password" value={formData.confirmPassword}
                    onChange={handleChange} required className={inputClass} placeholder="Repeat password" />
                </div>
              </>
            )}

            {/* Step 2 — Confirm */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-navy-50 rounded-2xl p-6 space-y-3">
                  <h3 className="font-sans font-semibold text-navy-900 text-sm uppercase tracking-wide mb-4">Review Your Details</h3>
                  {[
                    { label: "Full Name",    value: `${formData.firstName} ${formData.lastName}` },
                    { label: "Phone",        value: formData.phone },
                    { label: "Email",        value: formData.email },
                    { label: "Password",     value: "••••••••" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between">
                      <span className="font-sans text-xs text-gray-400">{row.label}</span>
                      <span className="font-sans text-sm font-medium text-navy-900">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 text-xs font-sans text-gold-700 leading-relaxed">
                  By creating an account, you agree to our{" "}
                  <Link to="/terms" className="underline">Terms of Service</Link> and{" "}
                  <Link to="/privacy" className="underline">Privacy Policy</Link>.
                  Your data is protected under the Nigerian Data Protection Regulation (NDPR).
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <button type="button" onClick={() => { setStep(s => s - 1); setError(""); }}
                  className="btn border-2 border-gray-200 text-gray-600 hover:border-gray-300 flex-1">
                  ← Back
                </button>
              )}
              <button type="submit" disabled={isLoading} className="btn btn-primary flex-1 py-3.5">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account...
                  </span>
                ) : step < 2 ? "Continue →" : "Create Account →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
