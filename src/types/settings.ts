export interface CompanySettingsPayload {
  name?: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
  currency?: string;
  logo?: string | null;
}

export interface SettingsShowResponse {
  company: {
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    currency: string;
    logo: string | null;
  };
  user: {
    name: string;
    email: string;
  };
}

export interface BrandingResponse {
  brand_name: string | null;
  primary_color: string;
  logo: string | null;
  company_name: string;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  created_at: string | null;
}

export interface SmsSettingsResponse {
  sms_provider: string | null;
  sms_sender_id: string | null;
  sms_api_key_set: boolean;
}

export interface SubscriptionInfoResponse {
  subscription: {
    status: string;
    trial_ends_at: string | null;
    plan: { name: string; slug: string; price: string } | null;
  } | null;
}
