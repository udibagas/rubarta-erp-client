<template>
  <el-dialog
    v-model="show"
    width="1100px"
    :title="!!form?.id ? 'EDIT INVOICE' : 'CREATE NEW INVOICE'"
    :close-on-click-modal="false"
    top="5vh"
  >
    <el-form label-width="160px" label-position="left">
      <!-- Invoice Header -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">INVOICE INFORMATION</span>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Delivery Order">
              <el-select
                v-model="form.deliveryOrderId"
                placeholder="Select delivery order"
                filterable
                default-first-option
                @change="(v) => loadFormFromDeliveryOrder(v)"
                clearable
              >
                <el-option
                  v-for="deliveryOrder in deliveryOrders"
                  :key="deliveryOrder.id"
                  :value="deliveryOrder.id"
                  :label="deliveryOrder.number"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Invoice Number" :error="errors.number">
              <el-input
                placeholder="e.g., INV-2026-001"
                v-model="form.number"
              />
            </el-form-item>

            <el-form-item
              label="Reference Number"
              :error="errors.referenceNumber"
            >
              <el-input
                placeholder="Reference number / PO Number"
                v-model="form.referenceNumber"
              />
            </el-form-item>

            <el-form-item label="Status" :error="errors.status">
              <el-select v-model="form.status" placeholder="Invoice status">
                <el-option
                  v-for="status in invoiceStatuses"
                  :key="status"
                  :value="status"
                  :label="status"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Invoice Date" :error="errors.date">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="Date of invoice"
                format="DD-MMM-YYYY"
                value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="Due Date" :error="errors.dueDate">
              <el-date-picker
                v-model="form.dueDate"
                type="date"
                placeholder="Payment due date"
                format="DD-MMM-YYYY"
                value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
                style="width: 100%"
              />
            </el-form-item>

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
        </el-row>
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
          </el-col>
        </el-row>
      </el-card>

      <!-- Payment Terms -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">PAYMENT TERMS</span>
        </template>

        <el-row :gutter="20">
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
        </el-row>

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
            <el-button plain :icon="ElIconUpload"> Upload </el-button>
          </el-upload>
        </el-form-item>
      </el-card>

      <!-- Invoice Items -->
      <el-card shadow="never" body-style="padding: 0">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">
              INVOICE ITEMS ({{ form.items.length }})
            </span>
            <el-button
              v-if="form.items.length > 0"
              :icon="ElIconDelete"
              link
              type="danger"
              @click="
                () => {
                  form.items = [];
                  currentPage = 1;
                  calculateTotals();
                }
              "
            >
              Delete All Items
            </el-button>
          </div>
        </template>

        <el-table :data="pagedItems" stripe border>
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
              <el-input v-model="row.description" placeholder="Description" />
            </template>
          </el-table-column>

          <el-table-column label="Quantity" width="120" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="row.quantity"
                :min="1"
                style="width: 100%"
                controls-position="right"
                @change="calculateTotals"
              />
            </template>
          </el-table-column>

          <el-table-column label="Unit Price" width="150">
            <template #default="{ row }">
              <el-input-number
                v-model="row.unitPrice"
                :min="0"
                :precision="2"
                style="width: 100%"
                controls-position="right"
                @change="calculateTotals"
              />
            </template>
          </el-table-column>

          <el-table-column label="Amount" width="150" align="right">
            <template #default="{ row }">
              <span class="font-mono">
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
              />
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

      <!-- Invoice Summary -->
      <el-card shadow="never" class="mt-4">
        <el-row :gutter="20">
          <el-col :span="12" :offset="12">
            <div class="space-y-2">
              <div class="flex justify-between text-base">
                <span>Total Amount:</span>
                <div
                  class="font-mono font-semibold w-[200px]! text-right border border-[#dcdfe6] rounded-sm px-2 py-1"
                >
                  {{ toDecimal(totals.totalAmount) }}
                </div>
              </div>
              <div class="flex justify-between text-base">
                <span>Discount:</span>
                <el-input-number
                  v-model="form.discount"
                  :min="0"
                  :precision="2"
                  controls-position="right"
                  @change="calculateTotals"
                  class="font-mono font-bold w-[200px]!"
                />
              </div>
              <div class="flex justify-between text-base">
                <span class="flex-1">VAT (11%):</span>
                <div
                  class="font-mono font-semibold w-[200px]! text-right border border-[#dcdfe6] rounded-sm px-2 py-1"
                >
                  {{ toDecimal(totals.vatAmount) }}
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
        SAVE INVOICE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { invoiceStatuses, paymentMethods, termOfPayments } from "~/constants";
import dayjs from "dayjs";
import { gql } from "@apollo/client";

const emit = defineEmits(["saved"]);
const route = useRoute();
const request = useRequest();
const config = useRuntimeConfig();

const defaultValue = {
  status: "Draft",
  discount: 0,
  items: [],
  date: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
  dueDate: dayjs().add(30, "day").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
  termOfPayment: "30 Days",
  paymentMethod: "Bank Transfer",
  contactPerson: "",
  contactPhone: "",
  contactEmail: "",
};

// Local state
const show = ref(false);

const form = ref({ ...defaultValue });
const errors = ref({});
const isSaving = ref(false);

const customers = ref([]);
const contacts = ref([]);
const users = ref([]);
const materials = ref([]);
const deliveryOrders = ref([]);

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
    users {
      id
      name
    }
    materials {
      partNumber
      name
      model
      description
      sellingPrice
    }
    deliveryOrders {
      id
      number
      customerId
      salesOrderId
      DeliveryOrderItems {
        partNumber
        partNumberSupply
        description
        quantitySupply
      }
    }
  }
`)
  .then((result) => {
    customers.value = result.data.customers;
    contacts.value = result.data.contacts;
    users.value = result.data.users;
    materials.value = result.data.materials;
    deliveryOrders.value = result.data.deliveryOrders;
  })
  .catch((error) => {
    console.error("Failed to fetch GraphQL data:", error);
  });

function setMaterial(partNumber, item) {
  const material = materials.value.find((m) => m.partNumber === partNumber);
  if (material) {
    item.description = material.description || material.name;
    item.unitPrice = material.sellingPrice;
    calculateTotals();
  }
}

function loadFormFromDeliveryOrder(deliveryOrderId) {
  const deliveryOrder = deliveryOrders.value.find(
    (d) => d.id === deliveryOrderId,
  );

  if (deliveryOrder) {
    form.value.customerId = deliveryOrder.customerId;
    form.value.salesOrderId = deliveryOrder.salesOrderId;
    form.value.items = deliveryOrder.DeliveryOrderItems.map((i) => {
      const material = materials.value.find(
        (m) => m.partNumber === i.partNumberSupply,
      );

      return {
        partNumber: i.partNumberSupply || i.partNumber,
        description: i.description,
        quantity: i.quantitySupply,
        unitPrice: material?.sellingPrice || 0,
      };
    });

    handleChangeCustomer(deliveryOrder.customerId);
    currentPage.value = 1;
    calculateTotals();
  }
}

// Expose method to open form from parent
const openForm = (data = {}) => {
  form.value = {
    ...data,
    date: data.date || dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
    dueDate:
      data.dueDate || dayjs().add(30, "day").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
    status: data.status || "Draft",
    discount: data.discount || 0,
    termOfPayment: data.termOfPayment || "30 Days",
    paymentMethod: data.paymentMethod || "Bank Transfer",
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
      ? `/api/invoices/${form.value.id}`
      : "/api/invoices";

    const res = await request(url, {
      method: form.value.id ? "PATCH" : "POST",
      body: { ...form.value, companyId: useCookie("companyId").value },
    });

    ElMessage.success("Invoice saved successfully");
    emit("saved");
    closeForm();

    if (route.path === "/sales/invoices") {
      navigateTo(`/sales/invoices/${res.id}`);
    }
  } catch (error) {
    errors.value = parseError(error);
    ElMessage.error(error.message || "Failed to save invoice");
  } finally {
    isSaving.value = false;
  }
};

const totals = reactive({
  totalAmount: 0,
  vatAmount: 0,
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
    totals.totalAmount = 0;
    totals.vatAmount = 0;
    totals.grandTotal = 0;
    return;
  }

  totals.totalAmount = form.value.items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0,
  );

  totals.vatAmount = totals.totalAmount * 0.11;
  totals.grandTotal =
    totals.totalAmount + totals.vatAmount - (form.value.discount || 0);
}

// UPLOAD RELATED
const fileList = ref([]);

watch(
  () => form.value.attachments,
  (value) => {
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

function handleChangeCustomer(customerId) {
  const customer = customers.value.find((c) => c.id === customerId);
  if (!customer) return;

  const contact = customer.Contacts?.[0];
  if (contact) {
    form.value.contactPerson = contact.name || "";
    form.value.contactPhone = contact.phone || "";
    form.value.contactEmail = contact.email || "";
  }
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
