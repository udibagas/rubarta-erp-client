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
            />

            <el-input
              v-model="keyword"
              placeholder="Search by part number, name, or description..."
              clearable
              style="width: 300px"
              :prefix-icon="ElIconSearch"
              @clear="refreshData()"
            />

            <el-button :icon="ElIconPlus" type="success" @click="openForm()">
              ADD NEW MATERIAL
            </el-button>
          </form>
        </template>
      </el-page-header>
    </template>

    <el-table
      stripe
      v-loading="isPending"
      :data="data"
      height="calc(100vh - 220px)"
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

      <el-table-column label="Price" width="120" align="right">
        <template #default="{ row }">
          {{ row.unitPrice ? formatCurrency(row.unitPrice) : "-" }}
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

    <MaterialForm />

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
        <el-button :icon="ElIconCircleCloseFilled" @click="closeStockDialog">
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";

definePageMeta({
  layout: false,
});

const {
  openForm,
  removeMutation,
  fetchData,
  refreshData,
  handleRemove,
  keyword,
  filters,
  filterChange,
} = useCrud({
  url: "/api/materials",
  queryKey: "materials",
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();

// Fetch suppliers for filter
const request = useRequest();
const { data: suppliers } = useQuery({
  queryKey: ["suppliers"],
  queryFn: () => request("/api/suppliers"),
});

// Material categories (you can adjust these based on your needs)
const categories = ref([
  "Raw Material",
  "Component",
  "Finished Product",
  "Packaging",
  "Consumable",
  "Other",
]);

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

// Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
}
</script>
