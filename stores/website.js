import { ElMessage } from "element-plus";
import { defineStore } from "pinia";

const config = useRuntimeConfig();
const fetch = $fetch.create({
  baseURL: config.public.apiBase,
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const useWebsiteStore = defineStore("website", {
  state: () => ({
    banks: [],
    companies: [],
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
      const data = await fetch("/api/banks");
      this.banks = data;
    },

    async getCompanies() {
      const data = await fetch("/api/companies");
      this.companies = data;
    },

    async getDepartments() {
      const data = await fetch("/api/departments");
      this.departments = data;
    },

    async getExpenseTypes() {
      const data = await fetch("/api/expense-types");
      this.expenseTypes = data;
    },

    async getUsers() {
      const data = await fetch("/api/users");
      this.users = data;
    },
  },
});
