import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../services/apiClient";
import useScrollReveal from "../hooks/useScrollReveal";

const CLAIM_STEPS = ["Select Policy", "Incident Details", "Upload Documents", "Review & Submit"];

const INCIDENT_TYPES = {
  motor:    ["Accident / Collision", "Theft / Robbery", "Fire Damage", "Flood Damage", "Third Party Damage", "Windscreen Damage", "Other"],
  health:   ["Hospitalisation", "Surgery", "Outpatient Treatment", "Emergency", "Specialist Consultation", "Other"],
  life:     ["Death Claim", "Critical Illness", "Permanent Disability", "Other"],
  travel:   ["Medical Emergency Abroad", "Trip Cancellation", "Lost Baggage", "Flight Delay", "Passport Loss", "Other"],
  property: ["Fire / Explosion", "Burglary / Theft", "Flood Damage", "Storm Damage", "Accidental Damage", "Other"],
  business: ["Public Liability", "Property Damage", "Business Interruption", "Employee Injury", "Other"],
  corporate:["Property Damage", "Public Liability", "Business Interruption", "Other"],
};

export default function FileClaimPage() {
  useScrollReveal();
  const navigate = useNavigate();

  const [step,       setStep]       = useState(0);
  const [policies,   setPolicies]   = useState([]);
  const [loadingPol, setLoadingPol] = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState(null);

  const [form, setForm] = useState({
    policyId:         "",
    selectedPolicy:   null,
    incidentType:     "",
    incidentDate:     "",
    incidentLocation: "",
    description:      "",
    claimedAmount:    "",
    documents:        [],
  });

  // Load user's active policies
  useEffect(() => {
    apiClient.get("/policies?status=active")
      .then((res) => setPolicies(res.data.data || []))
      .catch(() => setPolicies([]))
      .finally(() => setLoadingPol(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (error) setError("");
  };

  const selectPolicy = (policy) => {
    setForm((p) => ({ ...p, policyId: policy._id, selectedPolicy: policy, incidentType: "" }));
    setStep(1);
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.incidentType)     return "Please select an incident type.";
      if (!form.incidentDate)     return "Please enter the incident date.";
      if (!form.description || form.description.length < 20)
        return "Please provide a detailed description (minimum 20 characters).";
      if (!form.claimedAmount || Number(form.claimedAmount) <= 0)
        return "Please enter a valid claim amount.";
      // Incident date cannot be in the future
      if (new Date(form.incidentDate) > new Date())
        return "Incident date cannot be in the future.";
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => s + 1);
  };

  const handleFileAdd = (e) => {
    const files = Array.from(e.target.files);
    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED  = ["image/jpeg", "image/png", "application/pdf"];

    const valid   = [];
    const invalid = [];

    files.forEach((f) => {
      if (!ALLOWED.includes(f.type))  invalid.push(`${f.name}: must be JPG, PNG, or PDF`);
      else if (f.size > MAX_SIZE)     invalid.push(`${f.name}: exceeds 5MB limit`);
      else                            valid.push({ name: f.name, size: f.size, type: f.type });
    });

    if (invalid.length > 0) {
      setError(invalid.join(" | "));
      return;
    }

    setForm((p) => ({ ...p, documents: [...p.documents, ...valid] }));
    e.target.value = "";
  };

  const removeDoc = (idx) =>
    setForm((p) => ({ ...p, documents: p.documents.filter((_, i) => i !== idx) }));

  const handleSubmit = async () => {
    if (form.documents.length === 0) {
      setError("Please upload at least one supporting document.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        policyId:         form.policyId,
        type:             form.selectedPolicy?.type,
        incidentDate:     form.incidentDate,
        incidentLocation: form.incidentLocation,
        description:      form.description,
        claimedAmount:    Number(form.claimedAmount),
        documents:        form.documents.map((d) => ({
          name:     d.name,
          type:     "other",
          url:      "pending_upload",
          fileName: d.name,
          fileSize: d.size,
        })),
      };

      const res = await apiClient.post("/claims", payload);
      setSuccess(res.data.data);
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === "KYC_REQUIRED") {
        setError("KYC verification required before filing a claim. Please complete your profile.");
      } else {
        setError(err.response?.data?.message || "Failed to submit claim. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Success screen ────────────────────────────────────────
  if (success) {
    return (
      <div className="bg-section-gradient min-h-screen pt-24 pb-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-card-hover border border-gray-100 p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-gsuccess-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-gsuccess-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Claim Submitted!</h2>
          <p className="font-sans text-gray-500 text-sm mb-6">
            Your claim has been received. Our team will review it within 24–48 hours and contact you via email.
          </p>
          <div className="bg-navy-50 rounded-xl p-5 text-left space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="font-sans text-xs text-gray-400">Claim Number</span>
              <span className="font-mono text-xs font-bold text-navy-900">{success.claimNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-xs text-gray-400">Claimed Amount</span>
              <span className="font-sans text-xs font-bold text-navy-900">₦{Number(form.claimedAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-xs text-gray-400">Status</span>
              <span className="font-sans text-xs font-semibold text-blue-600">Submitted</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/dashboard" className="btn btn-primary w-full justify-center">
              Go to Dashboard
            </Link>
            <button onClick={() => { setSuccess(null); setStep(0); setForm({ policyId: "", selectedPolicy: null, incidentType: "", incidentDate: "", incidentLocation: "", description: "", claimedAmount: "", documents: [] }); }}
              className="btn border-2 border-gray-200 text-gray-600 hover:border-navy-300 w-full justify-center text-sm">
              File Another Claim
            </button>
          </div>
        </div>
      </div>
    );
  }

  const policyType = form.selectedPolicy?.type;
  const incidentOptions = policyType ? (INCIDENT_TYPES[policyType] || INCIDENT_TYPES.business) : [];

  return (
    <div className="bg-section-gradient min-h-screen pt-24 pb-16">
      <div className="container-custom max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-navy-700 font-sans text-sm mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="font-display text-3xl font-bold text-navy-900">File a Claim</h1>
          <p className="font-sans text-gray-500 text-sm mt-1">Submit your insurance claim — our team responds within 24–48 hours.</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 mb-6">
          <div className="flex items-center gap-2">
            {CLAIM_STEPS.map((s, i) => (
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
                {i < CLAIM_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full ${i < step ? "bg-gsuccess-400" : "bg-gray-100"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-gerror-50 border border-gerror-200 text-gerror-700 px-5 py-3 rounded-xl mb-5 font-sans text-sm">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              {error}
              {error.includes("KYC") && (
                <Link to="/profile" className="block mt-1 font-semibold underline text-gerror-700 hover:text-gerror-900">Complete KYC →</Link>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 md:p-8">

          {/* ── Step 0: Select Policy ── */}
          {step === 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-navy-900 mb-2">Which policy are you claiming on?</h2>
              <p className="font-sans text-sm text-gray-500 mb-6">Only active policies are eligible for claims.</p>

              {loadingPol ? (
                <div className="space-y-3">
                  {[1,2].map(i => <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />)}
                </div>
              ) : policies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📄</div>
                  <h3 className="font-display font-semibold text-navy-900 mb-2">No Active Policies</h3>
                  <p className="font-sans text-sm text-gray-400 mb-5">You need an active policy to file a claim.</p>
                  <Link to="/policies/buy" className="btn btn-primary text-sm">Buy a Policy</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {policies.map((p) => (
                    <button key={p._id} onClick={() => selectPolicy(p)}
                      className="w-full flex items-center gap-4 p-5 border-2 border-gray-100 rounded-2xl hover:border-gold-400 hover:bg-gold-50 transition-all duration-200 text-left group">
                      <div className="text-2xl">
                        {{ motor:"🚗", health:"💊", life:"🛡️", travel:"✈️", property:"🏠", business:"🏢", corporate:"🏢" }[p.type] || "📄"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-semibold text-navy-900 capitalize">{p.type} Insurance</p>
                        <p className="font-sans text-xs text-gray-400 mt-0.5">{p.policyNumber} · Premium: ₦{p.premium?.amount?.toLocaleString()}/yr</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-gsuccess-50 text-gsuccess-600 border border-gsuccess-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">Active</span>
                        <svg className="w-5 h-5 text-gray-300 group-hover:text-gold-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Step 1: Incident Details ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <button onClick={() => setStep(0)} className="flex items-center gap-1.5 text-gray-400 hover:text-navy-700 font-sans text-sm mb-4 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                  Back
                </button>
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-1">Incident Details</h2>
                <p className="font-sans text-sm text-gray-500">Claiming on: <span className="font-semibold text-navy-700 capitalize">{policyType} Insurance — {form.selectedPolicy?.policyNumber}</span></p>
              </div>

              <div className="form-group">
                <label className="form-label">Type of Incident *</label>
                <select name="incidentType" value={form.incidentType} onChange={handleChange} className="input-field">
                  <option value="">Select incident type</option>
                  {incidentOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="form-group">
                  <label className="form-label">Date of Incident *</label>
                  <input name="incidentDate" type="date" value={form.incidentDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={handleChange} className="input-field" />
                </div>
                <div className="form-group">
                  <label className="form-label">Location of Incident</label>
                  <input name="incidentLocation" type="text" value={form.incidentLocation}
                    onChange={handleChange} className="input-field" placeholder="e.g. Lagos Island, Lagos" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Description of Incident *
                  <span className={`ml-2 text-xs ${form.description.length < 20 ? "text-gray-400" : "text-gsuccess-600"}`}>
                    ({form.description.length} chars — min 20)
                  </span>
                </label>
                <textarea name="description" rows={5} value={form.description} onChange={handleChange}
                  className="input-field resize-none"
                  placeholder="Describe what happened in detail — the more detail you provide, the faster we can process your claim..." />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Claim Amount (₦) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans text-gray-400 text-sm">₦</span>
                  <input name="claimedAmount" type="number" min="1" value={form.claimedAmount}
                    onChange={handleChange} className="input-field pl-8" placeholder="0.00" />
                </div>
                <p className="font-sans text-xs text-gray-400 mt-1">Enter the total amount you are claiming. Final settlement is subject to assessment.</p>
              </div>

              <div className="flex justify-end">
                <button onClick={nextStep} className="btn btn-primary px-8">Continue →</button>
              </div>
            </div>
          )}

          {/* ── Step 2: Upload Documents ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-gray-400 hover:text-navy-700 font-sans text-sm mb-4 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                  Back
                </button>
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-1">Supporting Documents</h2>
                <p className="font-sans text-sm text-gray-500">Upload evidence to support your claim. At least 1 document required.</p>
              </div>

              {/* What to upload based on policy type */}
              <div className="bg-navy-50 rounded-xl p-4">
                <p className="font-sans text-xs font-semibold text-navy-800 uppercase tracking-wide mb-2">Recommended documents for {policyType} claims:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {({
                    motor:    ["Police report (for accidents/theft)", "Photos of damage", "Repair estimate/invoice", "Driver's licence copy"],
                    health:   ["Hospital admission letter", "Medical bills/receipts", "Doctor's report", "Discharge summary"],
                    life:     ["Death certificate (if applicable)", "Medical report", "Policy schedule"],
                    travel:   ["Flight/hotel booking confirmation", "Medical report (if abroad)", "Police report (if theft)", "Receipts"],
                    property: ["Photos of damage", "Police report (if theft)", "Repair estimate", "Fire service report"],
                    business: ["Photos of damage", "Police report", "Financial records", "Repair estimate"],
                    corporate:["Photos of damage", "Police report", "Financial records", "Repair estimate"],
                  }[policyType] || ["Photos of incident", "Relevant receipts/invoices", "Police report if applicable"]).map((doc) => (
                    <div key={doc} className="flex items-center gap-2 font-sans text-xs text-navy-700">
                      <svg className="w-3 h-3 text-gold-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      {doc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload area */}
              <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-gold-400 hover:bg-gold-50 transition-all duration-200">
                <input type="file" multiple accept="image/jpeg,image/png,application/pdf" className="hidden" onChange={handleFileAdd} />
                <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-sans font-semibold text-navy-900 text-sm">Click to upload files</p>
                  <p className="font-sans text-xs text-gray-400 mt-1">JPG, PNG, PDF · Max 5MB each</p>
                </div>
              </label>

              {/* Uploaded files */}
              {form.documents.length > 0 && (
                <div className="space-y-2">
                  <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide">{form.documents.length} file(s) ready to upload</p>
                  {form.documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gsuccess-50 border border-gsuccess-200 rounded-xl px-4 py-3">
                      <svg className="w-4 h-4 text-gsuccess-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-medium text-navy-900 truncate">{doc.name}</p>
                        <p className="font-sans text-xs text-gray-400">{Math.round(doc.size / 1024)}KB · {doc.type.split("/")[1].toUpperCase()}</p>
                      </div>
                      <button onClick={() => removeDoc(i)} className="text-gray-400 hover:text-gerror-600 transition-colors flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="btn border-2 border-gray-200 text-gray-600 hover:border-navy-300 text-sm px-6">← Back</button>
                <button onClick={() => { if (form.documents.length === 0) { setError("Please upload at least one document."); return; } setError(""); setStep(3); }} className="btn btn-primary px-8">
                  Review & Submit →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Review & Submit ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-gray-400 hover:text-navy-700 font-sans text-sm mb-4 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                  Back
                </button>
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-1">Review Your Claim</h2>
                <p className="font-sans text-sm text-gray-500">Please review all details before submitting.</p>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="bg-navy-gradient px-6 py-4">
                  <p className="font-sans text-xs text-gold-400 uppercase tracking-widest">Claim Summary</p>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { label: "Policy",           value: `${policyType?.charAt(0).toUpperCase() + policyType?.slice(1)} Insurance` },
                    { label: "Policy Number",    value: form.selectedPolicy?.policyNumber },
                    { label: "Incident Type",    value: form.incidentType },
                    { label: "Incident Date",    value: form.incidentDate ? new Date(form.incidentDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                    { label: "Location",         value: form.incidentLocation || "Not specified" },
                    { label: "Claimed Amount",   value: `₦${Number(form.claimedAmount).toLocaleString()}` },
                    { label: "Documents",        value: `${form.documents.length} file(s) attached` },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between py-1 border-b border-gray-50 last:border-0">
                      <span className="font-sans text-xs text-gray-400">{row.label}</span>
                      <span className="font-sans text-sm font-semibold text-navy-900 text-right max-w-xs">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-sans text-xs font-semibold text-navy-800 mb-1">Description</p>
                <p className="font-sans text-sm text-gray-600 leading-relaxed">{form.description}</p>
              </div>

              <div className="bg-gold-50 border border-gold-200 rounded-xl p-4">
                <p className="font-sans text-xs text-gold-700 leading-relaxed">
                  <span className="font-semibold">Declaration:</span> I confirm that the information provided is accurate and complete to the best of my knowledge.
                  I understand that providing false information may invalidate my claim and could constitute fraud.
                </p>
              </div>

              <button onClick={handleSubmit} disabled={saving} className="btn btn-primary w-full py-4 text-base">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Submitting Claim...
                  </span>
                ) : "Submit Claim →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
