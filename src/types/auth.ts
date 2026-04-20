export type AuthCompanySubscription = {
  status: string;
  trial_ends_at: string | null;
  plan: { slug: string; name: string; price: string } | null;
};

export type AuthCompany = {
  id?: number;
  name?: string;
  email?: string;
  status?: string;
  requires_upgrade?: boolean;
  billing_portal_available?: boolean;
  subscription?: AuthCompanySubscription | null;
};

export interface AuthUser {
  id: number;
  company_id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  company?: AuthCompany | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface LoginApiResponse {
  success: boolean;
  data: {
    user: AuthUser;
    token: string;
  };
  message: string;
}

export interface MeApiResponse {
  success: boolean;
  data: {
    user: AuthUser;
  };
  message: string;
}
