<template>
  <el-row v-if="isSuccess" :gutter="10">
    <el-col :span="8">
      <el-card>
        <el-statistic :value="summary.expenseClaimCount">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              Expense Claim
            </div>
          </template>
        </el-statistic>
      </el-card>
    </el-col>

    <el-col :span="8">
      <el-card>
        <el-statistic :value="summary.paymentAuthorizationCount">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              Payment Authorization
            </div>
          </template>
        </el-statistic>
      </el-card>
    </el-col>

    <el-col :span="8">
      <el-card>
        <el-statistic :value="summary.pendingApprovalCount">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              Pending Approval
            </div>
          </template>
        </el-statistic>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { Warning } from "@element-plus/icons-vue";
const request = useRequest();

const { data: summary, isSuccess } = useQuery({
  queryKey: ["summary"],
  queryFn: () => request("/api/report/summary"),
});
</script>
