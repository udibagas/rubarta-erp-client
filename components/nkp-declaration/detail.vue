<template>
  <el-dialog v-if="detail.id" v-model="showDetail" width="800" draggable>
    <template #header="{ titleId, titleClass }">
      <div class="my-header">
        <div :id="titleId" :class="titleClass" style="font-weight: bold">
          NKP DECLARATION #{{ detail.number }}
        </div>
        <StatusTag :status="detail.status" />
      </div>
    </template>

    <el-descriptions :border="true" :column="2" direction="horizontal">
      <el-descriptions-item label="Employee">
        <strong> {{ detail.Employee?.name }}</strong>
      </el-descriptions-item>

      <el-descriptions-item label="Company">
        <strong>{{ detail.Company?.name }}</strong>
      </el-descriptions-item>

      <el-descriptions-item label="Date">
        {{ formatDateLong(detail.date) }}
      </el-descriptions-item>

      <el-descriptions-item label="Department">
        {{ detail.Department?.name }}
      </el-descriptions-item>
    </el-descriptions>

    <br />

    <el-table :data="detail.ExpenseClaimItem">
      <el-table-column type="index" label="#"></el-table-column>

      <el-table-column label="DATE" width="120">
        <template #default="{ row }">
          {{ formatDate(row.date) }}
        </template>
      </el-table-column>

      <el-table-column label="TYPE">
        <template #default="{ row }">
          {{ row.ExpenseType?.name }}
        </template>
      </el-table-column>

      <el-table-column label="DESCRIPTION" prop="description">
      </el-table-column>

      <el-table-column label="AMOUNT" width="120" align="right">
        <template #default="{ row }">
          <strong>{{ toCurrency(row.amount) }}</strong>
        </template>
      </el-table-column>
    </el-table>

    <NkpDeclarationSummary :items="detail.ExpenseClaimItem" />

    <table class="table">
      <tbody>
        <tr>
          <td class="strong">TOTAL EXPENSE</td>
          <td class="text-right">
            <strong>{{ toCurrency(totalAmount) }}</strong>
          </td>
        </tr>

        <tr>
          <td class="strong">CASH ADVANCE</td>
          <td class="text-right">
            <strong>{{ toCurrency(detail.cashAdvance) }}</strong>
          </td>
        </tr>

        <tr>
          <td class="strong">BALANCE</td>
          <td class="text-right">
            <strong>
              <el-text :type="balance > 0 ? 'success' : 'danger'">
                {{ toCurrency(balance) }}
              </el-text>
            </strong>
          </td>
        </tr>
      </tbody>
    </table>

    <br />

    <ImageList v-if="srcList.length > 0" :src-list="srcList" />

    <ApprovalDetail
      v-if="detail.ExpenseClaimApproval.length > 0"
      approve-url="/api/expense-claims/approve"
      query-key="expense-claims"
      :approvals="detail.ExpenseClaimApproval"
      :request-id="detail.id"
      @reload="reload"
    />

    <template #footer>
      <el-button
        v-if="allowAction"
        :icon="ElIconSuccessFilled"
        type="warning"
        @click="openForm(detail.id)"
      >
        EDIT
      </el-button>

      <el-button
        :icon="ElIconPrinter"
        type="warning"
        @click="handlePrint(detail.id)"
      >
        PRINT
      </el-button>

      <el-button
        v-if="allowAction"
        :icon="ElIconDelete"
        type="danger"
        @click="handleRemove(detail.id, closeDetailAndRemove)"
      >
        DELETE
      </el-button>

      <el-button
        v-if="allowAction"
        :icon="ElIconSuccessFilled"
        type="success"
        @click="submit(detail.id)"
      >
        SUBMIT
      </el-button>

      <el-button
        v-if="detail.status == 'FULLY_APPROVED'"
        :icon="ElIconChecked"
        type="danger"
        @click="convertToNkp()"
      >
        CONVERT TO NKP
      </el-button>
    </template>
  </el-dialog>

  <NkpDeclarationConvert
    :show="showClaimForm"
    :data="claimData"
    @close="showClaimForm = false"
  />
</template>

<script setup>
import { showDetail, detail, closeDetail } from "~/stores/detail";

const { user } = useSanctumAuth();
const config = useRuntimeConfig();
const showClaimForm = ref(false);
const claimData = ref({ ...detail });

const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: () => request("/api/users"),
});

const allowAction = computed(() => {
  return detail.value.status == "DRAFT";
});

const { request, edit, handleRemove, removeMutation, refreshData } = useCrud({
  url: "/api/expense-claims",
  queryKey: "expense-claims",
});

const { mutate: remove } = removeMutation();

function openForm(id) {
  closeDetail();
  edit(id);
}

function closeDetailAndRemove(id) {
  closeDetail();
  remove(id);
}

const totalAmount = computed(() => {
  return (
    detail.value.ExpenseClaimItem?.reduce(
      (total, current) => total + Number(current.amount),
      0
    ) ?? 0
  );
});

const balance = computed(() => {
  return Number(detail.value.cashAdvance) - totalAmount.value;
});

const srcList = computed(() => {
  return (
    detail.value.ExpenseClaimAttachment?.map(
      (el) => `${config.public.apiBase}/${el.filePath}`
    ) ?? []
  );
});

function reload() {
  request(`/api/expense-claims/${detail.value.id}`).then((res) => {
    detail.value = res;
  });
}

async function submit(id) {
  try {
    await ElMessageBox.confirm(
      "Anda yakin akan mengajukan klaim ini?",
      "Warning",
      {
        type: "warning",
      }
    );

    await request(`/api/expense-claims/submit/${id}`, { method: "POST" });
    refreshData(); // refresh data on table
    reload(); // reload detail data
  } catch (error) {
    return;
  }
}

function convertToNkp() {
  const {
    employeeId: employeeId,
    totalAmount: grandTotal,
    cashAdvance,
    id: expenseClaimId,
    companyId,
    ExpenseClaimItem: PaymentAuthorizationItem,
    balance,
  } = detail.value;

  const user = users.value.find((u) => u.id == employeeId);

  claimData.value = {
    employeeId,
    paymentType: "EMPLOYEE",
    bankId: user.bankId,
    bankAccount: user.bankAccount,
    currency: user.currency,
    grandTotal,
    cashAdvance,
    finalPayment: -balance,
    expenseClaimId,
    companyId,
    PaymentAuthorizationItem: PaymentAuthorizationItem.map((item) => {
      return {
        date: item.date,
        description: item.description,
        amount: item.amount,
        currency: user.currency,
      };
    }),
  };

  closeDetail();
  showClaimForm.value = true;
}

function handlePrint(id) {
  const url = `${config.public.apiBase}/api/expense-claims/print/${id}`;
  window.open(url, "_blank");
}
</script>

<style scoped>
.my-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 16px;
}
</style>
