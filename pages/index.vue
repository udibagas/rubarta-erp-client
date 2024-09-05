<template>
  <el-row v-if="isSuccess" :gutter="10">
    <el-col :span="6">
      <el-card>
        <el-statistic :value="summary.nkpDraft">
          <template #title>
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
              "
            >
              <div class="title">NKP</div>
              <StatusTag status="DRAFT" />
            </div>
          </template>
        </el-statistic>
      </el-card>
    </el-col>

    <el-col :span="6">
      <el-card>
        <el-statistic :value="summary.nkpOpen">
          <template #title>
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
              "
            >
              <div class="title">NKP</div>
              <StatusTag status="OPEN" />
            </div>
          </template>
        </el-statistic>
      </el-card>
    </el-col>

    <el-col :span="6">
      <el-card>
        <el-statistic :value="summary.nkpClosed">
          <template #title>
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
              "
            >
              <div class="title">NKP</div>
              <StatusTag status="CLOSED" />
            </div>
          </template>
        </el-statistic>
      </el-card>
    </el-col>

    <el-col :span="6">
      <el-card>
        <el-statistic :value="summary.pendingApprovalCount">
          <template #title>
            <div class="title">Pending Approval</div>
          </template>
        </el-statistic>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
const request = useRequest();

const { data: summary, isSuccess } = useQuery({
  queryKey: ["summary"],
  queryFn: () => request("/api/report/summary"),
});
</script>

<style scoped>
.title {
  font-size: 1rem;
}
</style>
