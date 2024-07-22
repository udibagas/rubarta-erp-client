import { defineStore } from "pinia";
const api = useApi();

export const useWebsiteStore = defineStore("website", {
  state: () => ({
    banks: [],
    companies: [],
    companyId: useCookie("companyId"),
    departments: [],
    expenseTypes: [],
    users: [],
    roles: [
      "USER",
      "CASHIER",
      "FINANCE",
      "ACCOUNTING",
      "GA",
      "APPROVER",
      "VERIFIER",
      "AUTHORIZER",
      "ADMIN",
    ],
    approvalTypes: ["PAYMENT_AUTHORIZATION", "EXPENSE_CLAIM"],
    approvalActionTypes: ["APPROVAL", "VERIFICATION", "AUTHORIZATION"],
    paymentStatuses: [
      "DRAFT",
      "SUBMITTED",
      "PARTIIALLY_APPROVED",
      "FULLY_APPROVED",
      "REJECTED",
      "VERIFIED",
      "AUTHORIZED",
      "PAID",
    ],
    claimStatuses: [
      "DRAFT",
      "SUBMITTED",
      "PARTIIALLY_APPROVED",
      "FULLY_APPROVED",
      "REJECTED",
      "VERIFIED",
      "AUTHORIZED",
      "PAID",
    ],
  }),

  actions: {
    async getBanks() {
      const data = await api("/api/banks");
      this.banks = data;
    },

    async getCompanies() {
      const data = await api("/api/companies");
      this.companies = data;
    },

    async getDepartments() {
      const data = await api("/api/departments");
      this.departments = data;
    },

    async getExpenseTypes() {
      const data = await api("/api/expense-types");
      this.expenseTypes = data;
    },

    async getUsers() {
      const data = await api("/api/users");
      this.users = data;
    },

    setCompany(id) {
      this.companyId = id;
    },
  },
});
