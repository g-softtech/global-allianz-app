import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useScrollReveal from "../hooks/useScrollReveal";
import apiClient from "../services/apiClient";

const POLICY_TYPES = [
  {
    id: "motor", icon: "🚗", label: "Motor Insurance",
    description: "Comprehensive or third-party vehicle coverage",
    subTypes: [
      { id: "comprehensive", label: "Comprehensive", price: 45000, desc: "Full coverage — theft, damage, third-party" },
      { id: "third_party",   label: "Third Party Only", price: 15000, desc: "Mandatory minimum — third-party liability only" },
    ],
    fields: ["vehicleMake","vehicleModel","vehicleYear","plateNumber","vehicleValue"],
  },
  {
    id: "health", icon: "💊", label: "Health Insurance",
    description: "Individual or group healthcare coverage",
    subTypes: [
      { id: "individual", label: "Individual Plan",  price: 80000,  desc: "For a single person" },
      { id: "family",     label: "Family Plan",      price: 150000, desc: "Cover up to 6 family members" },
    ],
    fields: [],
  },
  {
    id: "life", icon: "🛡️", label: "Life Insurance",
    description: "Term life or whole life coverage",
    subTypes: [
      { id: "term",  label: "Term Life (10yr)",  price: 25000,  desc: "Fixed term coverage" },
      { id: "whole", label: "Whole Life",        price: 60000,  desc: "Lifelong coverage with savings component" },
    ],
    fields: [],
  },
  {
    id: "travel", icon: "✈️", label: "Travel Insurance",
    description: "Single trip or annual multi-trip cover",
    subTypes: [
      { id: "single", label: "Single Trip",  price: 12000, desc: "One trip, up to 30 days" },
      { id: "annual", label: "Annual Cover", price: 35000, desc: "Unlimited trips for 12 months" },
    ],
    fields: ["destination","departureDate","returnDate"],
  },
  {
    id: "property", icon: "🏠", label: "Property Insurance",
    description: "Home or commercial property coverage",
    subTypes: [
      { id: "residential", label: "Residential",  price: 30000, desc: "Home buildings and contents" },
      { id: "commercial",  label: "Commercial",   price: 75000, desc: "Office or retail property" },
    ],
    fields: ["propertyAddress","propertyValue"],
  },
  {
    id: "business", icon: "🏢", label: "Business Insurance",
    description: "Comprehensive cover for your enterprise",
    subTypes: [
      { id: "sme",       label: "SME Package",      price: 120000, desc: "For businesses with < 50 staff" },
      { id: "corporate", label: "Corporate Package", price: 350000, desc: "For larger organisations" },
    ],
    fields: [],
  },
];

const STEPS = ["Choose Type", "Select Plan", "Enter Details", "Review & Pay"];

const FIELD_CONFIG = {
  vehicleMake:     { label: "Vehicle Make",        placeholder: "e.g. Toyota",      type: "text" },
  vehicleModel:    { label: "Vehicle Model",       placeholder: "e.g. Camry",       type: "text" },
  vehicleYear:     { label: "Year of Manufacture", placeholder: "e.g. 2020",        type: "number" },
  plateNumber:     { label: "Plate Number",        placeholder: "e.g. LAG-123-AA",  type: "text" },
  vehicleValue:    { label: "Vehicle Value (₦)",   placeholder: "e.g. 5000000",     type: "number" },
  destination:     { label: "Destination Country", placeholder: "e.g. United Kingdom", type: "text" },
  departureDate:   { label: "Departure Date",      placeholder: "",                 type: "date" },
  returnDate:      { label: "Return Date",         placeholder: "",                 type: "date" },
  propertyAddress: { label: "Property Address",    placeholder: "Full address",      type: "text" },
  propertyValue:   { label: "Property Value (₦)",  placeholder: "e.g. 25000000",    type: "number" },
};

export default function BuyPolicyPage() {
  useScrollReveal();
  const navigate = useNavigate();

  const [step,       setStep]       = useState(0);
  const [selected,   setSelected]   = useState(null);   // policy type object
  const [subType,    setSubType]    = useState(null);    // subType object
  const [extraData,  setExtraData]  = useState({});
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [kycError,   setKycError]   = useState("");

  const handleSelectType = (pt) => { setSelected(pt); setSubType(null); setStep(1); };
  const handleSelectPlan = (st) => { setSubType(st); setStep(2); };

  const handleFieldChange = (e) =>
    setExtraData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmitPolicy = async () => {
    setLoading(true); setError("");
    try {
      if (!selected || !subType) {
        setError("Please select a policy type and plan.");
        setLoading(false);
        return;
      }
      // Build payload
      const payload = {
        type:    selected.id,
        subType: subType.id,
        premium: { amount: subType.price, frequency: "annual" },
        sumInsured: extraData.vehicleValue || extraData.propertyValue || subType.price * 10,
      };

      // Attach type-specific data
      if (selected.id === "motor") {
        payload.vehicle = {
          make:  extraData.vehicleMake,
          model: extraData.vehicleModel,
          year:  Number(extraData.vehicleYear),
          plateNumber: extraData.plateNumber,
          value: Number(extraData.vehicleValue),
        };
      }
      if (selected.id === "travel") {
        payload.travel = {
          destination:   extraData.destination,
          departureDate: extraData.departureDate,
          returnDate:    extraData.returnDate,
          travellers:    1,
        };
      }
      if (selected.id === "property") {
        payload.property = {
          address:      extraData.propertyAddress,
          propertyType: subType.id,
          value:        Number(extraData.propertyValue),
        };
      }

      const res = await apiClient.post("/policies", payload);
      const policy = res.data.data;

      // Go to checkout with policy details
      navigate("/payment/checkout", { state: { policy, subType } });
    } catch (err) {
      console.error("Policy creation error:", err);
      const code = err.response?.data?.code;
      const msg  = err.response?.data?.message ||
                   err.response?.data?.errors?.[0]?.msg ||
                   "Failed to create policy. Please try again.";

      if (code === 'KYC_REQUIRED' || code === 'PROFILE_INCOMPLETE') {
        setKycError(msg);
      } else {
        setError(msg);
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-section-gradient min-h-screen pt-24 pb-16">
      <div className="container-custom max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-navy-900">Buy Insurance Policy</h1>
          <p className="font-sans text-gray-500 text-sm mt-1">Complete coverage in just a few steps.</p>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 mb-6">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${
                  i < step  ? "bg-gsuccess-600 text-white" :
                  i === step? "bg-navy-900 text-white" :
                              "bg-gray-100 text-gray-400"
                }`}>
                  {i < step
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                    : i + 1}
                </div>
                <span className={`font-sans text-xs hidden sm:block ${i === step ? "text-navy-900 font-semibold" : "text-gray-400"}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded-full ${i < step ? "bg-gsuccess-400" : "bg-gray-100"}`} />}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-gerror-50 border border-gerror-200 text-gerror-600 px-5 py-3 rounded-xl mb-5 font-sans text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {error}
          </div>
        )}

        {kycError && (
          <div className="flex items-start gap-4 bg-orange-50 border border-orange-200 px-5 py-4 rounded-xl mb-5">
            <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div className="flex-1">
              <p className="font-sans font-semibold text-orange-800 text-sm">Verification Required</p>
              <p className="font-sans text-orange-700 text-sm mt-0.5">{kycError}</p>
              <a href="/profile" className="inline-flex items-center gap-1.5 mt-3 font-sans text-sm font-semibold text-orange-800 underline hover:text-orange-900">
                Complete KYC on Profile Page →
              </a>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 md:p-8">

          {/* ── Step 0: Choose Policy Type ── */}
          {step === 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-navy-900 mb-6">What would you like to insure?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {POLICY_TYPES.map((pt) => (
                  <button key={pt.id} onClick={() => handleSelectType(pt)}
                    className="flex flex-col items-start gap-3 p-5 border-2 border-gray-100 rounded-2xl hover:border-gold-400 hover:bg-gold-50 transition-all duration-200 text-left group">
                    <span className="text-3xl">{pt.icon}</span>
                    <div>
                      <p className="font-sans font-semibold text-navy-900 text-sm group-hover:text-navy-700">{pt.label}</p>
                      <p className="font-sans text-xs text-gray-400 mt-0.5">{pt.description}</p>
                    </div>
                    <span className="font-sans text-xs text-gold-600 font-semibold">Select →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 1: Choose Plan ── */}
          {step === 1 && selected && (
            <div>
              <button onClick={() => setStep(0)} className="flex items-center gap-1.5 text-gray-400 hover:text-navy-700 font-sans text-sm mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                Back
              </button>
              <h2 className="font-display text-xl font-semibold text-navy-900 mb-2">
                {selected.icon} {selected.label}
              </h2>
              <p className="font-sans text-gray-500 text-sm mb-6">Choose the plan that fits your needs.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selected.subTypes.map((st) => (
                  <button key={st.id} onClick={() => handleSelectPlan(st)}
                    className={`flex flex-col gap-3 p-6 border-2 rounded-2xl text-left transition-all duration-200 ${
                      subType?.id === st.id
                        ? "border-gold-500 bg-gold-50"
                        : "border-gray-100 hover:border-gold-300 hover:bg-gold-50"
                    }`}>
                    <div className="flex justify-between items-start">
                      <p className="font-sans font-semibold text-navy-900">{st.label}</p>
                      {subType?.id === st.id && (
                        <svg className="w-5 h-5 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </div>
                    <p className="font-sans text-xs text-gray-500">{st.desc}</p>
                    <div className="border-t border-gray-100 pt-3 mt-1">
                      <span className="font-display text-2xl font-bold text-navy-900">₦{st.price.toLocaleString()}</span>
                      <span className="font-sans text-xs text-gray-400 ml-1">/year</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Enter Details ── */}
          {step === 2 && selected && subType && (
            <div>
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-gray-400 hover:text-navy-700 font-sans text-sm mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                Back
              </button>
              <h2 className="font-display text-xl font-semibold text-navy-900 mb-6">
                {selected.fields.length > 0 ? "Enter Policy Details" : "Confirm Your Selection"}
              </h2>

              {selected.fields.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {selected.fields.map((field) => {
                    const cfg = FIELD_CONFIG[field];
                    return (
                      <div key={field} className="form-group">
                        <label className="form-label">{cfg.label}</label>
                        <input
                          name={field} type={cfg.type}
                          placeholder={cfg.placeholder}
                          value={extraData[field] || ""}
                          onChange={handleFieldChange}
                          className="input-field"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-navy-50 rounded-2xl p-6 text-center">
                  <div className="text-4xl mb-3">{selected.icon}</div>
                  <p className="font-sans text-navy-700 text-sm">
                    You've selected <strong>{selected.label} — {subType.label}</strong>.
                    Click continue to review and pay.
                  </p>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button onClick={() => setStep(3)} className="btn btn-primary px-8">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Review & Pay ── */}
          {step === 3 && selected && subType && (
            <div>
              <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-gray-400 hover:text-navy-700 font-sans text-sm mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                Back
              </button>
              <h2 className="font-display text-xl font-semibold text-navy-900 mb-6">Review Your Policy</h2>

              {/* Summary card */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden mb-6">
                <div className="bg-navy-gradient px-6 py-4 flex items-center gap-3">
                  <span className="text-2xl">{selected.icon}</span>
                  <div>
                    <p className="font-sans font-semibold text-white text-sm">{selected.label}</p>
                    <p className="font-sans text-gold-400 text-xs">{subType.label}</p>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-sans text-sm text-gray-500">Coverage Type</span>
                    <span className="font-sans text-sm font-semibold text-navy-900">{subType.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-sm text-gray-500">Coverage</span>
                    <span className="font-sans text-sm font-semibold text-navy-900">{subType.desc}</span>
                  </div>
                  {Object.entries(extraData).map(([k, v]) => v && (
                    <div key={k} className="flex justify-between">
                      <span className="font-sans text-sm text-gray-500">{FIELD_CONFIG[k]?.label || k}</span>
                      <span className="font-sans text-sm font-semibold text-navy-900">{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span className="font-sans text-sm text-gray-500">Policy Duration</span>
                    <span className="font-sans text-sm font-semibold text-navy-900">12 months</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="font-sans font-semibold text-navy-900">Annual Premium</span>
                    <span className="font-display text-xl font-bold text-gold-600">₦{subType.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* What's covered */}
              <div className="bg-gsuccess-50 border border-gsuccess-200 rounded-xl p-4 mb-6">
                <p className="font-sans text-xs font-semibold text-gsuccess-700 uppercase tracking-wide mb-2">What's included</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {[
                    "NAICOM licensed coverage",
                    "Digital policy certificate",
                    "24/7 claims support",
                    "Dedicated broker assigned",
                    "Annual renewal reminder",
                    "Online claims tracking",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-gsuccess-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="font-sans text-xs text-gsuccess-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmitPolicy}
                disabled={loading}
                className="btn btn-primary w-full py-4 text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Creating Policy...
                  </span>
                ) : (
                  <>Proceed to Payment — ₦{subType.price.toLocaleString()}</>
                )}
              </button>
              <p className="font-sans text-xs text-gray-400 text-center mt-3">
                Secured by Paystack · 256-bit SSL encryption
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
