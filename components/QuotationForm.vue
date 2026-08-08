<template>
  <el-dialog
    v-model="show"
    width="1000px"
    :title="!!form.id ? 'EDIT QUOTATION' : 'CREATE NEW QUOTATION'"
    :close-on-click-modal="false"
    top="5vh"
  >
    <el-form label-width="160px" label-position="left">
      <!-- Quotation Header -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">QUOTATION INFORMATION</span>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Quotation Number" :error="errors.number">
              <el-input
                placeholder="e.g., QUO-2026-001"
                v-model="form.number"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Quotation Date">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="Date of quotation"
                format="DD-MMM-YYYY"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Validity" :error="errors.validity">
              <el-input
                type="number"
                placeholder="e.g., 30 days"
                v-model="form.validity"
                @change="
                  (v) =>
                    dayjs(form.date || undefined)
                      .add(v, 'day')
                      .format('YYYY-MM-DD')
                "
              >
                <template #suffix>
                  <span>days</span>
                </template>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Valid Until" :error="errors.validUntil">
              <el-date-picker
                v-model="form.validUntil"
                type="date"
                placeholder="Valid until date"
                format="DD-MMM-YYYY"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                disabled
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Title" :error="errors.title">
          <el-input placeholder="Quotation title" v-model="form.title" />
        </el-form-item>

        <el-form-item label="Description" :error="errors.description">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="Quotation description"
            v-model="form.description"
          />
        </el-form-item>
      </el-card>

      <!-- Customer Information -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">CUSTOMER INFORMATION</span>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Customer" :error="errors.customerId">
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
                />
                <template #prefix>
                  <el-icon><ElIconOfficeBuilding /></el-icon>
                </template>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="Customer Address"
              :error="errors.customerAddress"
            >
              <el-input
                placeholder="Customer address"
                v-model="form.customerAddress"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Contact Person" :error="errors.contactPerson">
              <el-input
                placeholder="Contact person name"
                v-model="form.contactPerson"
              >
                <template #prefix>
                  <el-icon><ElIconUser /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Contact Phone" :error="errors.contactPhone">
              <el-input
                placeholder="Contact phone number"
                v-model="form.contactPhone"
              >
                <template #prefix>
                  <el-icon><ElIconPhone /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- Sales & Request Type -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">SALES & REQUEST TYPE</span>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Sales Person" :error="errors.userId">
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
          <el-col :span="12">
            <el-form-item label="Request Type" :error="errors.requestType">
              <el-select
                v-model="form.requestType"
                placeholder="Select request type"
                default-first-option
              >
                <el-option
                  v-for="type in requestTypes"
                  :key="type.value"
                  :value="type.value"
                  :label="type.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- Payment & Delivery Terms -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">PAYMENT & DELIVERY TERMS</span>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Currency" :error="errors.currency">
              <el-select
                v-model="form.currency"
                placeholder="Select currency"
                default-first-option
              >
                <el-option
                  v-for="curr in currencies"
                  :key="curr"
                  :value="curr"
                  :label="curr"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Payment Method" :error="errors.paymentMethod">
              <el-select
                v-model="form.paymentMethod"
                placeholder="Select payment method"
                default-first-option
              >
                <el-option
                  v-for="method in paymentMethods"
                  :key="method.value"
                  :value="method.value"
                  :label="method.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Term of Payment" :error="errors.termOfPayment">
              <el-select
                v-model="form.termOfPayment"
                placeholder="Select payment term"
                default-first-option
              >
                <el-option
                  v-for="term in termOfPayments"
                  :key="term.value"
                  :value="term.value"
                  :label="term.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="Term of Delivery"
              :error="errors.termOfDelivery"
            >
              <el-select
                v-model="form.termOfDelivery"
                placeholder="Select delivery term"
                default-first-option
              >
                <el-option
                  v-for="term in termOfDeliveries"
                  :key="term.value"
                  :value="term.value"
                  :label="term.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- Terms & Conditions -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">TERMS & CONDITIONS</span>
        </template>

        <el-form-item
          label="Terms & Conditions"
          :error="errors.termsAndConditions"
        >
          <el-input
            type="textarea"
            :rows="3"
            placeholder="Terms and conditions"
            v-model="form.termsAndConditions"
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

        <el-form-item label="Attachments">
          <el-upload
            v-model:file-list="fileList"
            :action="`${config.public.apiBase}/api/file`"
            :with-credentials="true"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-success="handleSuccess"
            :multiple="true"
          >
            <el-button type="success" :icon="ElIconUpload">Upload</el-button>
          </el-upload>
        </el-form-item>
      </el-card>

      <!-- Quotation Items -->
      <el-card shadow="never" body-style="padding: 0">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">QUOTATION ITEMS</span>
            <el-button type="success" :icon="ElIconUpload" size="small">
              Import Items
            </el-button>
          </div>
        </template>

        <el-table :data="form.items" stripe>
          <el-table-column label="#" type="index" width="40" />

          <el-table-column label="Part Number" width="160">
            <template #default="{ row }">
              <el-select
                v-model="row.partNumber"
                placeholder="Select part number"
                @change="(v) => setMaterial(v, row)"
                filterable
                default-first-option
              >
                <el-option
                  v-for="material in materials"
                  :key="material.partNumber"
                  :value="material.partNumber"
                  :label="material.partNumber"
                />
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="Description" min-width="250">
            <template #default="{ row }">
              <div>
                <strong>{{ row.name }}</strong>
                <div class="text-xs text-gray-500">
                  {{ row.model }} - {{ row.description }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Quantity" width="120" align="center">
            <template #default="{ row }">
              <el-input
                v-model="row.quantity"
                style="width: 100%"
                @change="calculateTotals"
                class="font-mono"
                :parser="(v) => Number(v.replace(/\./g, '').replace(',', '.'))"
                :formatter="
                  (value) => {
                    if (!value) return '';
                    const parts = value.toString().split('.');
                    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                    return parts.join(',');
                  }
                "
              ></el-input>
            </template>
          </el-table-column>

          <el-table-column label="Unit Price" width="160">
            <template #default="{ row }">
              <el-input
                v-model="row.unitPrice"
                class="font-mono w-full"
                @change="calculateTotals"
                :parser="(v) => Number(v.replace(/\./g, '').replace(',', '.'))"
                :formatter="
                  (value) => {
                    if (!value) return '';
                    const parts = value.toString().split('.');
                    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                    return parts.join(',');
                  }
                "
              />
            </template>
          </el-table-column>

          <!-- <el-table-column label="Discount %" width="120">
            <template #default="{ row }">
              <el-input-number
                v-model="row.discount"
                :min="0"
                :max="100"
                :precision="2"
                style="width: 100%"
                :controls="false"
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
          </el-table-column> -->

          <el-table-column label="Amount" width="150" align="right">
            <template #default="{ row }">
              <span class="w-full font-mono">
                {{ toDecimal(calculateItemAmount(row)) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column width="80" align="center">
            <template #header>
              <el-button
                type="success"
                :icon="ElIconPlus"
                @click="addItem"
                link
              />
            </template>
            <template #default="{ $index }">
              <el-button
                type="danger"
                :icon="ElIconDelete"
                @click="removeItem($index)"
                link
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Quotation Summary -->
      <el-card shadow="never" class="mt-4">
        <el-row :gutter="20">
          <el-col :span="12" :offset="12">
            <div class="space-y-2">
              <div class="flex justify-between text-base">
                <span>Subtotal:</span>
                <el-input
                  class="font-mono font-bold w-[200px]!"
                  readonly
                  :model-value="toDecimal(totals.subtotal)"
                >
                </el-input>
              </div>
              <div class="flex justify-between text-base">
                <span>Quotation Discount:</span>
                <el-input
                  v-model="form.discount"
                  @change="calculateTotals"
                  class="font-mono font-bold w-[200px]!"
                  :parser="
                    (v) => Number(v.replace(/\./g, '').replace(',', '.'))
                  "
                  :formatter="
                    (value) => {
                      if (!value) return '';
                      const parts = value.toString().split('.');
                      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                      return parts.join(',');
                    }
                  "
                />
              </div>
              <div class="flex justify-between text-base">
                <span class="flex-1">VAT (11%):</span>
                <el-input
                  class="font-mono font-bold w-[200px]! text-right!"
                  readonly
                  :model-value="toDecimal(totals.vat)"
                />
              </div>
              <el-divider />
              <div
                class="flex justify-between text-xl font-semibold text-green-600"
              >
                <span>Grand Total:</span>
                <span
                  class="font-mono border border-green-500 rounded px-3 py-1 min-w-[200px] text-right"
                >
                  {{ toDecimal(totals.grandTotal) }}
                </span>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </el-form>

    <template #footer>
      <el-button
        :icon="ElIconCircleCloseFilled"
        @click="closeForm"
        type="info"
        plain
      >
        CANCEL
      </el-button>
      <el-button
        :icon="ElIconSuccessFilled"
        type="success"
        @click="save"
        :loading="isSaving"
      >
        SAVE QUOTATION
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { quotationStatuses } from "~/constants/quotationStatuses";
import { currencies } from "~/constants/currencies";
import { requestTypes } from "~/constants/requestTypes";
import { termOfPayments } from "~/constants/termOfPayments";
import { termOfDeliveries } from "~/constants/termOfDeliveries";
import { paymentMethods } from "~/constants/paymentMethods";
import dayjs from "dayjs";

const request = useRequest();
const queryClient = useQueryClient();

// Local state
const show = ref(false);

const form = ref({
  status: "Draft",
  discount: 0,
  items: [],
  date: dayjs().format("YYYY-MM-DD"),
  validity: 30,
  validUntil: dayjs().add(30, "day").format("YYYY-MM-DD"),
  currency: "IDR",
  termOfPayment: 30,
  termOfDelivery: "FOB",
  paymentMethod: "Bank Transfer",
  requestType: "Sales",
  customerAddress: "",
  contactPerson: "",
  contactPhone: "",
});
const errors = ref({});
const isSaving = ref(false);

const { data: materials } = useQuery({
  queryKey: ["materials"],
  queryFn: () => request("/api/materials"),
});

function setMaterial(partNumber, item) {
  const material = materials.value.find((m) => m.partNumber === partNumber);
  if (material) {
    item.name = material.name;
    item.model = material.model;
    item.description = material.description;
    item.unitPrice = material.sellingPrice;
  }
}

// Expose method to open form from parent
const openForm = (data = {}) => {
  form.value = {
    ...data,
    date: data.date || dayjs().format("YYYY-MM-DD"),
    validity: data.validity || 30,
    validUntil: data.validUntil || dayjs().add(30, "day").format("YYYY-MM-DD"),
    status: data.status || "Draft",
    discount: data.discount || 0,
    currency: data.currency || "IDR",
    termOfPayment: data.termOfPayment || 30,
    termOfDelivery: data.termOfDelivery || "FOB",
    paymentMethod: data.paymentMethod || "Bank Transfer",
    requestType: data.requestType || "Sales",
    customerAddress: data.customerAddress || "",
    contactPerson: data.contactPerson || "",
    contactPhone: data.contactPhone || "",
    items: data.items || [
      {
        partNumber: "",
        name: "",
        model: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        vat: false,
      },
    ],
  };

  // Set valid until to 30 days from now if new quotation
  if (!data.id) {
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 30);
    form.value.validUntil = validDate.toISOString().split("T")[0];
  }

  errors.value = {};
  show.value = true;
  calculateTotals();
};

const closeForm = () => {
  show.value = false;
  form.value = {
    status: "Draft",
    discount: 0,
    items: [],
    validUntil: "",
    currency: "IDR",
    termOfPayment: 30,
    termOfDelivery: "FOB",
    paymentMethod: "Bank Transfer",
    requestType: "Sales",
    customerAddress: "",
    contactPerson: "",
    contactPhone: "",
  };
  errors.value = {};
};

const save = async () => {
  try {
    isSaving.value = true;
    errors.value = {};

    const payload = {
      ...form.value,
      subtotal: totals.subtotal,
      vatTotal: totals.vat,
      grandTotal: totals.grandTotal,
    };

    if (form.value.id) {
      await request(`/api/quotations/${form.value.id}`, {
        method: "PATCH",
        body: payload,
      });
    } else {
      await request("/api/quotations", {
        method: "POST",
        body: payload,
      });
    }

    ElMessage.success("Quotation saved successfully");
    closeForm();
    queryClient.invalidateQueries({ queryKey: ["quotations"] });
  } catch (error) {
    errors.value = parseError(error);
    ElMessage.error(error.message || "Failed to save quotation");
  } finally {
    isSaving.value = false;
  }
};

defineExpose({ openForm });

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
    name: "",
    model: "",
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

  // Apply quotation-level discount
  const quotationDiscount = form.value.discount || 0;
  subtotal -= quotationDiscount;

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

// UPLOAD RELATED
const config = useRuntimeConfig();
const fileList = ref([]);

watch(
  () => form.value.attachments,
  async (value, oldValue) => {
    if (!value) {
      return (fileList.value = []);
    }

    fileList.value = form.value.attachments.map((el) => {
      const { fileName: name, fileSize: size, filePath, fileType } = el;
      return {
        name,
        size,
        url: `${config.public.apiBase}/${filePath}`,
        filePath,
      };
    });
  },
);

function handleSuccess(file) {
  if (!form.value.attachments) {
    form.value.attachments = [];
  }

  form.value.attachments.push(file);
}

function handlePreview(file) {
  const path = file.response?.filePath ?? file.filePath;
  window.open(`${config.public.apiBase}/${path}`, "_blank");
}

function handleRemove(file) {
  const path = file.response?.filePath ?? file.filePath;
  const index = form.value.attachments.findIndex((f) => f.filePath == path);

  if (index !== -1) {
    form.value.attachments.splice(index, 1);
  }

  request(`/api/file`, {
    method: "DELETE",
    params: { path },
  }).then((res) => {
    ElMessage({
      message: res.message,
      type: "success",
      showClose: true,
    });
  });
}
</script>
