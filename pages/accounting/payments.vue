<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Receipts & Payments">
        <template #extra>
          <el-button
            :icon="ElIconBottom"
            type="success"
            @click="openForm('IN')"
          >
            NEW RECEIPT
          </el-button>
          <el-button :icon="ElIconTop" type="primary" @click="openForm('OUT')">
            NEW PAYMENT
          </el-button>
        </template>
      </el-page-header>
    </template>

    <el-tabs v-model="tab">
      <el-tab-pane label="All" name="ALL" />
      <el-tab-pane label="Receipts" name="IN" />
      <el-tab-pane label="Payments" name="OUT" />
    </el-tabs>

    <el-table
      :data="filtered"
      v-loading="isPending"
      stripe
      height="calc(100vh - 215px)"
    >
      <el-table-column label="Number" prop="number" width="130" />
      <el-table-column label="Type" width="110">
        <template #default="{ row }">
          <el-tag
            :type="row.direction === 'IN' ? 'success' : 'primary'"
            effect="plain"
          >
            {{ row.direction === "IN" ? "RECEIPT" : "PAYMENT" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Date" width="120">
        <template #default="{ row }">{{ formatDate(row.date) }}</template>
      </el-table-column>
      <el-table-column label="Customer / Vendor" min-width="200">
        <template #default="{ row }">
          {{ row.customer?.name ?? row.supplier?.name ?? "-" }}
        </template>
      </el-table-column>
      <el-table-column label="Reference" prop="reference" width="130" />
      <el-table-column label="Method" prop="method" width="110" />
      <el-table-column label="Cash / Bank" min-width="150">
        <template #default="{ row }">{{
          row.cashBankAccount?.name ?? "-"
        }}</template>
      </el-table-column>
      <el-table-column label="Amount" width="160" align="right">
        <template #default="{ row }">{{ toCurrency(row.amount) }}</template>
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
                  :icon="ElIconCheck"
                  @click="openConfirm(row)"
                >
                  Confirm
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="row.status === 'DRAFT'"
                  :icon="ElIconDelete"
                  @click="remove(row)"
                >
                  Delete
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <AccountingPaymentForm
      v-model:show="showForm"
      :row="selected"
      :direction="direction"
      :cash-banks="cashBanks"
      :customers="customers"
      :suppliers="suppliers"
      :documents="direction === 'IN' ? invoices : bills"
      @save="save"
    />

    <el-dialog v-model="showConfirm" title="CONFIRM PAYMENT" width="520px">
      <el-form label-width="150px" label-position="left">
        <el-form-item label="Fiscal Period" :error="confirmError.periodId">
          <el-select v-model="confirmData.periodId" class="w-full">
            <el-option
              v-for="period in periods.filter((p) => p.status === 'OPEN')"
              :key="period.id"
              :value="period.id"
              :label="period.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="Control Account"
          :error="confirmError.controlAccountId"
        >
          <el-select
            v-model="confirmData.controlAccountId"
            filterable
            class="w-full"
          >
            <el-option
              v-for="account in controlAccounts"
              :key="account.id"
              :value="account.id"
              :label="`${account.code} - ${account.name}`"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showConfirm = false">CANCEL</el-button>
        <el-button
          type="success"
          :icon="ElIconSuccessFilled"
          @click="confirmPayment"
          >CONFIRM</el-button
        >
      </template>
    </el-dialog>
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const {
  rows: items,
  send,
  isPending,
} = useAccountingQuery("payments", "/api/accounting/payments");
const { rows: cashBanks } = useAccountingQuery(
  "cash-bank-accounts",
  "/api/accounting/cash-bank/accounts",
);
const { rows: accounts } = useAccountingQuery("accounts", "/api/accounts");
const { rows: periods } = useAccountingQuery(
  "periods",
  "/api/accounting/periods",
);
const { rows: customers } = useAccountingQuery("customers", "/api/customers");
const { rows: suppliers } = useAccountingQuery("suppliers", "/api/suppliers");
const { rows: invoices } = useAccountingQuery("invoices", "/api/invoices");
const { rows: bills } = useAccountingQuery(
  "vendor-bills",
  "/api/accounting/vendor-bills",
);
const tab = ref("ALL");
const showForm = ref(false);
const selected = ref(null);
const direction = ref("IN");
const showConfirm = ref(false);
const confirmRow = ref(null);
const confirmData = ref({ periodId: null, controlAccountId: null });
const confirmError = ref({});
const controlAccounts = computed(() => {
  const type = confirmRow.value?.direction === "IN" ? "ASSET" : "LIABILITY";
  return accounts.value.filter(
    (account) =>
      account.type === type && account.isActive && account.isPostable,
  );
});

const filtered = computed(() =>
  items.value.filter((p) => tab.value === "ALL" || p.direction === tab.value),
);

function openForm(dir) {
  direction.value = dir;
  selected.value = null;
  showForm.value = true;
}

async function save(data) {
  await send("/api/accounting/payments", "POST", data);
  showForm.value = false;
}

async function remove(row) {
  await send(`/api/accounting/payments/${row.id}`, "DELETE");
}

function openConfirm(row) {
  confirmRow.value = row;
  const today = new Date().toISOString().slice(0, 10);
  const period = periods.value.find(
    (item) =>
      item.status === "OPEN" &&
      item.startDate <= today &&
      item.endDate >= today,
  );
  confirmData.value = {
    periodId: period?.id ?? null,
    controlAccountId: controlAccounts.value[0]?.id ?? null,
  };
  confirmError.value = {};
  showConfirm.value = true;
}

async function confirmPayment() {
  confirmError.value = {};
  if (!confirmData.value.periodId) confirmError.value.periodId = "Required";
  if (!confirmData.value.controlAccountId)
    confirmError.value.controlAccountId = "Required";
  if (Object.keys(confirmError.value).length) return;
  const today = new Date().toISOString().slice(0, 10);
  const row = confirmRow.value;
  await send(`/api/accounting/payments/${row.id}/confirm`, "POST", {
    journalNumber: `JV-${today.slice(0, 4)}-${Date.now()}`,
    periodId: confirmData.value.periodId,
    controlAccountId: confirmData.value.controlAccountId,
  });
  showConfirm.value = false;
}
</script>
