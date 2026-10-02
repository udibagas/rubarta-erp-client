// Dummy data for the accounting module UI. Replace with API calls when BE is ready.

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

export const payables = () => [
  {
    id: 1,
    number: "BILL-0210",
    party: "PT Supplier Utama",
    date: "2026-09-02",
    dueDate: "2026-10-02",
    amount: 150000000,
    paid: 0,
    status: "OVERDUE",
  },
  {
    id: 2,
    number: "BILL-0215",
    party: "CV Bahan Baku",
    date: "2026-09-09",
    dueDate: "2026-10-09",
    amount: 72000000,
    paid: 30000000,
    status: "PARTIAL",
  },
  {
    id: 3,
    number: "BILL-0219",
    party: "PT Logistik Prima",
    date: "2026-09-18",
    dueDate: "2026-10-18",
    amount: 18500000,
    paid: 0,
    status: "OPEN",
  },
  {
    id: 4,
    number: "BILL-0201",
    party: "PT Supplier Utama",
    date: "2026-08-12",
    dueDate: "2026-09-12",
    amount: 95000000,
    paid: 95000000,
    status: "PAID",
  },
];

export const payments = () => [
  {
    id: 1,
    number: "RCV-0101",
    direction: "IN",
    date: "2026-09-12",
    party: "CV Sinar Abadi",
    method: "TRANSFER",
    account: "Bank BCA",
    reference: "INV-0418",
    amount: 20000000,
    status: "CONFIRMED",
  },
  {
    id: 2,
    number: "RCV-0102",
    direction: "IN",
    date: "2026-09-14",
    party: "PT Maju Jaya",
    method: "TRANSFER",
    account: "Bank Mandiri",
    reference: "INV-0399",
    amount: 44400000,
    status: "CONFIRMED",
  },
  {
    id: 3,
    number: "PAY-0055",
    direction: "OUT",
    date: "2026-09-16",
    party: "CV Bahan Baku",
    method: "TRANSFER",
    account: "Bank BCA",
    reference: "BILL-0215",
    amount: 30000000,
    status: "CONFIRMED",
  },
  {
    id: 4,
    number: "PAY-0056",
    direction: "OUT",
    date: "2026-09-20",
    party: "PT Supplier Utama",
    method: "GIRO",
    account: "Bank Mandiri",
    reference: "BILL-0201",
    amount: 95000000,
    status: "CONFIRMED",
  },
  {
    id: 5,
    number: "RCV-0103",
    direction: "IN",
    date: "2026-09-25",
    party: "UD Berkah",
    method: "CASH",
    account: "Cash on Hand",
    reference: "INV-0425",
    amount: 5000000,
    status: "DRAFT",
  },
];

export const cashBankAccounts = () => [
  {
    id: 1,
    code: "1-1000",
    name: "Cash on Hand",
    type: "CASH",
    bankName: "",
    accountNumber: "",
    balance: 25000000,
  },
  {
    id: 2,
    code: "1-1100",
    name: "Bank BCA",
    type: "BANK",
    bankName: "BCA",
    accountNumber: "1234567890",
    balance: 450000000,
  },
  {
    id: 3,
    code: "1-1200",
    name: "Bank Mandiri",
    type: "BANK",
    bankName: "Mandiri",
    accountNumber: "9876543210",
    balance: 275000000,
  },
];

export const sumDebitCredit = (lines: { debit?: number; credit?: number }[]) =>
  lines.reduce(
    (acc, l) => ({
      debit: (acc?.debit || 0) + (Number(l.debit) || 0),
      credit: (acc?.credit || 0) + (Number(l.credit) || 0),
    }),
    { debit: 0, credit: 0 },
  );
