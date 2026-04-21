import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import useScrollReveal from "../hooks/useScrollReveal";
import apiClient from "../services/apiClient";

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

const KYC_DOCS = [
  { id: "id_card",         label: "National ID Card",       icon: "🪪", desc: "NIN slip or laminated ID card", accept: "image/jpeg,image/png",            required: true  },
  { id: "passport",        label: "International Passport", icon: "📘", desc: "Bio-data page clearly visible", accept: "image/jpeg,image/png",            required: false },
  { id: "utility_bill",    label: "Utility Bill",           icon: "🧾", desc: "Not older than 3 months",       accept: "image/jpeg,image/png,application/pdf", required: true  },
  { id: "bank_statement",  label: "Bank Statement",         icon: "🏦", desc: "Last 3 months, PDF preferred",  accept: "application/pdf,image/jpeg,image/png",  required: false },
];

const TABS = ["Personal Info", "Address", "KYC Documents", "Security"];

export default function ProfilePage() {
  useScrollReveal();
  const { user, updateUser } = useAuthStore();

  const [activeTab,   setActiveTab]   = useState(0);
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState("");
  const [saveError,   setSaveError]   = useState("");

  // Personal info form
  const [personal, setPersonal] = useState({
    firstName:   user?.firstName   || "",
    lastName:    user?.lastName    || "",
    phone:       user?.phone       || "",
    dateOfBirth: user?.dateOfBirth || "",
    occupation:  user?.occupation  || "",
  });

  // Address form
  const [address, setAddress] = useState({
    street:  user?.address?.street  || "",
    city:    user?.address?.city    || "",
    state:   user?.address?.state   || "",
    zipCode: user?.address?.zipCode || "",
  });

  // Password form
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);

  // KYC uploads (mock — stores file names)
  const [kycUploads, setKycUploads] = useState({});
  const [kycSuccess, setKycSuccess] = useState("");
  const [nin,        setNin]        = useState("");

  const handlePersonalChange = (e) =>
    setPersonal((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAddressChange = (e) =>
    setAddress((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePasswordChange = (e) =>
    setPasswords((p) => ({ ...p, [e.target.name]: e.target.value }));

  const showFeedback = (msg, isError = false) => {
    if (isError) { setSaveError(msg); setSaveMsg(""); }
    else         { setSaveMsg(msg);   setSaveError(""); }
    setTimeout(() => { setSaveMsg(""); setSaveError(""); }, 4000);
  };

  const savePersonal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.put("/users/profile", personal);
      updateUser(res.data.data);
      showFeedback("Personal information updated successfully.");
    } catch {
      showFeedback("Failed to save. Please try again.", true);
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put("/users/profile", { address });
      showFeedback("Address updated successfully.");
    } catch {
      showFeedback("Failed to save address.", true);
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showFeedback("New passwords do not match.", true);
      return;
    }
    if (passwords.newPassword.length < 6) {
      showFeedback("New password must be at least 6 characters.", true);
      return;
    }
    setSaving(true);
    try {
      await apiClient.put("/users/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword:     passwords.newPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showFeedback("Password changed successfully.");
    } catch (err) {
      showFeedback(err.response?.data?.message || "Failed to change password.", true);
    } finally {
      setSaving(false);
    }
  };

  // MIN sizes to reject screenshots/thumbnails
  const MIN_FILE_SIZE = 50 * 1024; // 50KB
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  const ALLOWED_FOR_ID = ['image/jpeg', 'image/jpg', 'image/png'];

  const [kycFiles, setKycFiles] = useState({}); // stores File objects

  const handleFileUpload = (docId, file) => {
    if (!file) return;

    // File type check
    const isIdDoc = ['id_card', 'passport', 'drivers_licence', 'voters_card'].includes(docId);
    const allowed = isIdDoc ? ALLOWED_FOR_ID : ALLOWED_TYPES;

    if (!allowed.includes(file.type)) {
      showFeedback(
        isIdDoc
          ? `${file.name}: ID documents must be JPG or PNG images.`
          : `${file.name}: Only JPG, PNG, or PDF files accepted.`,
        true
      );
      return;
    }

    // Size checks
    if (file.size < MIN_FILE_SIZE) {
      showFeedback(
        `${file.name} is too small (${Math.round(file.size/1024)}KB). Please upload a clear, full-resolution photo — not a screenshot or thumbnail. Minimum size: 50KB.`,
        true
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showFeedback(`${file.name} is too large. Maximum file size is 5MB.`, true);
      return;
    }

    setKycUploads((p) => ({ ...p, [docId]: file.name }));
    setKycFiles((p) => ({ ...p, [docId]: file }));
  };

  const submitKYC = async () => {
    if (Object.keys(kycFiles).length === 0) {
      showFeedback("Please upload at least one document.", true);
      return;
    }
    setSaving(true);
    try {
      // Build document list with metadata
      const documents = Object.entries(kycFiles).map(([type, file]) => ({
        type,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        url:      'pending_upload',
      }));

      await apiClient.post("/users/kyc", { documents, nin: nin || undefined });
      setKycSuccess("Documents submitted! Our compliance team will verify within 24–48 hours. You will be notified by email.");
      setKycFiles({});
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors?.length > 0) {
        showFeedback(errors.join(' | '), true);
      } else {
        showFeedback(err.response?.data?.message || "Failed to submit documents.", true);
      }
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "input-field";
  const labelCls = "form-label";

  return (
    <div className="bg-section-gradient min-h-screen pt-24 pb-16">
      <div className="container-custom max-w-5xl">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-navy-900">My Profile</h1>
          <p className="font-sans text-gray-500 text-sm mt-1">
            Manage your personal information, address, KYC documents, and security settings.
          </p>
        </div>

        {/* Global feedback */}
        {saveMsg && (
          <div className="flex items-center gap-3 bg-gsuccess-50 border border-gsuccess-200 text-gsuccess-600 px-5 py-3 rounded-xl mb-6 font-sans text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {saveMsg}
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-3 bg-gerror-50 border border-gerror-200 text-gerror-600 px-5 py-3 rounded-xl mb-6 font-sans text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {saveError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">

            {/* Avatar card */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 text-center">
              <div className="w-20 h-20 bg-navy-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-navy">
                <span className="font-display text-2xl font-bold text-gold-400">
                  {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
                </span>
              </div>
              <h3 className="font-display font-semibold text-navy-900 text-base">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="font-sans text-xs text-gray-400 mt-0.5 capitalize">{user?.role || "Customer"}</p>

              {/* KYC badge */}
              <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-semibold ${
                user?.kycVerified
                  ? "bg-gsuccess-50 text-gsuccess-600 border border-gsuccess-200"
                  : "bg-orange-50 text-orange-600 border border-orange-200"
              }`}>
                <span>{user?.kycVerified ? "✅" : "⏳"}</span>
                {user?.kycVerified ? "KYC Verified" : "KYC Pending"}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-left space-y-2">
                <div>
                  <p className="font-sans text-xs text-gray-400">Email</p>
                  <p className="font-sans text-xs font-medium text-navy-700 truncate">{user?.email}</p>
                </div>
                <div>
                  <p className="font-sans text-xs text-gray-400">Phone</p>
                  <p className="font-sans text-xs font-medium text-navy-700">{user?.phone || "Not set"}</p>
                </div>
                <div>
                  <p className="font-sans text-xs text-gray-400">Member since</p>
                  <p className="font-sans text-xs font-medium text-navy-700">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-NG", { month: "long", year: "numeric" }) : "2026"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tab nav */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`w-full text-left px-5 py-3.5 font-sans text-sm transition-colors duration-200 flex items-center gap-3 border-b border-gray-50 last:border-0 ${
                    activeTab === i
                      ? "bg-navy-50 text-navy-900 font-semibold border-l-2 border-l-gold-500"
                      : "text-gray-500 hover:bg-gray-50 hover:text-navy-700"
                  }`}
                >
                  <span>{["👤","📍","🪪","🔒"][i]}</span>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8">

              {/* ── Tab 0: Personal Info ── */}
              {activeTab === 0 && (
                <form onSubmit={savePersonal} className="space-y-5">
                  <div className="mb-6">
                    <h2 className="font-display text-xl font-semibold text-navy-900">Personal Information</h2>
                    <p className="font-sans text-sm text-gray-500 mt-1">Update your basic personal details.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="form-group">
                      <label className={labelCls}>First Name</label>
                      <input name="firstName" type="text" value={personal.firstName}
                        onChange={handlePersonalChange} required className={inputCls} />
                    </div>
                    <div className="form-group">
                      <label className={labelCls}>Last Name</label>
                      <input name="lastName" type="text" value={personal.lastName}
                        onChange={handlePersonalChange} required className={inputCls} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className={labelCls}>Phone Number</label>
                    <input name="phone" type="tel" value={personal.phone}
                      onChange={handlePersonalChange} className={inputCls}
                      placeholder="+234 (0)80 123 4567" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="form-group">
                      <label className={labelCls}>Date of Birth</label>
                      <input name="dateOfBirth" type="date" value={personal.dateOfBirth}
                        onChange={handlePersonalChange} className={inputCls} />
                    </div>
                    <div className="form-group">
                      <label className={labelCls}>Occupation</label>
                      <input name="occupation" type="text" value={personal.occupation}
                        onChange={handlePersonalChange} className={inputCls}
                        placeholder="e.g. Software Engineer" />
                    </div>
                  </div>

                  {/* Email — read only */}
                  <div className="form-group">
                    <label className={labelCls}>Email Address</label>
                    <input type="email" value={user?.email || ""} readOnly
                      className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`} />
                    <p className="font-sans text-xs text-gray-400 mt-1">Email cannot be changed. Contact support if needed.</p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button type="submit" disabled={saving} className="btn btn-primary px-8">
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Saving...
                        </span>
                      ) : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}

              {/* ── Tab 1: Address ── */}
              {activeTab === 1 && (
                <form onSubmit={saveAddress} className="space-y-5">
                  <div className="mb-6">
                    <h2 className="font-display text-xl font-semibold text-navy-900">Home Address</h2>
                    <p className="font-sans text-sm text-gray-500 mt-1">Your residential address is required for some insurance policies.</p>
                  </div>

                  <div className="form-group">
                    <label className={labelCls}>Street Address</label>
                    <input name="street" type="text" value={address.street}
                      onChange={handleAddressChange} className={inputCls}
                      placeholder="e.g. 12 Adeola Odeku Street" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="form-group">
                      <label className={labelCls}>City / LGA</label>
                      <input name="city" type="text" value={address.city}
                        onChange={handleAddressChange} className={inputCls}
                        placeholder="e.g. Victoria Island" />
                    </div>
                    <div className="form-group">
                      <label className={labelCls}>State</label>
                      <select name="state" value={address.state}
                        onChange={handleAddressChange} className={inputCls}>
                        <option value="">Select state</option>
                        {NIGERIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className={labelCls}>Postal / ZIP Code</label>
                    <input name="zipCode" type="text" value={address.zipCode}
                      onChange={handleAddressChange} className={inputCls}
                      placeholder="e.g. 101001" />
                  </div>

                  {/* Country — always Nigeria */}
                  <div className="form-group">
                    <label className={labelCls}>Country</label>
                    <input type="text" value="Nigeria" readOnly
                      className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`} />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button type="submit" disabled={saving} className="btn btn-primary px-8">
                      {saving ? "Saving..." : "Save Address"}
                    </button>
                  </div>
                </form>
              )}

              {/* ── Tab 2: KYC Documents ── */}
              {activeTab === 2 && (
                <div className="space-y-6">
                  <div className="mb-2">
                    <h2 className="font-display text-xl font-semibold text-navy-900">KYC Verification</h2>
                    <p className="font-sans text-sm text-gray-500 mt-1">
                      Upload at least one government-issued ID and one proof of address to complete verification.
                    </p>
                  </div>

                  {/* Status banner */}
                  {user?.kycVerified ? (
                    <div className="flex items-center gap-3 bg-gsuccess-50 border border-gsuccess-200 rounded-xl px-5 py-4">
                      <svg className="w-5 h-5 text-gsuccess-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <p className="font-sans font-semibold text-gsuccess-700 text-sm">Identity Verified</p>
                        <p className="font-sans text-xs text-gsuccess-600 mt-0.5">Your KYC is complete. You have full access to all products.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl px-5 py-4">
                      <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-sans font-semibold text-orange-700 text-sm">Verification Required</p>
                        <p className="font-sans text-xs text-orange-600 mt-0.5">Upload your documents below to unlock full policy purchasing.</p>
                      </div>
                    </div>
                  )}

                  {kycSuccess && (
                    <div className="flex items-center gap-3 bg-gsuccess-50 border border-gsuccess-200 text-gsuccess-600 px-5 py-3 rounded-xl font-sans text-sm">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {kycSuccess}
                    </div>
                  )}

                  {/* NIN / BVN Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                    <div className="form-group">
                      <label className="form-label">NIN (National Identification Number)</label>
                      <input
                        type="text"
                        value={nin}
                        onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                        placeholder="11-digit NIN"
                        maxLength={11}
                        className="input-field font-mono tracking-widest"
                      />
                      <p className="font-sans text-xs text-gray-400 mt-1">Required for identity verification against NIMC database.</p>
                    </div>
                    <div className="bg-navy-50 rounded-xl p-4 flex flex-col justify-center">
                      <p className="font-sans text-xs font-semibold text-navy-800 mb-1">How we verify your identity</p>
                      <p className="font-sans text-xs text-navy-600 leading-relaxed">
                        Your NIN is checked against the NIMC database. Documents are reviewed by our compliance team within 24–48 hours. We never share your data with third parties.
                      </p>
                    </div>
                  </div>

                  {/* Document Upload Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {KYC_DOCS.map((doc) => {
                      const uploaded = kycUploads[doc.id];
                      return (
                        <label
                          key={doc.id}
                          htmlFor={`kyc-${doc.id}`}
                          className={`relative flex flex-col gap-3 p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                            uploaded
                              ? "border-gsuccess-400 bg-gsuccess-50"
                              : "border-gray-200 bg-gray-50 hover:border-gold-400 hover:bg-gold-50"
                          }`}
                        >
                          <input
                            id={`kyc-${doc.id}`}
                            type="file"
                            accept={doc.accept}
                            className="hidden"
                            onChange={(e) => {
                              handleFileUpload(doc.id, e.target.files[0]);
                              e.target.value = ''; // reset so same file can be re-selected
                            }}
                          />
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{doc.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-sans font-semibold text-navy-900 text-sm">{doc.label}</p>
                                {doc.required && (
                                  <span className="text-[10px] font-sans font-semibold bg-gerror-50 text-gerror-600 border border-gerror-200 px-1.5 py-0.5 rounded-full">Required</span>
                                )}
                              </div>
                              <p className="font-sans text-xs text-gray-400 mt-0.5">{doc.desc}</p>
                              <p className="font-sans text-xs text-gray-400 mt-0.5">Min: 50KB · Max: 5MB · {doc.accept.replace('application/pdf', 'PDF').replace('image/jpeg,image/png', 'JPG/PNG')}</p>
                            </div>
                            {uploaded && (
                              <svg className="w-5 h-5 text-gsuccess-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          {uploaded ? (
                            <p className="font-sans text-xs text-gsuccess-600 font-medium truncate">✓ {uploaded}</p>
                          ) : (
                            <p className="font-sans text-xs text-gold-600 font-medium">Click to upload (JPG, PNG or PDF)</p>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  <div className="bg-navy-50 rounded-xl px-5 py-4">
                    <p className="font-sans text-xs text-navy-700 leading-relaxed">
                      <span className="font-semibold">Important:</span> Documents must be clear, unedited, and fully visible.
                      Accepted formats: JPG, PNG, PDF. Max file size: 5MB per document.
                      Your data is protected under NDPR and will not be shared with third parties.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={submitKYC}
                      disabled={saving || Object.keys(kycUploads).length === 0}
                      className="btn btn-primary px-8"
                    >
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Submitting...
                        </span>
                      ) : "Submit Documents"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Tab 3: Security ── */}
              {activeTab === 3 && (
                <form onSubmit={savePassword} className="space-y-5">
                  <div className="mb-6">
                    <h2 className="font-display text-xl font-semibold text-navy-900">Security Settings</h2>
                    <p className="font-sans text-sm text-gray-500 mt-1">Change your password to keep your account secure.</p>
                  </div>

                  <div className="form-group">
                    <label className={labelCls}>Current Password</label>
                    <div className="relative">
                      <input name="currentPassword" type={showPw ? "text" : "password"}
                        value={passwords.currentPassword} onChange={handlePasswordChange}
                        required className={`${inputCls} pr-12`} placeholder="Enter current password" />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d={showPw
                              ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className={labelCls}>New Password</label>
                    <input name="newPassword" type="password" value={passwords.newPassword}
                      onChange={handlePasswordChange} required className={inputCls}
                      placeholder="Min. 6 characters" />
                    {passwords.newPassword && (
                      <div className="mt-2 flex gap-1">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                            passwords.newPassword.length >= i * 3
                              ? i <= 1 ? "bg-gerror-600" : i <= 2 ? "bg-orange-400" : i <= 3 ? "bg-gold-500" : "bg-gsuccess-600"
                              : "bg-gray-100"
                          }`} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className={labelCls}>Confirm New Password</label>
                    <input name="confirmPassword" type="password" value={passwords.confirmPassword}
                      onChange={handlePasswordChange} required className={inputCls}
                      placeholder="Repeat new password" />
                    {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                      <p className="form-error">Passwords do not match</p>
                    )}
                  </div>

                  {/* Security tips */}
                  <div className="bg-navy-50 rounded-xl px-5 py-4 space-y-1.5">
                    <p className="font-sans text-xs font-semibold text-navy-800 mb-2">Password requirements:</p>
                    {[
                      { ok: passwords.newPassword.length >= 6,  text: "At least 6 characters" },
                      { ok: /[A-Z]/.test(passwords.newPassword), text: "One uppercase letter" },
                      { ok: /[0-9]/.test(passwords.newPassword), text: "One number" },
                    ].map((req) => (
                      <div key={req.text} className="flex items-center gap-2">
                        <svg className={`w-3.5 h-3.5 ${req.ok ? "text-gsuccess-600" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className={`font-sans text-xs ${req.ok ? "text-gsuccess-600" : "text-gray-400"}`}>{req.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button type="submit" disabled={saving} className="btn btn-primary px-8">
                      {saving ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
