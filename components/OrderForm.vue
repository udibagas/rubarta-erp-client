<template>
  <el-dialog
    v-model="show"
    width="90%"
    :title="!!form.id ? 'EDIT ORDER' : 'CREATE NEW ORDER'"
    :close-on-click-modal="false"
    top="5vh"
  >
    <el-form label-width="140px" label-position="left">
      <!-- Order Header -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">Order Information</span>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Order Number" :error="errors.number" required>
              <el-input
                placeholder="e.g., ORD-2026-001"
                v-model="form.number"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Status" :error="errors.status" required>
              <el-select v-model="form.status" placeholder="Order status">
                <el-option
                  v-for="status in orderStatuses"
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
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Delivery Date" :error="errors.deliveryDate">
              <el-date-picker
                v-model="form.deliveryDate"
                type="date"
                placeholder="Expected delivery date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Payment Terms" :error="errors.paymentTerms">
              <el-input
                placeholder="e.g., Net 30"
                v-model="form.paymentTerms"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- Order Items -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-semibold">Order Items</span>
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

          <el-table-column label="Part Number" width="150">
            <template #default="{ row }">
              <el-input
                v-model="row.partNumber"
                placeholder="Part #"
                size="small"
              ></el-input>
            </template>
          </el-table-column>

          <el-table-column label="Description" min-width="200">
            <template #default="{ row }">
              <el-input
                v-model="row.description"
                placeholder="Description"
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

          <el-table-column label="VAT" width="80" align="center">
            <template #default="{ row }">
              <el-checkbox
                v-model="row.vat"
                @change="calculateTotals"
              ></el-checkbox>
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

        <el-form-item label="Shipping Address" :error="errors.shippingAddress">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="Shipping address"
            v-model="form.shippingAddress"
          ></el-input>
        </el-form-item>

        <el-form-item label="Billing Address" :error="errors.billingAddress">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="Billing address"
            v-model="form.billingAddress"
          ></el-input>
        </el-form-item>
      </el-card>

      <!-- Order Summary -->
      <el-card shadow="never">
        <template #header>
          <span class="font-semibold">Order Summary</span>
        </template>

        <el-row :gutter="20">
          <el-col :span="12" :offset="12">
            <div class="space-y-2">
              <div class="flex justify-between text-base">
                <span>Subtotal:</span>
                <span>{{ toDecimal(totals.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-base">
                <span>Order Discount:</span>
                <el-input-number
                  v-model="form.discount"
                  :min="0"
                  :precision="2"
                  size="small"
                  @change="calculateTotals"
                  style="width: 150px"
                ></el-input-number>
              </div>
              <div class="flex justify-between text-base">
                <span>VAT (11%):</span>
                <span>{{ toDecimal(totals.vat) }}</span>
              </div>
              <el-divider class="my-2" />
              <div
                class="flex justify-between text-xl font-bold text-green-600"
              >
                <span>Grand Total:</span>
                <span>{{ toDecimal(totals.grandTotal) }}</span>
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
      <el-button :icon="ElIconSuccessFilled" type="success" @click="save(form)">
        SAVE ORDER
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";
import { orderStatuses } from "~/constants/orderStatuses";

const { errors, form, show, closeForm, saveMutation, request } = useCrud({
  url: "/api/orders",
  queryKey: "orders",
});

const { mutate: save } = saveMutation();

// Initialize form with items array
watch(show, (newVal) => {
  if (newVal && !form.value.id) {
    form.value.status = "Pending";
    form.value.discount = 0;
    form.value.items = [
      {
        partNumber: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        vat: false,
      },
    ];
  }
});

const totals = reactive({
  subtotal: 0,
  vat: 0,
  grandTotal: 0,
});

const { data: customers } = useQuery({
  queryKey: ["customers"],
  queryFn: () => request("/api/customers"),
});

const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: () => request("/api/users"),
});

function addItem() {
  if (!form.value.items) {
    form.value.items = [];
  }
  form.value.items.push({
    partNumber: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    vat: false,
  });
}

function removeItem(index) {
  form.value.items.splice(index, 1);
  calculateTotals();
}

function calculateItemAmount(item) {
  const baseAmount = item.quantity * item.unitPrice;
  const discountAmount = baseAmount * ((item.discount || 0) / 100);
  const amountAfterDiscount = baseAmount - discountAmount;
  const vatAmount = item.vat ? amountAfterDiscount * 0.11 : 0;
  return amountAfterDiscount + vatAmount;
}

function calculateTotals() {
  if (!form.value.items || form.value.items.length === 0) {
    totals.subtotal = 0;
    totals.vat = 0;
    totals.grandTotal = 0;
    return;
  }

  let subtotal = 0;
  let vatTotal = 0;

  form.value.items.forEach((item) => {
    const baseAmount = item.quantity * item.unitPrice;
    const discountAmount = baseAmount * ((item.discount || 0) / 100);
    const amountAfterDiscount = baseAmount - discountAmount;

    subtotal += amountAfterDiscount;

    if (item.vat) {
      vatTotal += amountAfterDiscount * 0.11;
    }
  });

  // Apply order-level discount
  const orderDiscount = form.value.discount || 0;
  subtotal -= orderDiscount;

  totals.subtotal = subtotal;
  totals.vat = vatTotal;
  totals.grandTotal = subtotal + vatTotal;
}

// Watch items changes
watch(
  () => form.value.items,
  () => {
    calculateTotals();
  },
  { deep: true },
);
</script>
