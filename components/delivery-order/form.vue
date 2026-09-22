<template>
  <el-dialog
    v-model="show"
    width="1000px"
    :title="!!form?.id ? 'EDIT DELIVERY ORDER' : 'CREATE NEW DELIVERY ORDER'"
    :close-on-click-modal="false"
    top="5vh"
  >
    <el-form label-width="160px" label-position="left">
      <!-- Delivery Order Header -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">DELIVERY ORDER INFORMATION</span>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Customer" :error="errors.customerId">
              <el-select
                v-model="form.customerId"
                placeholder="Select customer"
                filterable
                default-first-option
                @change="(v) => fetchSoByCustomerId(v)"
                clearable
              >
                <el-option
                  v-for="customer in customers"
                  :key="customer.id"
                  :value="customer.id"
                  :label="customer.name"
                />
              </el-select>
            </el-form-item>

            <el-form-item
              label="Sales Order Number"
              :error="errors.salesOrderId"
            >
              <el-select
                v-model="form.salesOrderId"
                placeholder="Select sales order"
                filterable
                default-first-option
                @change="(v) => loadFormFromSalesOrder(v)"
                clearable
              >
                <el-option
                  v-for="salesOrder in salesOrders"
                  :key="salesOrder.id"
                  :value="salesOrder.id"
                  :label="salesOrder.number"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="GR Number" :error="errors.goodsReceiptId">
              <el-select
                v-model="form.goodsReceiptId"
                placeholder="Select goods receipt"
                filterable
                default-first-option
                @change="(v) => loadItemFromGoodsReceipt(v)"
                clearable
              >
                <el-option
                  v-for="goodsReceipt in goodsReceipts"
                  :key="goodsReceipt.id"
                  :value="goodsReceipt.id"
                  :label="goodsReceipt.number"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Delivery Date" :error="errors.date">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="Date of delivery order"
                format="DD-MMM-YYYY"
                value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="Supporting Document">
              <div class="w-full">
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
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Sender" :error="errors.sender">
              <el-select
                v-model="form.sender"
                placeholder="Select sender"
                filterable
                clearable
                default-first-option
                allow-create
              >
                <el-option
                  v-for="u in users"
                  :label="u.name"
                  :key="u.id"
                  :value="u.name"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Receipt Number" :error="errors.receiptNumber">
              <el-input
                placeholder="Receipt number"
                v-model="form.receiptNumber"
              />
            </el-form-item>

            <el-form-item label="Pick Up By" :error="errors.pickUpBy">
              <el-input placeholder="Pick up by" v-model="form.pickUpBy" />
            </el-form-item>

            <el-form-item label="Pick Up Name" :error="errors.pickUpName">
              <el-input placeholder="Pick up name" v-model="form.pickUpName" />
            </el-form-item>

            <el-form-item label="Pick Up Contact" :error="errors.pickUpContact">
              <el-input
                placeholder="Pick up contact"
                v-model="form.pickUpContact"
              />
            </el-form-item>

            <el-form-item label="Notes" :error="errors.notes">
              <el-input
                type="textarea"
                :rows="3"
                placeholder="Additional notes"
                v-model="form.notes"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
    </el-form>

    <!-- Delivery Order Items -->
    <el-card shadow="never" body-style="padding: 0">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">
            DELIVERY ORDER ITEMS ({{ form.items.length }})
          </span>

          <div class="flex gap-2">
            <el-tag effect="plain" size="large" class="font-semibold">
              Total Ordered: {{ toDecimal(totalOrdered) }}
            </el-tag>
            <el-tag
              type="success"
              effect="plain"
              size="large"
              class="font-semibold"
            >
              Total Delivered: {{ toDecimal(totalDelivered) }}
            </el-tag>
            <el-tag
              :type="totalOutstanding > 0 ? 'danger' : 'success'"
              effect="plain"
              size="large"
              class="font-semibold"
            >
              Outstanding: {{ toDecimal(totalOutstanding) }}
            </el-tag>
          </div>
        </div>
      </template>

      <el-table
        :data="pagedItems"
        border
        :row-class-name="
          ({ row }) =>
            row.quantityOrder === row.quantitySupply
              ? 'bg-green-100!'
              : 'bg-red-100!'
        "
      >
        <template #empty>
          <el-empty description="No items available" />
        </template>
        <el-table-column
          label="#"
          width="50"
          :index="(i) => (currentPage - 1) * pageSize + i + 1"
          type="index"
          header-align="center"
          align="center"
        />

        <el-table-column label="Part Number" header-align="center">
          <el-table-column label="Ordered" width="140" header-align="center">
            <template #default="{ row }">
              <div class="font-mono font-semibold">
                {{ row.partNumber }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Supply" width="140" header-align="center">
            <template #default="{ row }">
              <el-input
                v-model="row.partNumberSupply"
                placeholder="P/N supplied"
              />
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="Description" header-align="center">
          <template #default="{ row }">
            <div class="text-clamp-1">{{ row.description }}</div>
          </template>
        </el-table-column>

        <el-table-column label="Quantity" header-align="center">
          <el-table-column label="Ordered" width="130" align="center">
            <template #default="{ row }">
              <div class="font-mono">
                {{ row.quantityOrder }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Supplied" width="130" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="row.quantitySupply"
                :min="0"
                :max="row.quantityOrder"
                style="width: 100%"
                controls-position="right"
              />
            </template>
          </el-table-column>

          <el-table-column label="Outstanding" width="130" align="center">
            <template #default="{ row }">
              <div class="font-mono">
                {{ row.quantityOrder - row.quantitySupply }}
              </div>
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column width="50" align="center">
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
        SAVE DELIVERY ORDER
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import dayjs from "dayjs";
import { gql } from "@apollo/client";

const emit = defineEmits(["saved"]);
const { companyId } = storeToRefs(useSharedStore());
const request = useRequest();
const config = useRuntimeConfig();

const defaultValue = {
  date: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
  sender: "",
  goodsReceiptId: null,
  salesOrderId: null,
  customerId: null,
  pickUpBy: "",
  pickUpName: "",
  pickUpContact: "",
  notes: "",
  supportingDocument: [],
  items: [],
};

// Local state
const show = ref(false);
const form = ref({ ...defaultValue });
const errors = ref({});
const isSaving = ref(false);

const customers = ref([]);
const users = ref([]);
const salesOrders = ref([]);
const goodsReceipts = ref([]);

async function fetchCustomersAndUsers() {
  try {
    const { data } = await useGraphqlQuery(gql`
      query {
        customers {
          id
          name
        }
        users {
          id
          name
        }
      }
    `);
    customers.value = data.customers;
    users.value = data.users;
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
        customerId
        Customer {
          id
          name
        }
        SalesOrderItems {
          partNumber
          description
          quantity
          deliveredQuantity
        }
      }
    }
  `;

  try {
    const { data } = await useGraphqlQuery(GET_SO_BY_CUSTOMER_ID, {
      variables: {
        customerId,
        status: ["Confirmed", "Sent", "PartiallyDelivered", "Completed"],
      },
    });

    salesOrders.value = data.salesOrders;
  } catch (e) {
    console.error("Failed to fetch sales orders by customer ID:", e);
  }
}

async function getGrBySoId(salesOrderId) {
  if (!salesOrderId) {
    goodsReceipts.value = [];
    return;
  }

  const GET_GR = gql`
    query GoodsReceipts($salesOrderId: Int, $status: GoodsReceiptStatus!) {
      goodsReceipts(salesOrderId: $salesOrderId, status: $status) {
        id
        number
        date
        purchaseOrderId
        PurchaseOrder {
          id
          number
        }
        GoodsReceiptItems {
          partNumber
          partNumberSupplier
          description
          quantityOrder
          quantityReceived
        }
      }
    }
  `;

  try {
    const { data } = await useGraphqlQuery(GET_GR, {
      variables: {
        salesOrderId,
        status: "Confirmed",
      },
    });
    goodsReceipts.value = data.goodsReceipts;
  } catch (e) {
    console.error("Failed to get goods receipts by sales order ID:", e);
  }
}

// Expose method to open form from parent
const openForm = (data = {}) => {
  fetchCustomersAndUsers();

  form.value = {
    ...data,
    date: data.date || dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
    sender: data.sender || "",
    goodsReceiptId: data.goodsReceiptId || null,
    salesOrderId: data.salesOrderId || null,
    customerId: data.customerId || null,
    pickUpBy: data.pickUpBy || "",
    pickUpName: data.pickUpName || "",
    pickUpContact: data.pickUpContact || "",
    notes: data.notes || "",
    supportingDocument: data.supportingDocument || [],
    items: data.items || [],
  };

  errors.value = {};
  show.value = true;
  currentPage.value = 1;
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
      ? `/api/delivery-orders/${form.value.id}`
      : "/api/delivery-orders";

    const res = await request(url, {
      method: form.value.id ? "PATCH" : "POST",
      body: { ...form.value, companyId: companyId.value },
    });

    ElMessage.success("Delivery order saved successfully");
    emit("saved", res);
    closeForm();
  } catch (error) {
    errors.value = parseError(error);
  } finally {
    isSaving.value = false;
  }
};

const pageSize = 15;
const currentPage = ref(1);

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return form.value.items.slice(start, start + pageSize);
});

function lastPage() {
  return Math.max(1, Math.ceil(form.value.items.length / pageSize));
}

function removeItem(row) {
  const index = form.value.items.indexOf(row);
  if (index === -1) return;
  form.value.items.splice(index, 1);
  if (currentPage.value > lastPage()) {
    currentPage.value = lastPage();
  }
}

function loadFormFromSalesOrder(salesOrderId) {
  getGrBySoId(salesOrderId);
  const salesOrder = salesOrders.value.find((s) => s.id === salesOrderId);
  if (salesOrder) {
    form.value.items = salesOrder.SalesOrderItems.map((i) => ({
      partNumber: i.partNumber,
      partNumberSupply: "",
      description: i.description,
      quantityOrder: i.quantity,
      quantitySupply: 0,
    }));

    currentPage.value = 1;
  }
}

function loadItemFromGoodsReceipt(goodsReceiptId) {
  const goodsReceipt = goodsReceipts.value.find((g) => g.id === goodsReceiptId);
  if (!goodsReceipt) return;

  const grItems = goodsReceipt.GoodsReceiptItems;

  form.value.items = [...form.value.items]
    .filter((item) =>
      grItems.some((grItem) => grItem.partNumber === item.partNumber),
    )
    .map((item) => {
      const grItem = grItems.find((gr) => gr.partNumber === item.partNumber);
      return {
        ...item,
        partNumberSupply: grItem?.partNumberSupplier ?? item.partNumberSupply,
        quantityOrder: grItem?.quantityOrder ?? item.quantityOrder,
        quantitySupply: grItem?.quantityReceived ?? 0,
      };
    });

  currentPage.value = 1;
}

// UPLOAD RELATED
const fileList = ref([]);

watch(
  () => form.value.supportingDocument,
  (value) => {
    if (!value) {
      return (fileList.value = []);
    }

    fileList.value = form.value.supportingDocument.map((el) => {
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
  if (!form.value.supportingDocument) {
    form.value.supportingDocument = [];
  }

  form.value.supportingDocument.push(file);
}

function handlePreview(file) {
  const path = file.response?.filePath ?? file.filePath;
  window.open(`${config.public.apiBase}/${path}`, "_blank");
}

function handleRemove(file) {
  const path = file.response?.filePath ?? file.filePath;
  const index = form.value.supportingDocument.findIndex(
    (f) => f.filePath == path,
  );

  if (index !== -1) {
    form.value.supportingDocument.splice(index, 1);
  }

  request(`/api/file`, {
    method: "DELETE",
    params: { path },
  })
    .then((res) => {
      ElMessage({
        message: res.message,
        type: "success",
        showClose: true,
      });
    })
    .catch((error) => {
      ElMessage({
        message: error.message,
        type: "error",
        showClose: true,
      });
    });
}

const totalOrdered = computed(() =>
  form.value.items.reduce(
    (sum, item) => sum + Number(item.quantityOrder || 0),
    0,
  ),
);

const totalDelivered = computed(() =>
  form.value.items.reduce(
    (sum, item) => sum + Number(item.quantitySupply || 0),
    0,
  ),
);

const totalOutstanding = computed(
  () => totalOrdered.value - totalDelivered.value,
);

defineExpose({ openForm });
</script>
