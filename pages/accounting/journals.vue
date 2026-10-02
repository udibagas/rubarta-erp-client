<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Journal Entries">
        <template #extra>
          <el-button :icon="ElIconPlus" type="success" @click="openForm()">
            NEW JOURNAL ENTRY
          </el-button>
        </template>
      </el-page-header>
    </template>

    <div class="flex gap-2 mb-2">
      <el-input
        v-model="search"
        placeholder="Search number or description"
        clearable
        class="w-72!"
        :prefix-icon="ElIconSearch"
      />
      <el-select
        v-model="statusFilter"
        placeholder="Status"
        clearable
        class="w-48!"
      >
        <el-option
          v-for="s in ['DRAFT', 'POSTED', 'VOID']"
          :key="s"
          :value="s"
          :label="s"
        />
      </el-select>
    </div>

    <el-table
      :data="filtered"
      v-loading="isPending"
      stripe
      height="calc(100vh - 205px)"
    >
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="px-10 py-2">
            <el-table :data="row.lines" size="small" border>
              <el-table-column label="Account" width="120">
                <template #default="{ row: l }">{{
                  l.account?.code ?? accountCode(l.accountId)
                }}</template>
              </el-table-column>
              <el-table-column label="Account Name" min-width="180">
                <template #default="{ row: l }">{{
                  l.account?.name ?? accountName(l.accountId)
                }}</template>
              </el-table-column>
              <el-table-column
                label="Description"
                prop="description"
                min-width="180"
              />
              <el-table-column label="Debit" width="160" align="right">
                <template #default="{ row: l }">{{
                  l.debit ? toCurrency(l.debit) : "-"
                }}</template>
              </el-table-column>
              <el-table-column label="Credit" width="160" align="right">
                <template #default="{ row: l }">{{
                  l.credit ? toCurrency(l.credit) : "-"
                }}</template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Number" prop="number" width="150" />
      <el-table-column label="Date" width="130">
        <template #default="{ row }">{{ formatDate(row.date) }}</template>
      </el-table-column>
      <el-table-column label="Description" prop="description" min-width="220" />
      <el-table-column label="Amount" width="160" align="right">
        <template #default="{ row }">{{
          toCurrency(sumDebitCredit(row.lines).debit)
        }}</template>
      </el-table-column>
      <el-table-column label="Status" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="accountingTagType(row.status)" round effect="dark">
            {{ row.status }}
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
                <el-dropdown-item
                  v-if="row.status === 'DRAFT'"
                  :icon="ElIconEdit"
                  @click="openForm(row)"
                >
                  Edit
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="row.status === 'DRAFT'"
                  :icon="ElIconCheck"
                  @click="postJournal(row)"
                >
                  Post
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="row.status === 'DRAFT'"
                  :icon="ElIconDelete"
                  @click="removeDraft(row)"
                >
                  Delete draft
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="row.status === 'POSTED' && !row.reversedBy"
                  :icon="ElIconRefreshLeft"
                  @click="reverse(row)"
                >
                  Reverse
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <JournalEntryForm
      v-model:show="showForm"
      :row="selected"
      :accounts="accounts"
      :periods="periods"
      @save="save"
    />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const { rows: accounts } = useAccountingQuery("accounts", "/api/accounts");
const periodsQuery = useAccountingQuery("periods", "/api/accounting/periods");
const periods = periodsQuery.rows;
const {
  rows: journals,
  isPending,
  send,
} = useAccountingQuery("journals", "/api/accounting/journals");
const search = ref("");
const statusFilter = ref("");
const showForm = ref(false);
const selected = ref(null);

const accountCode = (id) =>
  accounts.value.find((a) => a.id === id)?.code ?? "-";
const accountName = (id) =>
  accounts.value.find((a) => a.id === id)?.name ?? "-";

const filtered = computed(() =>
  journals.value.filter(
    (j) =>
      (!statusFilter.value || j.status === statusFilter.value) &&
      `${j.number} ${j.description}`
        .toLowerCase()
        .includes(search.value.toLowerCase()),
  ),
);

function openForm(row = null) {
  selected.value = row;
  showForm.value = true;
}

async function save(data) {
  const payload = {
    number: data.number || `JV-${data.date.slice(0, 4)}-${Date.now()}`,
    date: data.date,
    description: data.description,
    periodId: data.periodId,
    source: "MANUAL",
    lines: data.lines.map(({ accountId, description, debit, credit }) => ({
      accountId,
      description,
      debit: Number(debit) || 0,
      credit: Number(credit) || 0,
    })),
  };
  const journal = data.id
    ? await send(`/api/accounting/journals/${data.id}`, "PATCH", payload)
    : await send("/api/accounting/journals", "POST", payload);
  if (data.status === "POSTED") {
    await send(`/api/accounting/journals/${journal.id ?? data.id}/post`);
  }
  showForm.value = false;
}

async function removeDraft(row) {
  const confirmed = await ElMessageBox.confirm(
    `Delete draft ${row.number}?`,
    "Delete journal",
    { type: "warning" },
  )
    .then(() => true)
    .catch(() => false);
  if (!confirmed) return;
  await send(`/api/accounting/journals/${row.id}`, "DELETE");
}

async function postJournal(row) {
  await send(`/api/accounting/journals/${row.id}/post`);
}

async function reverse(row) {
  const confirmed = await ElMessageBox.confirm(
    `Create a reversing entry for ${row.number}?`,
    "Reverse journal",
    { type: "warning" },
  )
    .then(() => true)
    .catch(() => false);
  if (!confirmed) return;
  const today = new Date().toISOString().slice(0, 10);
  const period = periods.value.find(
    (item) =>
      item.status === "OPEN" &&
      item.startDate <= today &&
      item.endDate >= today,
  );
  if (!period) {
    ElMessage.error("No open fiscal period covers today");
    return;
  }
  await send(`/api/accounting/journals/${row.id}/reverse`, "POST", {
    number: `JV-${today.slice(0, 4)}-${Date.now()}`,
    date: today,
    periodId: period.id,
  });
}
</script>
