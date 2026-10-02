<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Vendor Bills">
        <template #extra>
          <el-button :icon="ElIconPlus" type="success" @click="showForm = true"
            >NEW VENDOR BILL</el-button
          >
        </template>
      </el-page-header>
    </template>

    <div class="flex gap-2 mb-2">
      <el-input
        v-model="search"
        placeholder="Search bill or vendor"
        clearable
        class="w-72!"
        :prefix-icon="ElIconSearch"
      />
      <el-select v-model="status" placeholder="Status" clearable class="w-48!">
        <el-option
          v-for="item in ['OPEN', 'PARTIAL', 'PAID', 'OVERDUE', 'VOID']"
          :key="item"
          :value="item"
          :label="item"
        />
      </el-select>
    </div>

    <el-table
      :data="filtered"
      v-loading="isPending"
      stripe
      height="calc(100vh - 205px)"
    >
      <el-table-column label="Bill" prop="number" width="160" />
      <el-table-column label="Vendor" min-width="180">
        <template #default="{ row }">{{
          row.supplier?.name ?? supplierName(row.supplierId)
        }}</template>
      </el-table-column>
      <el-table-column label="Vendor Ref" prop="vendorRef" min-width="130" />
      <el-table-column label="Date" width="120"
        ><template #default="{ row }">{{
          formatDate(row.date)
        }}</template></el-table-column
      >
      <el-table-column label="Due Date" width="120"
        ><template #default="{ row }">{{
          formatDate(row.dueDate)
        }}</template></el-table-column
      >
      <el-table-column label="Total" width="160" align="right"
        ><template #default="{ row }">{{
          toCurrency(row.total, row.currency)
        }}</template></el-table-column
      >
      <el-table-column label="Paid" width="150" align="right"
        ><template #default="{ row }">{{
          toCurrency(row.paidAmount ?? 0, row.currency)
        }}</template></el-table-column
      >
      <el-table-column label="Status" width="120" align="center">
        <template #default="{ row }"
          ><el-tag :type="accountingTagType(row.status)" round>{{
            row.status
          }}</el-tag></template
        >
      </el-table-column>
      <el-table-column fixed="right" width="110" align="center">
        <template #default="{ row }">
          <el-button
            v-if="!row.journalId && row.status !== 'VOID'"
            size="small"
            type="success"
            plain
            @click="openPost(row)"
            >POST</el-button
          >
          <el-tag v-else-if="row.journal" type="success" effect="plain"
            >POSTED</el-tag
          >
        </template>
      </el-table-column>
    </el-table>

    <VendorBillForm
      v-model:show="showForm"
      :suppliers="suppliers"
      @save="save"
    />

    <el-dialog
      v-model="showPost"
      title="POST VENDOR BILL"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form label-width="160px" label-position="left">
        <el-form-item label="Journal Number"
          ><el-input v-model="postData.journalNumber"
        /></el-form-item>
        <el-form-item label="Open Period" :error="postError.periodId">
          <el-select v-model="postData.periodId" class="w-full">
            <el-option
              v-for="period in periods.filter((p) => p.status === 'OPEN')"
              :key="period.id"
              :value="period.id"
              :label="period.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="Expense Account"
          :error="postError.expenseAccountId"
        >
          <el-select
            v-model="postData.expenseAccountId"
            filterable
            class="w-full"
          >
            <el-option
              v-for="a in expenseAccounts"
              :key="a.id"
              :value="a.id"
              :label="`${a.code} - ${a.name}`"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="selectedBill?.taxAmount > 0"
          label="Tax Account"
          :error="postError.taxAccountId"
        >
          <el-select v-model="postData.taxAccountId" filterable class="w-full">
            <el-option
              v-for="a in accounts.filter(
                (x) => x.type === 'ASSET' && x.isActive && x.isPostable,
              )"
              :key="a.id"
              :value="a.id"
              :label="`${a.code} - ${a.name}`"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="Payable Account"
          :error="postError.payableAccountId"
        >
          <el-select
            v-model="postData.payableAccountId"
            filterable
            class="w-full"
          >
            <el-option
              v-for="a in accounts.filter(
                (x) => x.type === 'LIABILITY' && x.isActive && x.isPostable,
              )"
              :key="a.id"
              :value="a.id"
              :label="`${a.code} - ${a.name}`"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPost = false">CANCEL</el-button>
        <el-button type="success" :icon="ElIconSuccessFilled" @click="postBill"
          >POST BILL</el-button
        >
      </template>
    </el-dialog>
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const {
  rows: bills,
  isPending,
  send,
} = useAccountingQuery("vendor-bills", "/api/accounting/vendor-bills");
const { rows: suppliers } = useAccountingQuery("suppliers", "/api/suppliers");
const { rows: accounts } = useAccountingQuery("accounts", "/api/accounts");
const { rows: periods } = useAccountingQuery(
  "periods",
  "/api/accounting/periods",
);
const search = ref("");
const status = ref("");
const showForm = ref(false);
const showPost = ref(false);
const selectedBill = ref(null);
const postError = ref({});
const postData = ref({});
const expenseAccounts = computed(() =>
  accounts.value.filter(
    (a) => a.type === "EXPENSE" && a.isActive && a.isPostable,
  ),
);
const supplierName = (id) =>
  suppliers.value.find((s) => s.id === id)?.name ?? "-";
const filtered = computed(() =>
  bills.value.filter(
    (b) =>
      (!status.value || b.status === status.value) &&
      `${b.number} ${b.supplier?.name ?? supplierName(b.supplierId)}`
        .toLowerCase()
        .includes(search.value.toLowerCase()),
  ),
);

async function save(data) {
  await send("/api/accounting/vendor-bills", "POST", data);
  showForm.value = false;
}

function openPost(row) {
  selectedBill.value = row;
  const today = new Date().toISOString().slice(0, 10);
  const period = periods.value.find(
    (p) =>
      p.status === "OPEN" && p.startDate <= row.date && p.endDate >= row.date,
  );
  postData.value = {
    journalNumber: `JV-${row.date.slice(0, 4)}-${Date.now()}`,
    periodId: period?.id ?? null,
    expenseAccountId: expenseAccounts.value[0]?.id ?? null,
    taxAccountId:
      accounts.value.find(
        (a) => a.type === "ASSET" && /vat input|tax input/i.test(a.name),
      )?.id ?? null,
    payableAccountId:
      accounts.value.find(
        (a) => a.type === "LIABILITY" && /accounts payable/i.test(a.name),
      )?.id ?? null,
  };
  postError.value = {};
  showPost.value = true;
}

async function postBill() {
  postError.value = {};
  if (!postData.value.periodId) postError.value.periodId = "Required";
  if (!postData.value.expenseAccountId)
    postError.value.expenseAccountId = "Required";
  if (selectedBill.value?.taxAmount > 0 && !postData.value.taxAccountId)
    postError.value.taxAccountId = "Required";
  if (!postData.value.payableAccountId)
    postError.value.payableAccountId = "Required";
  if (Object.keys(postError.value).length) return;
  await send(
    `/api/accounting/vendor-bills/${selectedBill.value.id}/post`,
    "POST",
    postData.value,
  );
  showPost.value = false;
}
</script>
