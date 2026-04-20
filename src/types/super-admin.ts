export type SuperAdminMeApiResponse = {
  success: boolean;
  data?: {
    role: string;
    email: string | null;
  };
  message: string;
};

export type SuperAdminLoginApiResponse = {
  success: boolean;
  data?: {
    token: string;
    token_type: string;
    expires_in_hours: number;
  };
  message: string;
};

export type SuperAdminCompanyGrowthMonth = {
  month_key: string;
  label: string;
  short_label: string;
  new_signups: number;
  cumulative_companies: number;
};

export type SuperAdminDashboardData = {
  total_companies: number;
  active_companies: number;
  suspended_companies: number;
  trial_companies: number;
  new_signups_today: number;
  new_signups_this_week: number;
  total_properties_across_all: number;
  total_units_across_all: number;
  total_tenants_across_all: number;
  mrr: number;
  arr: number;
  revenue_by_plan: {
    free: number;
    starter: number;
    business: number;
    enterprise: number;
  };
  revenue_chart: Array<{ month_key: string; label: string; amount: number }>;
  company_signups_by_month: SuperAdminCompanyGrowthMonth[];
  recent_companies: Array<{
    id: number;
    name: string;
    email: string | null;
    created_at: string | null;
  }>;
  marketplace_orders_today: number;
  marketplace_revenue_today: number;
  system_health: {
    database: string;
    sms: string;
    storage: string;
    queue: string;
  };
};

export type SuperAdminDashboardApiResponse = {
  success: boolean;
  data?: SuperAdminDashboardData;
  message: string;
};

export type SuperAdminPlanRow = {
  id: number;
  name: string;
  slug: string;
  price: string;
  max_properties: number | null;
  max_units: number | null;
  max_tenants: number | null;
  features: string[];
};

export type SuperAdminPlansApiResponse = {
  success: boolean;
  data?: {
    plans: SuperAdminPlanRow[];
  };
  message: string;
};

export type SuperAdminCompanyRow = {
  id: number;
  name: string;
  email: string;
  plan: "free" | "basic" | "pro";
  plan_id: number | null;
  subscription_status: "trial" | "active" | "suspended" | "cancelled";
  account_status: "active" | "suspended";
  trial_ends_at: string | null;
  signup_at: string | null;
  properties_count: number;
  units_count: number;
  tenants_count: number;
  last_login_at: string | null;
};

export type SuperAdminCompaniesApiResponse = {
  success: boolean;
  data?: {
    companies: SuperAdminCompanyRow[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
  message: string;
};

export type SuperAdminBackupRow = {
  id: number;
  filename: string;
  disk_path: string;
  size: number;
  status: string;
  created_at: string | null;
};

export type SuperAdminBackupsApiResponse = {
  success: boolean;
  data?: {
    backups: SuperAdminBackupRow[];
  };
  message: string;
};

export type SuperAdminBackupSettingsApiResponse = {
  success: boolean;
  data?: {
    frequency: "daily" | "weekly";
  };
  message: string;
};

export type SuperAdminBackupRunApiResponse = {
  success: boolean;
  data?: {
    queued: boolean;
  };
  message: string;
};

export type SuperAdminBillingMonthRow = {
  month_key: string;
  label: string;
  amount: number;
};

export type SuperAdminMrrStackedMonth = {
  month_key: string;
  label: string;
  short_label: string;
  free: number;
  starter: number;
  business: number;
  enterprise: number;
  total: number;
};

export type SuperAdminBillingApiResponse = {
  success: boolean;
  data?: {
    revenue: {
      this_month: number;
      this_year: number;
      all_time: number;
      by_month: SuperAdminBillingMonthRow[];
      mrr_stacked_by_month: SuperAdminMrrStackedMonth[];
    };
    breakdown: {
      free_count: number;
      basic_count: number;
      pro_count: number;
      basic_paying_count: number;
      pro_paying_count: number;
      basic_price: number;
      pro_price: number;
      basic_mrr: number;
      pro_mrr: number;
      total_mrr: number;
    };
    payments: Array<{
      id: number;
      company_name: string;
      plan: string;
      amount: number;
      currency: string;
      date_paid: string | null;
      due_at: string | null;
      status: string;
    }>;
  };
  message: string;
};
