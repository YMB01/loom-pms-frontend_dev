export interface Property {
  id: number;
  company_id: number;
  name: string;
  type: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  total_units: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Unit {
  id: number;
  property_id: number;
  property?: Property | null;
  unit_number: string;
  type: string | null;
  floor: number | null;
  size_sqm: string | null;
  rent_amount: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface Tenant {
  id: number;
  company_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  id_number: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Lease {
  id: number;
  tenant_id: number;
  unit_id: number;
  start_date: string | null;
  end_date: string | null;
  rent_amount: string | null;
  deposit_amount: string | null;
  status: string;
  tenant?: Tenant | null;
  unit?: Unit | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Invoice {
  id: number;
  lease_id: number;
  tenant_id: number;
  amount: string | null;
  due_date: string | null;
  status: string;
  /** Present when API eager-loads lease + unit + property. */
  lease?: (Lease & { unit?: Unit | null }) | null;
  tenant?: Tenant | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Payment {
  id: number;
  invoice_id: number;
  tenant_id: number;
  amount: string | null;
  method: string | null;
  reference: string | null;
  invoice?: (Invoice & {
    lease?: (Lease & { unit?: Unit | null }) | null;
  }) | null;
  tenant?: Tenant | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MaintenanceRequest {
  id: number;
  property_id: number;
  unit: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  assigned_to: number | null;
  property?: Property | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SmsLog {
  id: number;
  company_id: number;
  to_number: string;
  message: string;
  trigger: string | null;
  provider: string | null;
  status: string;
  cost: string | null;
  created_at: string | null;
  updated_at: string | null;
}
