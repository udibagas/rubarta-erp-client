export const ACCOUNT_TYPES = [
  { value: "ASSET", label: "Asset", normal: "DEBIT" },
  { value: "LIABILITY", label: "Liability", normal: "CREDIT" },
  { value: "EQUITY", label: "Equity", normal: "CREDIT" },
  { value: "REVENUE", label: "Revenue", normal: "CREDIT" },
  { value: "EXPENSE", label: "Expense", normal: "DEBIT" },
];

export const ACCOUNTING_STATUS_TAG: Record<string, string> = {
  DRAFT: "info",
  POSTED: "success",
  VOID: "danger",
  OPEN: "warning",
  PARTIAL: "primary",
  PAID: "success",
  OVERDUE: "danger",
  CLOSED: "info",
  CONFIRMED: "success",
  ACTIVE: "success",
  INACTIVE: "info",
};

export const accountingTagType = (status: string) =>
  ACCOUNTING_STATUS_TAG[status] || "info";

export const PAYMENT_METHODS = ["TRANSFER", "CASH", "CHEQUE", "GIRO"];

export const sumDebitCredit = (lines: { debit?: number; credit?: number }[]) =>
  lines.reduce(
    (acc, l) => ({
      debit: (acc?.debit || 0) + (Number(l.debit) || 0),
      credit: (acc?.credit || 0) + (Number(l.credit) || 0),
    }),
    { debit: 0, credit: 0 },
  );
