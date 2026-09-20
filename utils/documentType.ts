import {
  FileText,
  ShoppingCart,
  Truck,
  Receipt,
  ClipboardList,
  PackageCheck,
} from "lucide-vue-next";

export interface DocumentTypeMeta {
  label: string;
  route: string;
  icon: unknown;
  color: string;
}

export const documentTypeMeta: Record<string, DocumentTypeMeta> = {
  quotation: {
    label: "Quotation",
    route: "/sales/quotations",
    icon: FileText,
    color: "#8E44AD",
  },
  salesOrder: {
    label: "Sales Order",
    route: "/sales/orders",
    icon: ShoppingCart,
    color: "#409EFF",
  },
  deliveryOrder: {
    label: "Delivery Order",
    route: "/purchasing-logistics/delivery-orders",
    icon: Truck,
    color: "#17A2B8",
  },
  invoice: {
    label: "Invoice",
    route: "/sales/invoices",
    icon: Receipt,
    color: "#019932",
  },
  purchaseOrder: {
    label: "Purchase Order",
    route: "/purchasing-logistics/purchase-orders",
    icon: ClipboardList,
    color: "#E6A23C",
  },
  goodsReceipt: {
    label: "Goods Receipt",
    route: "/purchasing-logistics/goods-receipts",
    icon: PackageCheck,
    color: "#9C27B0",
  },
};

export const getDocumentTypeMeta = (type: string): DocumentTypeMeta =>
  documentTypeMeta[type] ?? {
    label: type,
    route: "/",
    icon: FileText,
    color: "#909399",
  };
