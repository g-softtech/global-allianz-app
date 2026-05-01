// This is the COMPLETE replacement for the KYC tab section in ProfilePage.jsx
// Replace the entire KYC tab content and the submitKYC function

// ── KYC State additions (add to component state) ──────────────
// const [kycFiles,   setKycFiles]   = useState({});
// const [nin,        setNin]        = useState("");
// const [kycSuccess, setKycSuccess] = useState("");

const KYC_DOCS = [
  { id: "id_card",        label: "National ID Card",       icon: "🪪", desc: "NIN slip or laminated ID card",    accept: "image/jpeg,image/png",                 required: true,  needsNin: true  },
  { id: "passport",       label: "International Passport", icon: "📘", desc: "Bio-data page clearly visible",    accept: "image/jpeg,image/png",                 required: false, needsNin: false },
  { id: "drivers_licence",label: "Driver's Licence",       icon: "🚗", desc: "Front of your driver's licence",   accept: "image/jpeg,image/png",                 required: false, needsNin: false },
  { id: "voters_card",    label: "Voter's Card",           icon: "🗳️",  desc: "Permanent Voter's Card (PVC)",     accept: "image/jpeg,image/png",                 required: false, needsNin: false },
  { id: "utility_bill",   label: "Utility Bill",           icon: "🧾", desc: "Not older than 3 months",          accept: "image/jpeg,image/png,application/pdf", required: true,  needsNin: false },
  { id: "bank_statement", label: "Bank Statement",         icon: "🏦", desc: "Last 3 months, PDF preferred",     accept: "application/pdf,image/jpeg,image/png", required: false, needsNin: false },
];

// ── Updated handleFileUpload ──────────────────────────────────
const handleFileUpload = (docId, file) => {
  if (!file) return;

  const MIN_FILE_SIZE = 50 * 1024;  // 50KB
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const isIdDoc = ["id_card", "passport", "drivers_licence", "voters_card"].includes(docId);
  const allowed = isIdDoc
    ? ["image/jpeg", "image/jpg", "image/png"]
    : ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

  if (!allowed.includes(file.type)) {
    showFeedback(isIdDoc
      ? `${file.name}: ID documents must be JPG or PNG images.`
      : `${file.name}: Only JPG, PNG, or PDF accepted.`, true);
    return;
  }
  if (file.size < MIN_FILE_SIZE) {
    showFeedback(`${file.name} is too small (${Math.round(file.size/1024)}KB). Please upload a clear, full-resolution photo — not a screenshot. Minimum: 50KB.`, true);
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    showFeedback(`${file.name} exceeds the 5MB limit.`, true);
    return;
  }

  setKycUploads(p => ({ ...p, [docId]: file.name }));
  setKycFiles(p  => ({ ...p, [docId]: file }));
};

// ── Updated submitKYC with NIN validation ─────────────────────
const submitKYC = async () => {
  // Check at least one document
  if (Object.keys(kycFiles).length === 0) {
    showFeedback("Please upload at least one document.", true);
    return;
  }

  // If ID card selected, NIN is compulsory
  if (kycFiles["id_card"] && (!nin || nin.length !== 11)) {
    showFeedback("NIN (11 digits) is required when submitting a National ID Card.", true);
    return;
  }

  // Validate NIN format if provided
  if (nin && !/^\d{11}$/.test(nin)) {
    showFeedback("NIN must be exactly 11 digits.", true);
    return;
  }

  setSaving(true);
  try {
    const documents = Object.entries(kycFiles).map(([type, file]) => ({
      type,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      url:      "pending_upload",
    }));

    await apiClient.post("/users/kyc", { documents, nin: nin || undefined });

    setKycSuccess("Documents submitted successfully! Our compliance team will review within 24–48 hours. You will be notified by email once verified.");
    setKycFiles({});
    setKycUploads({});
    setNin("");
  } catch (err) {
    const errors = err.response?.data?.errors;
    if (errors?.length > 0) {
      showFeedback(errors.join(" | "), true);
    } else {
      showFeedback(err.response?.data?.message || "Failed to submit documents. Please try again.", true);
    }
  } finally {
    setSaving(false);
  }
};
