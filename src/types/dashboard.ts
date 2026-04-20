export interface RevenueChartPoint {
  month: string;
  label: string;
  short_label?: string;
  expected: number;
  collected: number;
  /** @deprecated legacy single amount — prefer expected/collected */
  amount?: number;
}

export interface PropertyRevenueRow {
  property_id: number;
  name: string;
  type: string;
  revenue: number;
}

export interface PaymentMethodSlice {
  method: string;
  amount: number;
  percent: number;
}

export interface DashboardRecentPayment {
  id: number;
  tenant_name: string;
  unit: string;
  amount: number;
  method: string;
  reference: string | null;
  invoice_status: string;
  created_at: string | null;
}

export interface DashboardRecentMaintenance {
  id: number;
  title: string;
  unit: string;
  status: string;
  priority: string;
  property_name: string;
  created_at: string | null;
}

export interface DashboardSms {
  primary_provider: string;
  sent_today: number;
  failed: number;
  queued: number;
  sent_total: number;
  delivery_rate_percent: number;
}

/** Matches Laravel `DashboardController@index` payload (snake_case). */
export interface DashboardData {
  total_properties: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  units_in_maintenance: number;
  occupancy_rate: number;
  total_tenants: number;
  revenue_this_month: number;
  revenue_last_month: number;
  revenue_growth: number;
  pending_invoices_count: number;
  pending_invoices_amount: number;
  overdue_invoices_count: number;
  overdue_invoices_amount: number;
  open_maintenance_count: number;
  urgent_maintenance_count: number;
  revenue_chart: RevenueChartPoint[];
  revenue_by_property: PropertyRevenueRow[];
  payment_method_breakdown: PaymentMethodSlice[];
  recent_payments: DashboardRecentPayment[];
  recent_maintenance: DashboardRecentMaintenance[];
  expiring_leases?: unknown[];
  sms_this_month?: number;
  unread_notifications?: number;
  sms: DashboardSms;
}

export interface DashboardApiEnvelope {
  success: boolean;
  data: DashboardData;
  message: string;
}

export interface InvoiceChartSummaryRow {
  count: number;
  amount: number;
  trend: number[];
}

export interface InvoiceChartSummary {
  pending: InvoiceChartSummaryRow;
  overdue: InvoiceChartSummaryRow;
  paid: InvoiceChartSummaryRow;
  partial: InvoiceChartSummaryRow;
}

export interface MaintenanceStatsSummary {
  open: number;
  in_progress: number;
  resolved: number;
  urgent: number;
}

export interface TenantPaymentHistoryMonth {
  month_key: string;
  label: string;
  paid: number;
  expected: number;
  missed: boolean;
}

export interface TenantPaymentHistoryChartResponse {
  months: TenantPaymentHistoryMonth[];
  expected_monthly: number;
}
