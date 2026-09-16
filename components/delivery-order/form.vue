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
            <el-form-item label="Sales Order Number">
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

            <el-form-item label="GR Number">
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

            <el-form-item label="Delivery Order Date">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="Date of delivery order"
                format="DD-MMM-YYYY"
                value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="Customer" :error="errors.customerId">
              <el-input
                placeholder="Customer name"
                :model-value="form.Customer?.name"
                readonly
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Sender" :error="errors.sender">
              <el-input placeholder="Sender name" v-model="form.sender" />
            </el-form-item>

            <el-form-item label="Recipient" :error="errors.recipient">
              <el-input placeholder="Recipient name" v-model="form.recipient" />
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

        <el-form-item label="Supporting Document">
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
    </el-form>

    <!-- Delivery Order Items -->
    <el-card shadow="never" body-style="padding: 0">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">
            DELIVERY ORDER ITEMS ({{ form.items.length }})
          </span>

          <div class="flex gap-2">
            <el-tag effect="plain" size="large">
              Total Ordered: {{ toDecimal(totalOrdered) }}
            </el-tag>
            <el-tag type="success" effect="plain" size="large">
              Total Received: {{ toDecimal(totalDelivered) }}
            </el-tag>
            <el-tag
              :type="totalOutstanding > 0 ? 'error' : 'success'"
              effect="plain"
              size="large"
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
          <el-table-column label="Ordered" width="110" align="center">
            <template #default="{ row }">
              <div class="font-mono">
                {{ row.quantityOrder }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Supplied" width="110" align="center">
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
const request = useRequest();
const config = useRuntimeConfig();

const defaultValue = {
  items: [],
  date: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
  sender: "",
  recipient: "",
  notes: "",
  supportingDocument: [],
};

// Local state
const show = ref(false);

const form = ref({ ...defaultValue });
const errors = ref({});
const isSaving = ref(false);

const customers = ref([]);
const goodsReceipts = ref([]);
const salesOrders = ref([]);

useGraphqlQuery(gql`
  query {
    customers {
      id
      name
      address
    }
    salesOrders {
      id
      number
      customerId
      SalesOrderItems {
        partNumber
        description
        quantity
        deliveredQuantity
      }
    }
    goodsReceipts {
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
`)
  .then((result) => {
    customers.value = result.data.customers;
    goodsReceipts.value = result.data.goodsReceipts;
    salesOrders.value = result.data.salesOrders;
  })
  .catch((error) => {
    console.error("Failed to fetch GraphQL data:", error);
  });

// Expose method to open form from parent
const openForm = (data = {}) => {
  form.value = {
    ...data,
    date: data.date || dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
    sender: data.sender || "",
    recipient: data.recipient || "",
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
      body: { ...form.value, companyId: useCookie("companyId").value },
    });

    ElMessage.success("Delivery order saved successfully");
    emit("saved");
    closeForm();

    if (useRoute().path === "/purchasing-logistics/delivery-orders") {
      navigateTo(`/purchasing-logistics/delivery-orders/${res.id}`);
    }
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
  const salesOrder = salesOrders.value.find((s) => s.id === salesOrderId);
  if (salesOrder) {
    form.value.customerId = salesOrder.customerId;
    form.value.items = salesOrder.SalesOrderItems.map((i) => ({
      partNumber: i.partNumber,
      partNumberSupply: "",
      description: i.description,
      quantityOrder: i.quantity,
      quantitySupply: "",
    }));
    currentPage.value = 1;
  }
}

function loadItemFromGoodsReceipt(goodsReceiptId) {
  const goodsReceipt = goodsReceipts.value.find((g) => g.id === goodsReceiptId);
  if (goodsReceipt) {
    // Todo, filter cuma yg ada di gr
    form.value.items = goodsReceipt.GoodsReceiptItems.map((i) => ({
      partNumber: i.partNumber,
      partNumberSupply: "",
      description: i.description,
      quantityOrder: i.quantity,
      quantitySupply: "",
    }));
    currentPage.value = 1;
  }
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
  }).then((res) => {
    ElMessage({
      message: res.message,
      type: "success",
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
