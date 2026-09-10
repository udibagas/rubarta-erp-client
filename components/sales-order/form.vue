<template>
  <el-dialog
    v-model="show"
    width="1100px"
    :title="!!form?.id ? 'EDIT SALES ORDER' : 'CREATE NEW SALES ORDER'"
    :close-on-click-modal="false"
    top="5vh"
  >
    <el-form label-width="160px" label-position="left">
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">QUOTATION INFORMATION</span>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Sales Order Date">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="Date of quotation"
                format="DD-MMM-YYYY"
                value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item
              label="Reference Number"
              :error="errors.referenceNumber"
            >
              <el-input
                placeholder="Reference number"
                v-model="form.referenceNumber"
              />
            </el-form-item>

            <el-form-item label="Title" :error="errors.title">
              <el-input placeholder="Sales order title" v-model="form.title" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Description" :error="errors.description">
              <el-input
                type="textarea"
                :rows="4"
                placeholder="Sales order description"
                v-model="form.description"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- Customer Information -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">CUSTOMER INFORMATION</span>
        </template>

        <div class="flex gap-4">
          <div class="flex-1">
            <el-form-item label="Customer" :error="errors.customerId">
              <el-select
                v-model="form.customerId"
                placeholder="Select customer"
                filterable
                default-first-option
                @change="(v) => handleChangeCustomer(v)"
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

            <el-form-item label="Contact Person" :error="errors.contactPerson">
              <el-select
                placeholder="Contact person name"
                v-model="form.contactPerson"
                filterable
                default-first-option
                allow-create
                clearable
                @change="(v) => handleContactChange(v)"
              >
                <el-option
                  v-for="contact in contacts.filter(
                    (c) => c.customerId === form.customerId,
                  )"
                  :key="contact.id"
                  :value="contact.name"
                  :label="contact.name"
                />
                <template #prefix>
                  <el-icon><ElIconUser /></el-icon>
                </template>
              </el-select>
            </el-form-item>

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

            <el-form-item label="Contact Email" :error="errors.contactEmail">
              <el-input
                placeholder="Contact email address"
                v-model="form.contactEmail"
              >
                <template #prefix>
                  <el-icon><ElIconMessage /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </div>
          <div class="flex-1">
            <el-form-item
              label="Customer Address"
              :error="errors.customerAddress"
            >
              <el-input
                type="textarea"
                :rows="8"
                placeholder="Customer address"
                v-model="form.customerAddress"
              />
            </el-form-item>
          </div>
        </div>
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
            :rows="2"
            placeholder="Terms and conditions"
            v-model="form.termsAndConditions"
          />
        </el-form-item>

        <el-form-item label="Notes" :error="errors.notes">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="Additional notes"
            v-model="form.notes"
          />
        </el-form-item>

        <!-- <el-form-item label="Attachments">
          <el-upload
            v-model:file-list="fileList"
            :action="`${config.public.apiBase}/api/file`"
            :with-credentials="true"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-success="handleSuccess"
            :multiple="true"
          >
            <el-button plain :icon="ElIconUpload"> Upload </el-button>
          </el-upload>
        </el-form-item> -->
      </el-card>

      <!-- Order Items -->
      <el-card shadow="never" body-style="padding: 0">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">ITEMS ({{ form.items.length }}) </span>
            <div class="flex items-center gap-2">
              <el-dropdown>
                <el-button :icon="ElIconUpload" link type="primary">
                  {{ isImporting ? "Importing..." : "Import Items" }}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :icon="Table" @click="triggerImportItems">
                      Import from Excel
                    </el-dropdown-item>
                    <el-dropdown-item
                      :icon="FileText"
                      @click="triggerImportItemsFromPo"
                    >
                      Import from PO
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

              <el-button
                v-if="form.items.length > 0"
                :icon="ElIconDelete"
                link
                type="danger"
                @click="
                  () => {
                    form.items = [];
                    currentPage = 1;
                  }
                "
              >
                Delete All Items
              </el-button>
              <input
                ref="importInputRef"
                type="file"
                accept=".xlsx,.xls"
                class="hidden"
                @change="handleImportItems"
              />
              <input
                ref="importFromPoInputRef"
                type="file"
                accept=".pdf"
                class="hidden"
                @change="handleImportItemsFromPo"
              />
            </div>
          </div>
        </template>

        <el-table :data="pagedItems" stripe v-loading="isImporting" border>
          <el-table-column
            label="#"
            width="60"
            :index="(i) => (currentPage - 1) * pageSize + i + 1"
            type="index"
          />

          <el-table-column label="Part Number" min-width="160">
            <template #default="{ row }">
              <el-select
                v-model="row.partNumber"
                placeholder="Select Part Number"
                @change="(v) => setMaterial(v, row)"
                filterable
                default-first-option
              >
                <el-option
                  v-for="material in materials"
                  :key="material.partNumber"
                  :value="material.partNumber"
                  :label="material.partNumber"
                >
                  <span style="float: left" class="font-mono mr-2">
                    {{ material.partNumber }}
                  </span>
                  <span
                    style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                    "
                  >
                    {{ material.name }}
                  </span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="Description" min-width="200">
            <template #default="{ row }">
              {{ row.name || row.description }}
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
              />
            </template>
          </el-table-column>

          <el-table-column label="Unit Price" width="160">
            <template #default="{ row }">
              <el-input
                v-model="row.unitPrice"
                class="font-mono w-full"
                @change="calculateTotals"
                :parser="(v) => Number(v.replace(/\./g, '').replace(',', '.'))"
                @keydown.tab="(e) => handleTab(e, row)"
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

          <el-table-column label="Amount" width="150" align="right">
            <template #default="{ row }">
              <span class="w-full font-mono">
                {{ toDecimal(row.quantity * row.unitPrice) }}
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
            <template #default="{ row }">
              <el-button
                tabindex="-1"
                type="danger"
                :icon="ElIconDelete"
                @click="removeItem(row)"
                link
              ></el-button>
            </template>
          </el-table-column>
        </el-table>

        <div
          v-if="form.items.length > pageSize"
          class="flex justify-end p-3 border-t border-[#ebeef5]"
        >
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="form.items.length"
            layout="prev, pager, next, total"
            background
            size="small"
          />
        </div>
      </el-card>

      <!-- Quotation Summary -->
      <el-card shadow="never" class="mt-4">
        <el-row :gutter="20">
          <el-col :span="12" :offset="12">
            <div class="space-y-2">
              <div class="flex justify-between text-base">
                <span>Subtotal:</span>
                <div
                  class="font-mono font-semibold w-[200px]! text-right border border-[#dcdfe6] rounded-sm px-2 py-1"
                >
                  {{ toDecimal(totals.subtotal) }}
                </div>
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
                <div
                  class="font-mono font-semibold w-[200px]! text-right border border-[#dcdfe6] rounded-sm px-2 py-1"
                >
                  {{ toDecimal(totals.vat) }}
                </div>
              </div>
              <div
                class="flex justify-between text-lg font-semibold text-green-600"
              >
                <span>Grand Total:</span>
                <div
                  class="font-mono w-[200px]! text-right border border-[#dcdfe6] rounded-sm px-2 py-1"
                >
                  {{ toDecimal(totals.grandTotal) }}
                </div>
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
        SAVE SALES ORDER
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useQueryClient } from "@tanstack/vue-query";
import { currencies } from "~/constants/currencies";
import { termOfPayments } from "~/constants/termOfPayments";
import { termOfDeliveries } from "~/constants/termOfDeliveries";
import { paymentMethods } from "~/constants/paymentMethods";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import ExcelJS from "exceljs";
import { FileText, Table } from "lucide-vue-next";

const emit = defineEmits(["saved"]);

const request = useRequest();
const queryClient = useQueryClient();

const defaultValue = {
  discount: 0,
  items: [],
  date: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
  currency: "IDR",
  termOfPayment: "30 Days",
  termOfDelivery: "FOB",
  paymentMethod: "Bank Transfer",
  requestType: "Sales",
  customerAddress: "",
  contactPerson: "",
  contactPhone: "",
  contactEmail: "",
  referenceNumber: "",
};

// Local state
const show = ref(false);

const form = ref({ ...defaultValue });
const errors = ref({});
const isSaving = ref(false);

const customers = ref([]);
const contacts = ref([]);
const materials = ref([]);

useGraphqlQuery(gql`
  query {
    customers {
      id
      name
      address
      Contacts {
        name
        phone
        email
      }
    }
    contacts {
      id
      name
      phone
      email
      customerId
    }
    materials {
      partNumber
      name
      model
      description
      sellingPrice
    }
  }
`)
  .then((result) => {
    customers.value = result.data.customers;
    contacts.value = result.data.contacts;
    materials.value = result.data.materials;
  })
  .catch((error) => {
    console.error("Failed to fetch GraphQL data:", error);
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
    date: data.date || dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
    discount: data.discount || 0,
    currency: data.currency || "IDR",
    termOfPayment: data.termOfPayment || "30 Days",
    termOfDelivery: data.termOfDelivery || "FOB",
    paymentMethod: data.paymentMethod || "Bank Transfer",
    customerAddress: data.customerAddress || "",
    contactPerson: data.contactPerson || "",
    contactPhone: data.contactPhone || "",
    contactEmail: data.contactEmail || "",
    items: data.items || [
      {
        partNumber: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ],
  };

  errors.value = {};
  show.value = true;
  currentPage.value = 1;
  calculateTotals();
};

const closeForm = () => {
  show.value = false;
  form.value = { ...defaultValue };
  errors.value = {};
  currentPage.value = 1;
};

const save = async () => {
  try {
    isSaving.value = true;
    errors.value = {};

    const url = form.value.id
      ? `/api/sales-orders/${form.value.id}`
      : "/api/sales-orders";

    await request(url, {
      method: form.value.id ? "PATCH" : "POST",
      body: form.value,
    });

    ElMessage.success("Quotation saved successfully");
    emit("saved");
    closeForm();
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  } catch (error) {
    errors.value = parseError(error);
    ElMessage.error(error.message || "Failed to save quotation");
  } finally {
    isSaving.value = false;
  }
};

const totals = reactive({
  subtotal: 0,
  vat: 0,
  grandTotal: 0,
});

const pageSize = 15;
const currentPage = ref(1);

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return form.value.items.slice(start, start + pageSize);
});

function lastPage() {
  return Math.max(1, Math.ceil(form.value.items.length / pageSize));
}

function addItem() {
  if (!form.value.items) {
    form.value.items = [];
  }
  form.value.items.push({
    partNumber: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
  });
  currentPage.value = lastPage();
  calculateTotals();
}

function removeItem(row) {
  const index = form.value.items.indexOf(row);
  if (index === -1) return;
  form.value.items.splice(index, 1);
  if (currentPage.value > lastPage()) {
    currentPage.value = lastPage();
  }
  calculateTotals();
}

function calculateTotals() {
  if (!form.value.items || form.value.items.length === 0) {
    totals.subtotal = 0;
    totals.vat = 0;
    totals.grandTotal = 0;
    return;
  }

  totals.subtotal = form.value.items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0,
  );

  totals.vat = totals.subtotal * 0.11;
  totals.grandTotal = totals.subtotal + totals.vat - (form.value.discount || 0);
}

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

function handleTab(e, row) {
  const index = form.value.items.indexOf(row);
  if (index == form.value.items.length - 1) {
    addItem();
  }
}

// IMPORT ITEMS FROM EXCEL
const importInputRef = ref(null);
const importFromPoInputRef = ref(null);
const isImporting = ref(false);

function triggerImportItems() {
  importInputRef.value?.click();
}

function triggerImportItemsFromPo() {
  importFromPoInputRef.value?.click();
}

async function handleImportItems(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    isImporting.value = true;

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];

    const notFound = [];
    const imported = [];

    worksheet.eachRow((row, rowNumber) => {
      // Skip header row
      if (rowNumber === 1) return;

      const partNumber = row.getCell(1).value?.toString().trim();
      const quantity = Number(row.getCell(2).value) || 0;

      if (!partNumber) return;

      const material = materials.value.find((m) => m.partNumber === partNumber);

      if (!material) {
        notFound.push(partNumber);
        return;
      }

      imported.push({
        partNumber: material.partNumber,
        description: material.description,
        quantity: quantity || 1,
        unitPrice: material.sellingPrice,
      });
    });

    if (imported.length) {
      // Remove empty placeholder row before adding imported items
      form.value.items = form.value.items
        .filter((item) => item.partNumber)
        .concat(imported);
      currentPage.value = 1;
      calculateTotals();
    }

    if (notFound.length) {
      ElMessage.warning(
        `Part number(s) not found and skipped: ${notFound.join(", ")}`,
      );
    }

    if (imported.length) {
      ElMessage.success(`${imported.length} item(s) imported successfully`);
    }
  } catch (error) {
    ElMessage.error(error.message || "Failed to import items");
  } finally {
    isImporting.value = false;
    e.target.value = "";
  }
}

async function handleImportItemsFromPo(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    isImporting.value = true;

    const formData = new FormData();
    formData.append("file", file);

    const result = await $fetch("/api/sales-orders/parse-po", {
      method: "POST",
      body: formData,
      baseURL: config.public.apiBase,
      credentials: "include",
    });

    const items = result.items.map((i) => ({
      partNumber: i.vendorPartNo,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.netUnitPrice,
    }));

    form.value.items = items;
    currentPage.value = 1;

    calculateTotals();
  } catch (error) {
    ElMessage.error(error.message || "Failed to import items from PO");
  } finally {
    isImporting.value = false;
    e.target.value = "";
  }
}

function handleChangeCustomer(customerId) {
  const customer = customers.value.find((c) => c.id === customerId);
  form.value.customerAddress = customer?.address || "";
}

function handleContactChange(contactName) {
  const contact = contacts.value.find(
    (c) => c.name === contactName && c.customerId === form.value.customerId,
  );
  form.value.contactPhone = contact?.phone || "";
  form.value.contactEmail = contact?.email || "";
}

defineExpose({ openForm });
</script>
