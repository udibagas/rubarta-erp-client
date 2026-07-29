<template>
  <el-dialog
    v-model="show"
    width="90%"
    :title="!!form.id ? 'EDIT INVOICE' : 'CREATE NEW INVOICE'"
    :close-on-click-modal="false"
    top="5vh"
  >
    <el-form label-width="140px" label-position="left">
      <!-- Invoice Header -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">Invoice Information</span>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="Invoice Number"
              :error="errors.number"
              required
            >
              <el-input
                placeholder="e.g., INV-2026-001"
                v-model="form.number"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Status" :error="errors.status" required>
              <el-select v-model="form.status" placeholder="Invoice status">
                <el-option
                  v-for="status in invoiceStatuses"
                  :key="status"
                  :value="status"
                  :label="status"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Customer" :error="errors.customerId" required>
              <el-select
                v-model="form.customerId"
                placeholder="Select customer"
                filterable
                default-first-option
              >
                <el-option
                  v-for="customer in customers"
                  :key="customer.id"
                  :value="customer.id"
                  :label="customer.name"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="User" :error="errors.userId" required>
              <el-select
                v-model="form.userId"
                placeholder="Select user"
                filterable
                default-first-option
              >
                <el-option
                  v-for="user in users"
                  :key="user.id"
                  :value="user.id"
                  :label="user.name"
                />
                <template #prefix>
                  <el-icon><ElIconUser /></el-icon>
                </template>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Issue Date" :error="errors.issueDate" required>
              <el-date-picker
                v-model="form.issueDate"
                type="date"
                placeholder="Invoice issue date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Due Date" :error="errors.dueDate" required>
              <el-date-picker
                v-model="form.dueDate"
                type="date"
                placeholder="Payment due date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Description" :error="errors.description">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="Invoice description"
            v-model="form.description"
          ></el-input>
        </el-form-item>
      </el-card>

      <!-- Invoice Items -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-semibold">Invoice Items</span>
            <el-button
              type="primary"
              size="small"
              :icon="ElIconPlus"
              @click="addItem"
            >
              Add Item
            </el-button>
          </div>
        </template>

        <el-table :data="form.items" stripe border>
          <el-table-column label="#" type="index" width="50" />

          <el-table-column label="Description" min-width="250">
            <template #default="{ row }">
              <el-input
                v-model="row.description"
                placeholder="Item description"
                size="small"
              ></el-input>
            </template>
          </el-table-column>

          <el-table-column label="Quantity" width="120">
            <template #default="{ row }">
              <el-input-number
                v-model="row.quantity"
                :min="1"
                size="small"
                style="width: 100%"
                @change="calculateTotals"
              ></el-input-number>
            </template>
          </el-table-column>

          <el-table-column label="Unit Price" width="150">
            <template #default="{ row }">
              <el-input-number
                v-model="row.unitPrice"
                :min="0"
                :precision="2"
                size="small"
                style="width: 100%"
                @change="calculateTotals"
              ></el-input-number>
            </template>
          </el-table-column>

          <el-table-column label="Discount %" width="100">
            <template #default="{ row }">
              <el-input-number
                v-model="row.discount"
                :min="0"
                :max="100"
                :precision="2"
                size="small"
                style="width: 100%"
                @change="calculateTotals"
              ></el-input-number>
            </template>
          </el-table-column>

          <el-table-column label="Tax %" width="100">
            <template #default="{ row }">
              <el-input-number
                v-model="row.taxRate"
                :min="0"
                :max="100"
                :precision="2"
                size="small"
                style="width: 100%"
                @change="calculateTotals"
              ></el-input-number>
            </template>
          </el-table-column>

          <el-table-column label="Amount" width="150" align="right">
            <template #default="{ row }">
              <strong>{{ toDecimal(calculateItemAmount(row)) }}</strong>
            </template>
          </el-table-column>

          <el-table-column label="Actions" width="80" align="center">
            <template #default="{ $index }">
              <el-button
                type="danger"
                size="small"
                :icon="ElIconDelete"
                @click="removeItem($index)"
                circle
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Additional Information -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">Additional Information</span>
        </template>

        <el-form-item label="Payment Terms" :error="errors.paymentTerms">
          <el-input
            placeholder="e.g., Net 30, Due on receipt"
            v-model="form.paymentTerms"
          ></el-input>
        </el-form-item>

        <el-form-item label="Notes" :error="errors.notes">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="Additional notes"
            v-model="form.notes"
          ></el-input>
        </el-form-item>
      </el-card>

      <!-- Invoice Summary -->
      <el-card shadow="never">
        <template #header>
          <span class="font-semibold">Invoice Summary</span>
        </template>

        <el-row :gutter="20">
          <el-col :span="12" :offset="12">
            <div class="space-y-2">
              <div class="flex justify-between text-base">
                <span>Subtotal:</span>
                <span>{{ toDecimal(totals.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-base">
                <span>Total Discount:</span>
                <span class="text-red-500">
                  -{{ toDecimal(totals.discount) }}
                </span>
              </div>
              <div class="flex justify-between text-base">
                <span>Total Tax:</span>
                <span>{{ toDecimal(totals.tax) }}</span>
              </div>
              <el-divider class="my-2" />
              <div
                class="flex justify-between text-xl font-bold text-green-600"
              >
                <span>Total Amount:</span>
                <span>{{ toDecimal(totals.total) }}</span>
              </div>
              <el-divider class="my-2" />
              <el-form-item label="Paid Amount" :error="errors.paidAmount">
                <el-input-number
                  v-model="form.paidAmount"
                  :min="0"
                  :max="totals.total"
                  :precision="2"
                  style="width: 100%"
                  @change="calculateBalance"
                ></el-input-number>
              </el-form-item>
              <div
                class="flex justify-between text-lg font-semibold"
                :class="balance > 0 ? 'text-red-600' : 'text-green-600'"
              >
                <span>Balance Due:</span>
                <span>{{ toDecimal(balance) }}</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </el-form>

    <template #footer>
      <el-button :icon="ElIconCircleCloseFilled" @click="closeForm">
        CANCEL
      </el-button>
      <el-button
        :icon="ElIconSuccessFilled"
        type="success"
        @click="save"
        :loading="isSaving"
      >
        SAVE INVOICE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";

const request = useRequest();
const queryClient = useQueryClient();
const { companyId } = storeToRefs(useSharedStore());

// Invoice statuses
const invoiceStatuses = [
  "Draft",
  "Sent",
  "PartiallyPaid",
  "Paid",
  "Overdue",
  "Cancelled",
  "Void",
];

// Local state
const show = ref(false);
const form = ref({
  status: "Draft",
  paidAmount: 0,
  items: [],
  issueDate: "",
  dueDate: "",
});
const errors = ref({});
const isSaving = ref(false);
const balance = ref(0);

// Expose method to open form from parent
const openForm = (data = {}) => {
  form.value = {
    ...data,
    companyId: data.companyId || companyId.value,
    status: data.status || "Draft",
    paidAmount: data.paidAmount || 0,
    items: data.items || [
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 0,
      },
    ],
  };

  // Set dates if new invoice
  if (!data.id) {
    const today = new Date();
    form.value.issueDate = today.toISOString().split("T")[0];

    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from today
    form.value.dueDate = dueDate.toISOString().split("T")[0];
  }

  errors.value = {};
  show.value = true;
  calculateTotals();
};

const closeForm = () => {
  show.value = false;
  form.value = {
    status: "Draft",
    paidAmount: 0,
    items: [],
    issueDate: "",
    dueDate: "",
  };
  errors.value = {};
  balance.value = 0;
};

const save = async () => {
  try {
    isSaving.value = true;
    errors.value = {};

    const payload = {
      ...form.value,
      subtotal: totals.subtotal,
      discountAmount: totals.discount,
      taxAmount: totals.tax,
      totalAmount: totals.total,
    };

    if (form.value.id) {
      await request(`/api/invoices/${form.value.id}`, {
        method: "PATCH",
        body: payload,
      });
    } else {
      await request("/api/invoices", {
        method: "POST",
        body: payload,
      });
    }

    ElMessage.success("Invoice saved successfully");
    closeForm();
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
  } catch (error) {
    errors.value = parseError(error);
    ElMessage.error(error.message || "Failed to save invoice");
  } finally {
    isSaving.value = false;
  }
};

defineExpose({ openForm });

const totals = reactive({
  subtotal: 0,
  discount: 0,
  tax: 0,
  total: 0,
});

// Item management
const addItem = () => {
  form.value.items.push({
    description: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    taxRate: 0,
  });
};

const removeItem = (index) => {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1);
    calculateTotals();
  } else {
    ElMessage.warning("At least one item is required");
  }
};

// Calculations
const calculateItemAmount = (item) => {
  const subtotal = item.quantity * item.unitPrice;
  const discountAmount = (subtotal * (item.discount || 0)) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * (item.taxRate || 0)) / 100;
  return afterDiscount + taxAmount;
};

const calculateTotals = () => {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  form.value.items.forEach((item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const discountAmount = (itemSubtotal * (item.discount || 0)) / 100;
    const afterDiscount = itemSubtotal - discountAmount;
    const taxAmount = (afterDiscount * (item.taxRate || 0)) / 100;

    subtotal += itemSubtotal;
    totalDiscount += discountAmount;
    totalTax += taxAmount;
  });

  totals.subtotal = subtotal;
  totals.discount = totalDiscount;
  totals.tax = totalTax;
  totals.total = subtotal - totalDiscount + totalTax;

  calculateBalance();
};

const calculateBalance = () => {
  balance.value = totals.total - (form.value.paidAmount || 0);
};

// Fetch customers
const { data: customers } = useQuery({
  queryKey: ["customers", companyId],
  queryFn: async () => {
    const params = new URLSearchParams();
    if (companyId.value) {
      params.append("companyId", companyId.value);
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    return await request(`/api/customers${query}`);
  },
  enabled: computed(() => !!companyId.value),
});

// Fetch users
const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: async () => {
    return await request("/api/users");
  },
});

// Watch for form changes to recalculate
watch(
  () => form.value.items,
  () => {
    if (show.value) {
      calculateTotals();
    }
  },
  { deep: true },
);
</script>

<style scoped>
.space-y-2 > * + * {
  margin-top: 0.5rem;
}
</style>
