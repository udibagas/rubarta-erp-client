<template>
  <el-dialog
    v-model="show"
    width="1000px"
    :title="!!form?.id ? 'EDIT GOODS RECEIPT' : 'CREATE NEW GOODS RECEIPT'"
    :close-on-click-modal="false"
    top="5vh"
  >
    <el-form label-width="160px" label-position="left">
      <!-- Goods Receipt Header -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">GOODS RECEIPT INFORMATION</span>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="PO Number">
              <el-select
                v-model="form.purchaseOrderId"
                placeholder="Select purchase order"
                filterable
                default-first-option
                @change="(v) => loadFormFromPurchaseOrder(v)"
                clearable
              >
                <el-option
                  v-for="purchaseOrder in purchaseOrders"
                  :key="purchaseOrder.id"
                  :value="purchaseOrder.id"
                  :label="purchaseOrder.number"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="GR Date">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="Date of goods receipt"
                format="DD-MMM-YYYY"
                value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="Supplier" :error="errors.supplierId">
              <el-select
                v-model="form.supplierId"
                placeholder="Select supplier"
                filterable
                default-first-option
              >
                <el-option
                  v-for="supplier in suppliers"
                  :key="supplier.id"
                  :value="supplier.id"
                  :label="supplier.name"
                />
                <template #prefix>
                  <el-icon><ElIconOfficeBuilding /></el-icon>
                </template>
              </el-select>
            </el-form-item>

            <el-form-item label="Supporting Document">
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
      </el-card>

      <!-- Goods Receipt Items -->
      <el-card shadow="never" body-style="padding: 0">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <div class="font-semibold mb-1">
                GOODS RECEIPT ITEMS ({{ form.items.length }})
              </div>
              <div class="flex gap-2">
                <el-tag effect="plain">
                  Total Ordered: {{ toDecimal(totalOrdered) }}
                </el-tag>
                <el-tag type="success" effect="plain">
                  Total Received: {{ toDecimal(totalReceived) }}
                </el-tag>
                <el-tag
                  :type="totalOutstanding > 0 ? 'error' : 'success'"
                  effect="plain"
                >
                  Outstanding: {{ toDecimal(totalOutstanding) }}
                </el-tag>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <el-button
                v-if="form.items.length > 0"
                :icon="ElIconUpload"
                plain
                @click="triggerImportItems"
                :loading="isImporting"
              >
                {{ isImporting ? "Importing..." : "Import Packing List" }}
              </el-button>

              <input
                ref="importInputRef"
                type="file"
                accept=".pdf"
                class="hidden"
                @change="handleImportItems"
              />
            </div>
          </div>
        </template>

        <el-table
          :data="pagedItems"
          border
          :row-class-name="
            ({ row }) =>
              row.quantityReceived < row.quantityOrder
                ? 'bg-red-100!'
                : 'bg-green-100!'
          "
        >
          <template #empty>
            <el-empty description="No Items"> </el-empty>
          </template>
          <el-table-column
            label="#"
            width="60"
            :index="(i) => (currentPage - 1) * pageSize + i + 1"
            type="index"
          />

          <el-table-column label="Part Number" header-align="center">
            <el-table-column
              label="Order"
              min-width="150"
              header-align="center"
            >
              <template #default="{ row }">
                <el-input
                  v-model="row.partNumber"
                  placeholder="Part number ordered"
                />
              </template>
            </el-table-column>

            <el-table-column
              label="Supplier"
              min-width="150"
              header-align="center"
            >
              <template #default="{ row }">
                <el-input
                  v-model="row.partNumberSupplier"
                  placeholder="Part number from supplier"
                />
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column
            label="Description"
            min-width="200"
            header-align="center"
          >
            <template #default="{ row }">
              <el-input
                v-model="row.description"
                type="textarea"
                :rows="1"
                placeholder="Item description"
              />
            </template>
          </el-table-column>

          <el-table-column
            label="Quantity"
            header-align="center"
            align="center"
          >
            <el-table-column
              label="Ordered"
              width="110"
              header-align="center"
              align="center"
            >
              <template #default="{ row }">
                <el-input-number
                  v-model="row.quantityOrder"
                  :min="0"
                  style="width: 100%"
                  controls-position="right"
                />
              </template>
            </el-table-column>

            <el-table-column
              label="Received"
              width="120"
              header-align="center"
              align="center"
            >
              <template #default="{ row }">
                <el-input-number
                  v-model="row.quantityReceived"
                  :min="0"
                  :max="row.quantityOrder"
                  style="width: 100%"
                  controls-position="right"
                />
              </template>
            </el-table-column>
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
        SAVE GOODS RECEIPT
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
const importInputRef = ref(null);
const isImporting = ref(false);
const form = ref({ ...defaultValue });
const errors = ref({});
const isSaving = ref(false);

function triggerImportItems() {
  importInputRef.value?.click();
}

const suppliers = ref([]);
const purchaseOrders = ref([]);

function fetchGraphqlData() {
  useGraphqlQuery(gql`
    query {
      suppliers {
        id
        name
        address
      }
      purchaseOrders {
        id
        number
        date
        supplierId
        PurchaseOrderItems {
          partNumber
          description
          quantity
          receivedQuantity
        }
      }
    }
  `)
    .then((result) => {
      suppliers.value = result.data.suppliers;
      purchaseOrders.value = result.data.purchaseOrders;
    })
    .catch((error) => {
      console.error("Failed to fetch GraphQL data:", error);
    });
}

// Expose method to open form from parent
const openForm = (data = {}) => {
  // Fetch the latest suppliers and purchase orders from the GraphQL API
  fetchGraphqlData();

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
      ? `/api/goods-receipts/${form.value.id}`
      : "/api/goods-receipts";

    const res = await request(url, {
      method: form.value.id ? "PATCH" : "POST",
      body: { ...form.value, companyId: useCookie("companyId").value },
    });

    ElMessage.success("Goods receipt saved successfully");
    emit("saved");
    closeForm();

    if (useRoute().path === "/purchasing-logistics/goods-receipts") {
      navigateTo(`/purchasing-logistics/goods-receipts/${res.id}`);
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

function addItem() {
  if (!form.value.items) {
    form.value.items = [];
  }
  form.value.items.push({
    partNumber: "",
    partNumberSupplier: "",
    description: "",
    quantityOrder: 1,
    quantityReceived: 1,
  });
  currentPage.value = lastPage();
}

function removeItem(row) {
  const index = form.value.items.indexOf(row);
  if (index === -1) return;
  form.value.items.splice(index, 1);
  if (currentPage.value > lastPage()) {
    currentPage.value = lastPage();
  }
}

function loadFormFromPurchaseOrder(purchaseOrderId) {
  const purchaseOrder = purchaseOrders.value.find(
    (p) => p.id === purchaseOrderId,
  );
  if (purchaseOrder) {
    form.value.supplierId = purchaseOrder.supplierId;

    // Only include items that have a remaining quantity to be received
    form.value.items = purchaseOrder.PurchaseOrderItems.filter(
      (i) => i.quantity - i.receivedQuantity > 0,
    ).map((i) => ({
      partNumber: i.partNumber,
      partNumberSupplier: "",
      description: i.description,
      quantityOrder: i.quantity - i.receivedQuantity,
      quantityReceived: 0,
    }));

    currentPage.value = 1;
  }
}

async function handleImportItems(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    isImporting.value = true;

    const formData = new FormData();
    formData.append("file", file);

    const result = await $fetch("/api/goods-receipts/parse-packing-list", {
      method: "POST",
      body: formData,
      baseURL: config.public.apiBase,
      credentials: "include",
    });

    const items = result.items.map((i) => ({
      lineNo: i.lineNo,
      partNumberSupplier: i.packedPartNo,
      quantityReceived: i.packedQty,
    }));

    form.value.items = form.value.items.map((item, index) => {
      // Find the matching item from the imported items based on the part number supplier
      const matchItem = items.find(
        (i) => i.partNumberSupplier === item.partNumber,
      );

      return {
        ...item,
        partNumberSupplier: matchItem?.partNumberSupplier ?? "",
        quantityReceived: matchItem?.quantityReceived ?? 0,
      };
    });

    currentPage.value = 1;
  } catch (error) {
    ElMessage.error(error.message || "Failed to import items from PO");
  } finally {
    isImporting.value = false;
    e.target.value = "";
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

const totalOrdered = computed(() => {
  return form.value.items.reduce(
    (sum, item) => sum + (item.quantityOrder || 0),
    0,
  );
});

const totalReceived = computed(() => {
  return form.value.items.reduce(
    (sum, item) => sum + (item.quantityReceived || 0),
    0,
  );
});

const totalOutstanding = computed(() => {
  return totalOrdered.value - totalReceived.value;
});

defineExpose({ openForm });
</script>
