<template>
  <el-card
    class="rounded-xl border border-gray-100 shadow-sm h-full"
    shadow="hover"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-amber-50 rounded-lg text-amber-600">
            <Trophy :size="18" />
          </div>
          <div>
            <div class="font-semibold text-gray-800 text-base">
              Sales Rep Performance
            </div>
            <div class="text-xs text-gray-500">
              Quota attainment and individual conversion rate
            </div>
          </div>
        </div>

        <el-tag size="small" type="warning" effect="plain" class="rounded-full">
          Monthly Quota
        </el-tag>
      </div>
    </template>

    <div class="space-y-3.5">
      <div
        v-for="(rep, idx) in reps"
        :key="rep.name"
        class="p-3 rounded-lg border border-gray-100 hover:border-amber-200 transition-colors"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0"
              :style="{ backgroundColor: getAvatarColor(rep.name) }"
            >
              {{ getInitials(rep.name) }}
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-semibold text-gray-800">{{
                  rep.name
                }}</span>
                <span v-if="idx === 0" class="text-xs" title="Top Performer"
                  >👑</span
                >
              </div>
              <div class="text-[11px] text-gray-400">
                {{ rep.deals }} Won Deals &bull; Win Rate:
                <span class="font-medium text-gray-700"
                  >{{ rep.winRate }}%</span
                >
              </div>
            </div>
          </div>

          <div class="text-right">
            <div class="text-xs font-bold text-gray-900">
              {{ rep.formattedAchieved }}
            </div>
            <div
              class="text-[11px] font-semibold"
              :class="
                rep.percent >= 100 ? 'text-emerald-600' : 'text-amber-600'
              "
            >
              {{ rep.percent }}% of {{ rep.formattedTarget }}
            </div>
          </div>
        </div>

        <el-progress
          :percentage="Math.min(rep.percent, 100)"
          :status="
            rep.percent >= 100 ? 'success' : rep.percent >= 80 ? '' : 'warning'
          "
          :stroke-width="8"
          :show-text="false"
        />
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { Trophy } from "lucide-vue-next";
import { toRupiah } from "@/utils/number";
import { getAvatarColor } from "@/utils/avatar";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const reps = [
  {
    name: "Budi Santoso",
    achieved: "985000000",
    formattedAchieved: toRupiah("985000000"),
    target: "850000000",
    formattedTarget: "Rp 850M",
    percent: 115.8,
    deals: 34,
    winRate: 78.5,
  },
  {
    name: "Siti Rahmawati",
    achieved: "890000000",
    formattedAchieved: toRupiah("890000000"),
    target: "800000000",
    formattedTarget: "Rp 800M",
    percent: 111.2,
    deals: 29,
    winRate: 72.0,
  },
  {
    name: "Rian Hidayat",
    achieved: "740000000",
    formattedAchieved: toRupiah("740000000"),
    target: "750000000",
    formattedTarget: "Rp 750M",
    percent: 98.6,
    deals: 24,
    winRate: 65.4,
  },
  {
    name: "Dewi Lestari",
    achieved: "680000000",
    formattedAchieved: toRupiah("680000000"),
    target: "700000000",
    formattedTarget: "Rp 700M",
    percent: 97.1,
    deals: 21,
    winRate: 63.2,
  },
  {
    name: "Agus Pratama",
    achieved: "550000000",
    formattedAchieved: toRupiah("550000000"),
    target: "650000000",
    formattedTarget: "Rp 650M",
    percent: 84.6,
    deals: 18,
    winRate: 58.0,
  },
];
</script>
