<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Fiscal Periods">
        <template #extra>
          <el-button :icon="ElIconPlus" type="success" @click="openForm()">
            ADD NEW PERIOD
          </el-button>
        </template>
      </el-page-header>
    </template>

    <el-table
      :data="periods"
      v-loading="isPending"
      stripe
      height="calc(100vh - 155px)"
    >
      <el-table-column type="index" label="#" width="60" />
      <el-table-column label="Name" prop="name" min-width="160" />
      <el-table-column label="Start Date" width="160">
        <template #default="{ row }">{{ formatDate(row.startDate) }}</template>
      </el-table-column>
      <el-table-column label="End Date" width="160">
        <template #default="{ row }">{{ formatDate(row.endDate) }}</template>
      </el-table-column>
      <el-table-column label="Status" width="120" align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.status === 'OPEN' ? 'success' : 'info'"
            round
            effect="dark"
          >
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" width="200" align="center">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'OPEN'"
            size="small"
            type="warning"
            plain
            @click="toggle(row, 'CLOSED')"
          >
            CLOSE PERIOD
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <FiscalPeriodForm v-model:show="showForm" @save="save" />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const {
  rows: periods,
  isPending,
  send,
} = useAccountingQuery("periods", "/api/accounting/periods");
const showForm = ref(false);

function openForm() {
  showForm.value = true;
}

async function save(data) {
  await send("/api/accounting/periods", "POST", data);
  showForm.value = false;
}

function toggle(row) {
  ElMessageBox.confirm(`Close period ${row.name}?`, "Confirm", {
    type: "warning",
  })
    .then(() => send(`/api/accounting/periods/${row.id}/close`))
    .catch(() => {});
}
</script>
