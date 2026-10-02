<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Tax Rates">
        <template #extra>
          <el-button :icon="ElIconPlus" type="success" @click="openForm()">
            ADD NEW TAX
          </el-button>
        </template>
      </el-page-header>
    </template>

    <el-table
      :data="taxes"
      v-loading="isPending"
      stripe
      height="calc(100vh - 155px)"
    >
      <el-table-column type="index" label="#" width="60" />
      <el-table-column label="Code" prop="code" width="140" />
      <el-table-column label="Name" prop="name" min-width="220" />
      <el-table-column label="Rate" width="100" align="right">
        <template #default="{ row }">{{ row.rate }}%</template>
      </el-table-column>
      <el-table-column label="Type" prop="type" width="140" />
      <el-table-column label="Account" min-width="180">
        <template #default="{ row }">
          {{ row.account?.code ?? accountCode(row.accountId) }}
        </template>
      </el-table-column>
      <el-table-column label="Status" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'info'" round>
            {{ row.isActive ? "ACTIVE" : "INACTIVE" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" width="60" align="center">
        <template #default="{ row }">
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-icon><ElIconMoreFilled /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="ElIconEdit" @click="openForm(row)">
                  Edit
                </el-dropdown-item>
                <el-dropdown-item :icon="ElIconDelete" @click="remove(row)">
                  Delete
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <TaxRateForm
      v-model:show="showForm"
      :row="selected"
      :accounts="accounts"
      @save="save"
    />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const { rows: accounts } = useAccountingQuery("accounts", "/api/accounts");
const {
  rows: taxes,
  isPending,
  send,
} = useAccountingQuery("tax-rates", "/api/accounting/tax-rates");
const showForm = ref(false);
const selected = ref(null);

function openForm(row = null) {
  selected.value = row;
  showForm.value = true;
}

const accountCode = (id) =>
  accounts.value.find((a) => a.id === id)?.code ?? "-";

async function save(data) {
  const payload = {
    code: data.code,
    name: data.name,
    rate: Number(data.rate),
    type: data.type,
    accountId: Number(data.accountId),
    isActive: data.isActive,
  };
  const url = data.id
    ? `/api/accounting/tax-rates/${data.id}`
    : "/api/accounting/tax-rates";
  await send(url, data.id ? "PATCH" : "POST", payload);
  showForm.value = false;
}

async function remove(row) {
  ElMessageBox.confirm(`Delete tax ${row.code}?`, "Confirm", {
    type: "warning",
  })
    .then(() => send(`/api/accounting/tax-rates/${row.id}`, "DELETE"))
    .catch(() => {});
}
</script>
