// User Types
export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: "customer" | "admin" | "agent";
  createdAt: string;
  kycVerified: boolean;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// Policy Types
export interface Policy {
  id: string;
  userId: string;
  type: "motor" | "health" | "life" | "travel" | "corporate";
  status: "active" | "pending" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
  premium: number;
  coverage: Record<string, any>;
  createdAt: string;
}

// Claims Types
export interface Claim {
  id: string;
  policyId: string;
  userId: string;
  status: "submitted" | "under_review" | "approved" | "rejected" | "paid";
  description: string;
  amount: number;
  documents: string[];
  submittedAt: string;
  resolvedAt?: string;
}

// Payment Types
export interface Payment {
  id: string;
  userId: string;
  policyId?: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  provider: "paystack" | "flutterwave";
  reference: string;
  createdAt: string;
}
