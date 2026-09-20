export interface DashboardTotal {
  count: number;
  amount: number;
}

export interface StatusBreakdownItem {
  status: string;
  count: number;
  amount: number;
}

export interface RecentDocument {
  type: string;
  id: number;
  number: string;
  status: string;
  date: string;
  amount: number | null;
}

export interface SalesDashboardData {
  totals: {
    quotations: DashboardTotal;
    salesOrders: DashboardTotal;
    deliveryOrders: DashboardTotal;
    invoices: DashboardTotal;
    purchaseOrders: DashboardTotal;
    goodsReceipts: DashboardTotal;
  };
  statusBreakdown: {
    quotations: StatusBreakdownItem[];
    salesOrders: StatusBreakdownItem[];
    deliveryOrders: StatusBreakdownItem[];
    invoices: StatusBreakdownItem[];
    purchaseOrders: StatusBreakdownItem[];
    goodsReceipts: StatusBreakdownItem[];
  };
  recent: RecentDocument[];
}
