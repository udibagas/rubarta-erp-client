<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Chart of Accounts">
        <template #extra>
          <el-button :icon="ElIconPlus" type="success" @click="openForm()">
            ADD NEW ACCOUNT
          </el-button>
        </template>
      </el-page-header>
    </template>

    <div class="flex gap-2 mb-2">
      <el-input
        v-model="search"
        placeholder="Search code or name"
        clearable
        class="w-72!"
        :prefix-icon="ElIconSearch"
      />
      <el-select
        v-model="typeFilter"
        placeholder="Type"
        clearable
        class="w-48!"
      >
        <el-option
          v-for="t in ACCOUNT_TYPES"
          :key="t.value"
          :value="t.value"
          :label="t.label"
        />
      </el-select>
    </div>

    <el-table
      :data="filtered"
      v-loading="isPending"
      stripe
      height="calc(100vh - 205px)"
    >
      <el-table-column type="index" label="#" width="60" />
      <el-table-column label="Code" prop="code" width="120" sortable />
      <el-table-column label="Name" prop="name" min-width="220" />
      <el-table-column label="Type" width="130">
        <template #default="{ row }">
          <el-tag effect="plain">{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Postable" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isPostable ? 'success' : 'info'" effect="plain">
            {{ row.isPostable ? "YES" : "NO" }}
          </el-tag>
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

    <ChartOfAccountForm
      v-model:show="showForm"
      :row="selected"
      :parents="accounts"
      @save="save"
    />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const {
  rows: accounts,
  isPending,
  send,
} = useAccountingQuery("accounts", "/api/accounts");
const search = ref("");
const typeFilter = ref("");
const showForm = ref(false);
const selected = ref(null);

const filtered = computed(() =>
  accounts.value.filter(
    (a) =>
      (!typeFilter.value || a.type === typeFilter.value) &&
      `${a.code} ${a.name}`.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

function openForm(row = null) {
  selected.value = row;
  showForm.value = true;
}

async function save(data) {
  const payload = {
    code: data.code,
    name: data.name,
    type: data.type,
    parentId: data.parentId ?? null,
    isActive: data.isActive,
    isPostable: data.isPostable,
    description: data.description,
  };
  const url = data.id ? `/api/accounts/${data.id}` : "/api/accounts";
  await send(url, data.id ? "PATCH" : "POST", payload);
  showForm.value = false;
}

async function remove(row) {
  ElMessageBox.confirm(`Delete account ${row.code}?`, "Confirm", {
    type: "warning",
  })
    .then(() => send(`/api/accounts/${row.id}`, "DELETE"))
    .catch(() => {});
}
</script>
