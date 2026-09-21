<template>
  <el-dialog
    v-model="show"
    width="1000px"
    :title="!!form?.id ? 'EDIT INVOICE' : 'CREATE NEW INVOICE'"
    :close-on-click-modal="false"
    top="5vh"
  >
    <el-form label-width="160px" label-position="left">
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

          <el-col :span="12">
            <el-form-item
              label="Billing Address"
              :error="errors.billingAddress"
            >
              <el-input
                placeholder="Billing address"
                v-model="form.billingAddress"
                type="textarea"
                :rows="3"
              />
            </el-form-item>

            <el-form-item
              label="Shipping Address"
              :error="errors.shippingAddress"
            >
              <el-input
                placeholder="Shipping address"
                v-model="form.shippingAddress"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- Invoice Header -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">INVOICE INFORMATION</span>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Sales Order">
              <el-select
                v-model="form.salesOrderId"
                placeholder="Select sales order"
                filterable
                default-first-option
                clearable
                @change="
                  (v) => {
                    loadFormFromSalesOrder(v);
                    getDeliveryOrdersBySoId(v);
                  }
                "
              >
                <el-option
                  v-for="so in salesOrders"
                  :key="so.id"
                  :value="so.id"
                  :label="so.number"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Delivery Order">
              <el-select
                v-model="form.deliveryOrderId"
                placeholder="Select delivery order"
                filterable
                default-first-option
                @change="(v) => loadItemsFromDeliveryOrder(v)"
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

            <el-form-item
              label="Reference Number"
              :error="errors.referenceNumber"
            >
              <el-input
                placeholder="Reference number / PO Number"
                v-model="form.referenceNumber"
              />
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

            <el-form-item label="Currency" :error="errors.currency">
              <el-radio-group v-model="form.currency">
                <el-radio
                  v-for="currency in currencies"
                  :key="currency"
                  :value="currency"
                >
                  {{ currency }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="With Tax Invoice"
              :error="errors.withTaxInvoice"
            >
              <el-switch
                v-model="form.withTaxInvoice"
                inline-prompt
                style="
                  --el-switch-on-color: #13ce66;
                  --el-switch-off-color: #ff4949;
                "
                active-text="Yes"
                inactive-text="No"
                width="50"
              />
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
                class="w-full"
              >
                <el-button plain :icon="ElIconUpload"> Upload </el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- Invoice Items -->
      <el-card shadow="never" body-style="padding: 0">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">
              INVOICE ITEMS ({{ form.items.length }})
            </span>
          </div>
        </template>

        <el-table :data="pagedItems" stripe border>
          <template #empty>
            <el-empty description="No Items"> </el-empty>
          </template>
          <el-table-column
            label="#"
            width="50"
            :index="(i) => (currentPage - 1) * pageSize + i + 1"
            type="index"
            align="center"
          />

          <el-table-column label="Part Number" min-width="160">
            <template #default="{ row }">
              <span class="font-mono font-semibold">
                {{ row.partNumber }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="Description" min-width="200">
            <template #default="{ row }">
              {{ row.description }}
            </template>
          </el-table-column>

          <el-table-column label="Quantity" width="120" align="center">
            <template #default="{ row }">
              <span class="font-mono">
                {{ toDecimal(row.quantity) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="Unit Price" width="150" align="right">
            <template #default="{ row }">
              <span class="font-mono">
                {{ toDecimal(row.unitPrice) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="Amount" width="150" align="right">
            <template #default="{ row }">
              <span class="font-mono">
                {{ toDecimal(row.quantity * row.unitPrice) }}
              </span>
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
                <el-input
                  v-model.number="form.discount"
                  type="number"
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
import { paymentMethods, termOfPayments, currencies } from "~/constants";
import dayjs from "dayjs";
import { gql } from "@apollo/client";

const emit = defineEmits(["saved"]);
const { companyId } = storeToRefs(useSharedStore());
const request = useRequest();
const config = useRuntimeConfig();

const defaultValue = {
  discount: 0,
  items: [],
  date: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
  dueDate: dayjs().add(30, "day").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
  termOfPayment: "30 Days",
  paymentMethod: "Bank Transfer",
  contactPerson: "",
  contactPhone: "",
  contactEmail: "",
  billingAddress: "",
  shippingAddress: "",
  customerId: null,
  salesOrderId: null,
  deliveryOrderId: null,
};

const show = ref(false);
const form = ref({ ...defaultValue });
const errors = ref({});
const isSaving = ref(false);

const customers = ref([]);
const contacts = ref([]);
const salesOrders = ref([]);
const deliveryOrders = ref([]);

async function fetchCustomersAndContacts() {
  try {
    const { data } = await useGraphqlQuery(gql`
      query {
        customers {
          id
          name
          phone
          email
          address
          Contacts {
            name
            phone
            email
          }
        }
      }
    `);
    customers.value = data.customers;
  } catch (e) {
    console.error("Failed to fetch customers:", e);
  }
}

async function fetchSoByCustomerId(customerId) {
  if (!customerId) {
    salesOrders.value = [];
    return;
  }

  const GET_SO_BY_CUSTOMER_ID = gql`
    query SalesOrders($customerId: Int, $status: [SalesOrderStatus!]) {
      salesOrders(customerId: $customerId, status: $status) {
        id
        number
        referenceNumber
        currency
        SalesOrderItems {
          partNumber
          description
          unitPrice
        }
      }
    }
  `;

  try {
    const { data } = await useGraphqlQuery(GET_SO_BY_CUSTOMER_ID, {
      variables: {
        customerId,
        status: ["PartiallyDelivered", "Completed"],
      },
    });

    salesOrders.value = data.salesOrders;
  } catch (e) {
    console.error("Failed to fetch sales orders by customer ID:", e);
  }
}

async function getDeliveryOrdersBySoId(salesOrderId) {
  if (!salesOrderId) {
    deliveryOrders.value = [];
    return;
  }

  const GET_DO_BY_SO_ID = gql`
    query DeliveryOrders($salesOrderId: Int, $status: String!) {
      deliveryOrders(salesOrderId: $salesOrderId, status: $status) {
        id
        number
        DeliveryOrderItems {
          partNumber
          quantitySupply
        }
      }
    }
  `;

  try {
    const { data } = await useGraphqlQuery(GET_DO_BY_SO_ID, {
      variables: {
        salesOrderId,
        status: "Confirmed",
      },
    });
    deliveryOrders.value = data.deliveryOrders;
  } catch (e) {
    console.error("Failed to get delivery orders by sales order ID:", e);
  }
}

function handleChangeCustomer(customerId) {
  fetchSoByCustomerId(customerId);
  const customer = customers.value.find((c) => c.id === customerId);
  if (!customer) return;

  form.value.billingAddress = customer.address || "";
  form.value.shippingAddress = customer.address || "";

  contacts.value = customer.Contacts || [];
  const contact = customer.Contacts?.[0];

  if (contact) {
    form.value.contactPerson = contact.name || "";
    form.value.contactPhone = contact.phone || "";
    form.value.contactEmail = contact.email || "";
  } else {
    form.value.contactPerson = "";
    form.value.contactPhone = customer.phone || "";
    form.value.contactEmail = customer.email || "";
  }
}

function handleContactChange(contactName) {
  const contact = contacts.value.find((c) => c.name === contactName);
  form.value.contactPhone = contact?.phone || "";
  form.value.contactEmail = contact?.email || "";
}

function loadFormFromSalesOrder(salesOrderId) {
  const salesOrder = salesOrders.value.find((so) => so.id === salesOrderId);

  if (salesOrder) {
    form.value.referenceNumber = salesOrder.referenceNumber;
    form.value.currency = salesOrder.currency;
    form.value.items = salesOrder.SalesOrderItems.map((i) => {
      return {
        partNumber: i.partNumber,
        description: i.description,
        quantity: 0,
        unitPrice: i.unitPrice,
      };
    });

    currentPage.value = 1;
    calculateTotals();
  }
}

function loadItemsFromDeliveryOrder(deliveryOrderId) {
  const deliveryOrder = deliveryOrders.value.find(
    (d) => d.id === deliveryOrderId,
  );

  if (deliveryOrder) {
    form.value.items = form.value.items
      .map((item) => {
        const deliveryItem = deliveryOrder.DeliveryOrderItems.find(
          (i) => i.partNumber === item.partNumber,
        );

        return {
          ...item,
          quantity: deliveryItem ? deliveryItem.quantitySupply : 0, // Use the supplied quantity from the delivery order
        };
      })
      .filter((item) => item.quantity > 0); // Remove items with zero quantity

    currentPage.value = 1;
    calculateTotals();
  }
}

// Expose method to open form from parent
const openForm = (data = {}) => {
  fetchCustomersAndContacts();

  if (form.value.customerId) {
    fetchSoByCustomerId(form.value.customerId);
  }

  if (form.value.salesOrderId) {
    getDeliveryOrdersBySoId(form.value.salesOrderId);
  }

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
    items: data.items || [],
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
      body: { ...form.value, companyId: companyId.value },
    });

    ElMessage.success("Invoice saved successfully");
    emit("saved");
    closeForm();

    if (useRoute().path === "/sales/invoices") {
      navigateTo(`/sales/invoices/${res.id}`);
    }
  } catch (error) {
    errors.value = parseError(error);
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

defineExpose({ openForm });
</script>
