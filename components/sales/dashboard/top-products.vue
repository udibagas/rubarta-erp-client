<template>
  <el-card
    class="rounded-xl border border-gray-100 shadow-sm h-full"
    shadow="hover"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-purple-50 rounded-lg text-purple-600">
            <Package :size="18" />
          </div>
          <div>
            <div class="font-semibold text-gray-800 text-base">
              Top Selling Products
            </div>
            <div class="text-xs text-gray-500">
              Highest grossing inventory items & materials
            </div>
          </div>
        </div>

        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="revenue">Revenue</el-radio-button>
          <el-radio-button value="quantity">Units Sold</el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <div class="space-y-3.5">
      <div
        v-for="(product, index) in topProducts"
        :key="product.sku"
        class="group p-2.5 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-200"
      >
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <div class="flex items-center gap-2.5 min-w-0">
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              :class="
                index === 0
                  ? 'bg-amber-100 text-amber-700'
                  : index === 1
                    ? 'bg-slate-200 text-slate-700'
                    : index === 2
                      ? 'bg-amber-700/10 text-amber-900'
                      : 'bg-gray-100 text-gray-500'
              "
            >
              {{ index + 1 }}
            </span>
            <div class="min-w-0">
              <div
                class="text-xs font-semibold text-gray-800 truncate group-hover:text-emerald-700"
              >
                {{ product.name }}
              </div>
              <div class="text-[11px] text-gray-400 flex items-center gap-2">
                <span>SKU: {{ product.sku }}</span>
                <span>&bull;</span>
                <span class="text-gray-500">{{ product.category }}</span>
              </div>
            </div>
          </div>

          <div class="text-right shrink-0">
            <div class="text-xs font-bold text-gray-800">
              {{
                viewMode === "revenue"
                  ? product.formattedRevenue
                  : `${product.quantity} ${product.unit}`
              }}
            </div>
            <div class="text-[11px] text-emerald-600 font-medium">
              {{ product.growth }}
            </div>
          </div>
        </div>

        <!-- Progress bar of share -->
        <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            class="h-full rounded-full bg-emerald-500 transition-all duration-500"
            :style="{ width: `${product.share}%` }"
          ></div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Package } from "lucide-vue-next";
import { toRupiah } from "@/utils/number";

const viewMode = ref<"revenue" | "quantity">("revenue");

const topProducts = [
  {
    sku: "MAT-SS-304-01",
    name: "Stainless Steel Plate 304 2B 1.2mm x 4' x 8'",
    category: "Sheet & Plates",
    revenue: "645000000",
    formattedRevenue: toRupiah("645000000"),
    quantity: 420,
    unit: "Sheets",
    share: 88,
    growth: "+18.2%",
  },
  {
    sku: "MAT-CS-PIPE-04",
    name: 'Seamless Carbon Steel Pipe ASTM A106 Gr.B 4" Sch 40',
    category: "Pipes & Tubes",
    revenue: "512000000",
    formattedRevenue: toRupiah("512000000"),
    quantity: 680,
    unit: "Mtr",
    share: 72,
    growth: "+12.5%",
  },
  {
    sku: "MAT-FLG-WN-06",
    name: "Flange ANSI 150# RF WNRF 6 inch A105",
    category: "Flanges & Fittings",
    revenue: "389000000",
    formattedRevenue: toRupiah("389000000"),
    quantity: 340,
    unit: "Pcs",
    share: 56,
    growth: "+9.4%",
  },
  {
    sku: "MAT-VLV-BALL-02",
    name: "Cast Steel Ball Valve Class 300 2 inch Flanged",
    category: "Valves",
    revenue: "275000000",
    formattedRevenue: toRupiah("275000000"),
    quantity: 115,
    unit: "Pcs",
    share: 42,
    growth: "+15.0%",
  },
  {
    sku: "MAT-ELB-90-03",
    name: 'Elbow 90 Deg Long Radius Sch 40 Carbon Steel 3"',
    category: "Flanges & Fittings",
    revenue: "198000000",
    formattedRevenue: toRupiah("198000000"),
    quantity: 520,
    unit: "Pcs",
    share: 32,
    growth: "+7.8%",
  },
];
</script>
