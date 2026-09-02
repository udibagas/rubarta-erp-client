<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Materials">
        <template #extra>
          <form @submit.prevent="refreshData()" class="flex gap-2">
            <el-checkbox
              v-model="filters.lowStock"
              @change="refreshData()"
              label="Low Stock Only"
              border
            />

            <el-input
              v-model="keyword"
              placeholder="Search..."
              clearable
              :prefix-icon="ElIconSearch"
              @clear="refreshData()"
            />

            <el-dropdown>
              <el-button type="success" :icon="ElIconSetting">
                Actions
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="openForm()" :icon="ElIconPlus">
                    Add New Material
                  </el-dropdown-item>
                  <el-dropdown-item
                    @click="exportExcel()"
                    :icon="ElIconDownload"
                  >
                    Export to Excel
                  </el-dropdown-item>
                  <el-dropdown-item @click="importData()" :icon="ElIconUpload">
                    Import from Excel
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </form>
        </template>
      </el-page-header>
    </template>

    <el-table
      stripe
      v-loading="isPending"
      :data="data?.data ?? []"
      height="calc(100vh - 198px)"
    >
      <el-table-column type="index" label="#" width="60"></el-table-column>

      <el-table-column label="Part Number" width="150">
        <template #default="{ row }">
          <div class="font-semibold font-mono">{{ row.partNumber }}</div>
        </template>
      </el-table-column>

      <el-table-column label="Material" min-width="200">
        <template #default="{ row }">
          <strong>{{ row.name }}</strong>
          <div v-if="row.model" class="text-xs text-gray-600">
            Model: {{ row.model }}
          </div>
          <div v-if="row.description" class="text-xs text-gray-500">
            {{ row.description }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Category" width="150">
        <template #default="{ row }">
          <el-tag
            v-if="row.category"
            type="warning"
            size="small"
            effect="plain"
          >
            {{ row.category }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="Supplier" width="180">
        <template #default="{ row }">
          {{ row.Supplier?.name || "-" }}
        </template>
      </el-table-column>

      <el-table-column label="Stock" width="120" align="center">
        <template #default="{ row }">
          <div
            :class="{
              'text-red-600 font-bold':
                row.currentStock !== null &&
                row.minStock !== null &&
                row.currentStock <= row.minStock,
            }"
          >
            <div>{{ row.currentStock ?? "-" }}</div>
            <div class="text-xs text-gray-500">
              Min: {{ row.minStock ?? "-" }}
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Unit" width="80" align="center">
        <template #default="{ row }">
          {{ row.unit || "-" }}
        </template>
      </el-table-column>

      <el-table-column label="Weight" width="100" align="right">
        <template #default="{ row }">
          <span v-if="row.weight"> {{ formatNumber(row.weight) }} g </span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="Purchase Price" width="150" align="right">
        <template #default="{ row }">
          <el-tag
            v-if="row.purchasePrice"
            size="small"
            effect="plain"
            class="font-mono"
          >
            {{ formatPrice(row.purchasePrice, row.purchaseCurrency) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="Selling Price" width="150" align="right">
        <template #default="{ row }">
          <el-tag
            v-if="row.sellingPrice"
            size="small"
            effect="plain"
            class="font-mono"
            type="success"
          >
            {{ formatPrice(row.sellingPrice, row.sellingCurrency) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="Status" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
            {{ row.isActive ? "Active" : "Inactive" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        width="60px"
        align="center"
        header-align="center"
        fixed="right"
      >
        <template #header>
          <el-button link @click="refreshData()" :icon="ElIconRefresh">
          </el-button>
        </template>
        <template #default="{ row }">
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-icon>
                <ElIconMoreFilled />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  :icon="ElIconView"
                  @click.native.prevent="openDetailDialog(row)"
                >
                  View Detail
                </el-dropdown-item>
                <el-dropdown-item
                  :icon="ElIconEdit"
                  @click.native.prevent="openForm(row)"
                >
                  Edit
                </el-dropdown-item>
                <el-dropdown-item
                  :icon="ElIconRefresh"
                  @click.native.prevent="openStockDialog(row)"
                >
                  Update Stock
                </el-dropdown-item>
                <el-dropdown-item
                  :icon="ElIconDelete"
                  @click.native.prevent="handleRemove(row.id, remove)"
                >
                  Delete
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="p-2 bg-slate-100"
      v-if="data?.total"
      :current-page="page"
      size="small"
      background
      layout="total, sizes, prev, pager, next"
      :page-size="pageSize"
      :page-sizes="[10, 25, 50, 100]"
      :total="data?.total"
      @current-change="currentChange"
      @size-change="sizeChange"
    />

    <MaterialForm />

    <!-- Material Detail Dialog -->
    <el-dialog
      v-model="detailDialog.show"
      width="700px"
      title="Material Details"
      :close-on-click-modal="false"
    >
      <div v-if="detailDialog.material" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Part Number" :span="2">
            <span class="font-mono font-bold">{{
              detailDialog.material.partNumber
            }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Name" :span="2">
            <strong>{{ detailDialog.material.name }}</strong>
          </el-descriptions-item>
          <el-descriptions-item label="Model" :span="2">
            {{ detailDialog.material.model || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="Description" :span="2">
            {{ detailDialog.material.description || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="Category">
            <el-tag
              v-if="detailDialog.material.category"
              type="warning"
              size="small"
            >
              {{ detailDialog.material.category }}
            </el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="Status">
            <el-tag
              :type="detailDialog.material.isActive ? 'success' : 'info'"
              size="small"
            >
              {{ detailDialog.material.isActive ? "Active" : "Inactive" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Supplier" :span="2">
            {{ detailDialog.material.Supplier?.name || "-" }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">Stock Information</el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Current Stock">
            <span
              :class="{
                'text-red-600 font-bold':
                  detailDialog.material.currentStock !== null &&
                  detailDialog.material.minStock !== null &&
                  detailDialog.material.currentStock <=
                    detailDialog.material.minStock,
              }"
            >
              {{ detailDialog.material.currentStock ?? "-" }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="Minimum Stock">
            {{ detailDialog.material.minStock ?? "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="Unit">
            {{ detailDialog.material.unit || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="Lead Time">
            {{
              detailDialog.material.leadTimeDays
                ? `${detailDialog.material.leadTimeDays} days`
                : "-"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="Weight">
            {{
              detailDialog.material.weight
                ? `${formatNumber(detailDialog.material.weight)} g`
                : "-"
            }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">Pricing Information</el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Purchase Price">
            {{
              detailDialog.material.purchasePrice
                ? formatPrice(
                    detailDialog.material.purchasePrice,
                    detailDialog.material.purchaseCurrency,
                  )
                : "-"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="Selling Price">
            {{
              detailDialog.material.sellingPrice
                ? formatPrice(
                    detailDialog.material.sellingPrice,
                    detailDialog.material.sellingCurrency,
                  )
                : "-"
            }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">System Information</el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Created At">
            {{
              detailDialog.material.createdAt
                ? new Date(detailDialog.material.createdAt).toLocaleString(
                    "id-ID",
                  )
                : "-"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="Updated At">
            {{
              detailDialog.material.updatedAt
                ? new Date(detailDialog.material.updatedAt).toLocaleString(
                    "id-ID",
                  )
                : "-"
            }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button
          :icon="ElIconEdit"
          type="primary"
          @click="editFromDetail"
          plain
        >
          EDIT
        </el-button>
        <el-button
          :icon="ElIconCircleCloseFilled"
          @click="closeDetailDialog"
          type="info"
        >
          CLOSE
        </el-button>
      </template>
    </el-dialog>

    <!-- Import Dialog -->
    <el-dialog
      v-model="importDialog.show"
      width="600px"
      title="Import Materials from Excel"
      :close-on-click-modal="false"
    >
      <el-alert type="warning" :closable="false" show-icon>
        <template #title>
          Download the Excel template first, fill in your data, then upload it.
        </template>
      </el-alert>

      <br />

      <el-form label-width="120px" label-position="left">
        <el-form-item label="Step 1">
          <el-button
            :icon="ElIconDownload"
            type="success"
            @click="downloadTemplate"
            plain
          >
            Download Template
          </el-button>
        </el-form-item>

        <el-form-item label="Step 2">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".xlsx,.xls"
            :on-change="handleFileChange"
            :on-exceed="handleExceed"
            drag
          >
            <el-icon class="el-icon--upload">
              <ElIconUpload />
            </el-icon>
            <div class="el-upload__text">
              Drop Excel file here or <em>click to upload</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                Excel files with a size less than 10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item v-if="importDialog.file" label="Selected File">
          <div class="text-sm">
            <el-tag type="success">{{ importDialog.file.name }}</el-tag>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button
          :icon="ElIconCircleCloseFilled"
          @click="closeImportDialog"
          type="info"
          plain
        >
          CANCEL
        </el-button>
        <el-button
          :icon="ElIconUpload"
          type="success"
          @click="uploadFile"
          :disabled="!importDialog.file"
          :loading="importDialog.uploading"
        >
          IMPORT
        </el-button>
      </template>
    </el-dialog>

    <!-- Stock Update Dialog -->
    <el-dialog
      v-model="stockDialog.show"
      width="400px"
      title="Update Stock"
      :close-on-click-modal="false"
    >
      <el-form label-width="150px" label-position="left">
        <el-form-item label="Material">
          <strong>{{ stockDialog.material?.name }}</strong>
        </el-form-item>
        <el-form-item label="Current Stock">
          {{ stockDialog.material?.currentStock ?? 0 }}
        </el-form-item>
        <el-form-item label="Quantity Change" required>
          <el-input-number
            v-model="stockDialog.quantity"
            :controls="true"
            style="width: 100%"
          />
          <div class="text-xs text-gray-500 mt-1">
            Use positive numbers to add stock, negative to reduce
          </div>
        </el-form-item>
        <el-form-item label="New Stock">
          <strong>
            {{
              (stockDialog.material?.currentStock ?? 0) + stockDialog.quantity
            }}
          </strong>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          :icon="ElIconCircleCloseFilled"
          @click="closeStockDialog"
          type="info"
          plain
        >
          CANCEL
        </el-button>
        <el-button
          :icon="ElIconSuccessFilled"
          type="success"
          @click="updateStock"
        >
          UPDATE
        </el-button>
      </template>
    </el-dialog>
  </nuxt-layout>
</template>

<script setup>
import { useMutation, useQueryClient } from "@tanstack/vue-query";
const config = useRuntimeConfig();

definePageMeta({
  layout: false,
});

const {
  openForm,
  removeMutation,
  fetchData,
  refreshData,
  handleRemove,
  currentChange,
  sizeChange,
  page,
  pageSize,
  keyword,
  filters,
} = useCrud({
  url: "/api/materials",
  queryKey: "materials",
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();

// Fetch suppliers for filter
const request = useRequest();

// Material detail dialog
const detailDialog = reactive({
  show: false,
  material: null,
});

function openDetailDialog(material) {
  detailDialog.show = true;
  detailDialog.material = material;
}

function closeDetailDialog() {
  detailDialog.show = false;
  detailDialog.material = null;
}

function editFromDetail() {
  openForm(detailDialog.material);
  closeDetailDialog();
}

// Import dialog
const importDialog = reactive({
  show: false,
  file: null,
  uploading: false,
});

const uploadRef = ref(null);

function importData() {
  importDialog.show = true;
  importDialog.file = null;
  importDialog.uploading = false;
}

function closeImportDialog() {
  importDialog.show = false;
  importDialog.file = null;
  importDialog.uploading = false;
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
}

function handleFileChange(file) {
  importDialog.file = file.raw;
}

function handleExceed() {
  ElMessage({
    message: "Only one file can be uploaded at a time",
    type: "warning",
    showClose: true,
  });
}

async function downloadTemplate() {
  window.open(
    `${config.public.apiBase}/api/materials/export/template`,
    "_blank",
  );
}

async function exportExcel() {
  try {
    // Build query params from current filters
    const params = new URLSearchParams();
    if (keyword.value) params.append("keyword", keyword.value);
    if (filters.value.lowStock) params.append("lowStock", "true");

    const queryString = params.toString();
    const url = `${config.public.apiBase}/api/materials/export/excel${queryString ? `?${queryString}` : ""}`;

    window.open(url, "_blank");

    ElMessage({
      message: "Export started. Your download will begin shortly.",
      type: "success",
      showClose: true,
    });
  } catch (error) {
    ElMessage({
      message: error.message || "Failed to export materials",
      type: "error",
      showClose: true,
    });
  }
}

const importMutation = useMutation({
  mutationFn: async (formData) => {
    return $fetch("/api/materials/import/excel", {
      method: "POST",
      body: formData,
      baseURL: config.public.apiBase,
      credentials: "include",
    });
  },
  onSuccess: (response) => {
    closeImportDialog();
    queryClient.invalidateQueries({ queryKey: ["materials"] });
    ElMessage({
      message: response.message || "Materials imported successfully",
      type: "success",
      showClose: true,
      duration: 5000,
    });
  },
  onError: (error) => {
    importDialog.uploading = false;
    ElMessage({
      message:
        error.data?.message || error.message || "Failed to import materials",
      type: "error",
      showClose: true,
      duration: 5000,
    });
  },
});

function uploadFile() {
  if (!importDialog.file) {
    ElMessage({
      message: "Please select a file to upload",
      type: "warning",
      showClose: true,
    });
    return;
  }

  importDialog.uploading = true;

  const formData = new FormData();
  formData.append("file", importDialog.file);

  importMutation.mutate(formData);
}

// Stock update dialog
const stockDialog = reactive({
  show: false,
  material: null,
  quantity: 0,
});

function openStockDialog(material) {
  stockDialog.show = true;
  stockDialog.material = material;
  stockDialog.quantity = 0;
}

function closeStockDialog() {
  stockDialog.show = false;
  stockDialog.material = null;
  stockDialog.quantity = 0;
}

// Stock update mutation
const queryClient = useQueryClient();
const stockMutation = useMutation({
  mutationFn: ({ id, quantity }) =>
    request(`/api/materials/${id}/stock`, {
      method: "PATCH",
      body: { quantity },
    }),
  onSuccess: () => {
    closeStockDialog();
    queryClient.invalidateQueries({ queryKey: ["materials"] });
    ElMessage({
      message: "Stock updated successfully",
      type: "success",
      showClose: true,
    });
  },
  onError: (error) => {
    ElMessage({
      message: error.message || "Failed to update stock",
      type: "error",
      showClose: true,
    });
  },
});

function updateStock() {
  if (!stockDialog.material) return;
  stockMutation.mutate({
    id: stockDialog.material.id,
    quantity: stockDialog.quantity,
  });
}

// Format price with currency
function formatPrice(value, currency = "IDR") {
  if (!value) return "-";

  const currencyMap = {
    USD: "en-US",
    EUR: "de-DE",
    IDR: "id-ID",
  };

  const locale = currencyMap[currency] || "id-ID";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency || "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format number with thousand separator
function formatNumber(value) {
  if (!value) return "0";
  return new Intl.NumberFormat("id-ID").format(value);
}
</script>
