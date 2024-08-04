<template>
  <div class="flex align-items-center">
    <el-icon :size="24" @click.prevent="emit('toggle')" style="cursor: pointer">
      <Expand v-if="collapse" />
      <Fold v-else />
    </el-icon>

    <div class="brand" style="flex-grow: 1">RUBARTA ERP SYSTEM</div>

    <el-select
      v-model="companyId"
      placeholder="Select Company"
      style="width: 270px"
      @change="(id) => changeCompany(id)"
    >
      <el-option
        v-for="c in companies"
        :key="c.id"
        :label="`${c.code} - ${c.name}`"
        :value="c.id"
      />
    </el-select>
  </div>
</template>

<script setup>
import { Fold, Expand } from "@element-plus/icons-vue";
const { collapse } = defineProps(["collapse"]);
const emit = defineEmits(["toggle"]);
const companyId = ref(useCookie("companyId"));
const request = useRequest();

const { data: companies } = useQuery({
  queryKey: ["companies"],
  queryFn: () => request("/api/companies"),
});

const { mutate: changeCompany } = useMutation({
  mutationFn: (id) => request(`/api/companies/set/${id}`, { method: "POST" }),
  queryKey: ["companyId"],
});
</script>
