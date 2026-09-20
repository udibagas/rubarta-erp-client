<template>
  <el-card class="rounded-xl border border-gray-100 shadow-sm" shadow="hover">
    <template #header>
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div class="flex items-center gap-2">
          <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <ShoppingBag :size="18" />
          </div>
          <div>
            <div class="font-semibold text-gray-800 text-base">
              Recent Documents
            </div>
            <div class="text-xs text-gray-500">
              Latest quotations, orders, deliveries and invoices
            </div>
          </div>
        </div>

        <el-input
          v-model="searchQuery"
          placeholder="Search document number..."
          size="small"
          clearable
          style="width: 220px"
        >
          <template #prefix>
            <Search :size="14" class="text-gray-400" />
          </template>
        </el-input>
      </div>
    </template>

    <div class="overflow-x-auto">
      <el-table :data="filteredDocuments" style="width: 100%" size="default">
        <el-table-column label="Document #" min-width="160">
          <template #default="{ row }">
            <el-link
              type="success"
              class="font-mono font-semibold"
              @click="navigateTo(`${row.meta.route}/${row.id}`)"
            >
              {{ row.number }}
            </el-link>
            <div class="text-[11px] text-gray-400">
              {{ formatDate(row.date) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Type" min-width="150">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <component
                :is="row.meta.icon"
                :size="14"
                :style="{ color: row.meta.color }"
              />
              <span class="text-xs text-gray-700">{{ row.meta.label }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Status" min-width="130" align="center">
          <template #default="{ row }">
            <el-tag
              :type="colors[row.status] ?? 'info'"
              size="small"
              effect="light"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Amount" min-width="150" align="right">
          <template #default="{ row }">
            <div class="font-mono font-bold text-xs text-gray-900">
              {{ row.amount != null ? toRupiah(String(row.amount)) : "—" }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="" width="80" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="navigateTo(`${row.meta.route}/${row.id}`)"
            >
              Detail
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ShoppingBag, Search } from "lucide-vue-next";
import { toRupiah } from "@/utils/number";
import { formatDate } from "@/utils/date";
import { getDocumentTypeMeta } from "@/utils/documentType";
import { colors } from "@/constants/colors";
import type { SalesDashboardData } from "@/types/salesDashboard.types";

const props = defineProps<{
  data?: SalesDashboardData | null;
}>();

const searchQuery = ref("");

const documents = computed(
  () =>
    props.data?.recent?.map((item) => ({
      ...item,
      meta: getDocumentTypeMeta(item.type),
    })) ?? [],
);

const filteredDocuments = computed(() => {
  if (!searchQuery.value.trim()) return documents.value;
  const q = searchQuery.value.toLowerCase();
  return documents.value.filter((doc) => doc.number.toLowerCase().includes(q));
});
</script>
