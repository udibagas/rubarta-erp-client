<template>
  <el-table :data="data?.data ?? []" stripe v-loading="isPending">
    <el-table-column type="index" label="#" width="60" />
    <el-table-column label="Name" prop="name" min-width="200" />
    <el-table-column label="Stage" width="150" align="center">
      <template #default="{ row }">
        <StatusTag :status="row.stage" />
      </template>
    </el-table-column>
    <el-table-column label="Amount" width="150" align="right">
      <template #default="{ row }">
        <strong class="font-mono">
          {{ toCurrency(row.amount.toString()) }}
        </strong>
      </template>
    </el-table-column>
    <el-table-column label="Probability" width="200" align="center">
      <template #default="{ row }">
        <el-progress
          :percentage="row.probability"
          :status="row.probability === 100 ? 'success' : 'active'"
          :text-inside="true"
          :stroke-width="15"
        />
      </template>
    </el-table-column>
    <el-table-column label="Expected Close" width="150" align="center">
      <template #default="{ row }">
        {{ formatDate(row.expectedCloseDate) }}
      </template>
    </el-table-column>
    <el-table-column width="80" align="center">
      <template #default="{ row }">
        <el-button
          link
          type="primary"
          @click="navigateTo(`/crm/opportunities?id=${row.id}`)"
        >
          View
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-empty
    v-if="!data || data.length === 0"
    description="No opportunities found"
  />
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";

const props = defineProps({
  leadId: {
    type: [String, Number],
    required: false,
  },
  customerId: {
    type: [String, Number],
    required: false,
  },
});

const request = useRequest();

const { data, isPending } = useQuery({
  queryKey: ["opportunities", props],
  queryFn: async () => {
    const params = new URLSearchParams();
    params.append("page", "1");
    params.append("pageSize", "1000");
    if (props.leadId) params.append("leadId", props.leadId);
    if (props.customerId) params.append("customerId", props.customerId);
    const query = params.toString() ? `?${params.toString()}` : "";
    return await request(`/api/opportunities${query}`);
  },
  enabled: computed(() => !!(props.leadId || props.customerId)),
});
</script>
