<template>
  <el-dialog v-model="showDetail" width="700">
    <template #header="{ close, titleId, titleClass }">
      <div class="my-header">
        <div :id="titleId" :class="titleClass">EXPENSE CLAIM DETAIL</div>
        <el-tag :type="colors[detail.status]" effect="dark">
          {{ detail.status.replace("_", " ") }}
        </el-tag>
      </div>
    </template>

    <el-descriptions :border="true" :column="1" direction="horizontal">
      <el-descriptions-item label="Number">
        <strong> {{ detail.number }}</strong>
      </el-descriptions-item>

      <el-descriptions-item label="Date">
        {{ formatDateLong(detail.date) }}
      </el-descriptions-item>

      <el-descriptions-item label="Employee">
        {{ detail.User?.name }}
      </el-descriptions-item>

      <el-descriptions-item label="Company">
        {{ detail.Company?.name }}
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

      <el-table-column label="TYPE" width="100">
        <template #default="{ row }">
          {{ row.ExpenseType?.name }}
        </template>
      </el-table-column>

      <el-table-column label="DESCRIPTION" prop="description">
      </el-table-column>

      <el-table-column label="AMOUNT" width="120" align="right">
        <template #default="{ row }">
          <strong>{{ toRupiah(row.amount) }}</strong>
        </template>
      </el-table-column>
    </el-table>

    <el-table :data="summary">
      <el-table-column
        prop="expenseType"
        label="Expense Type"
      ></el-table-column>
      <el-table-column label="Amount" align="right" header-align="right">
        <template #default="{ row }">
          <strong>{{ toRupiah(row.amount) }}</strong>
        </template>
      </el-table-column>
    </el-table>

    <table class="table">
      <tbody>
        <tr>
          <td class="strong">TOTAL EXPENSE</td>
          <td class="text-right">
            <strong>{{ toRupiah(totalAmount) }}</strong>
          </td>
        </tr>

        <tr>
          <td class="strong">CASH ADVANCE</td>
          <td class="text-right">
            <strong>{{ toRupiah(detail.cashAdvance) }}</strong>
          </td>
        </tr>

        <tr>
          <td class="strong">{{ claim > 0 ? "CLAIM" : "REFUND" }}</td>
          <td class="text-right">
            <strong :class="claim > 0 ? 'text-success' : 'text-danger'">
              {{ toRupiah(claim) }}
            </strong>
          </td>
        </tr>
      </tbody>
    </table>

    <br />

    <div v-if="srcList.length > 0" class="mb-2">
      <el-image
        v-for="(url, index) in srcList"
        style="width: 100px; height: 100px; margin-right: 5px"
        :src="srcList[index]"
        :zoom-rate="1.2"
        :max-scale="7"
        :min-scale="0.2"
        :preview-src-list="srcList"
        fit="contain"
        :initial-index="index"
      />
    </div>

    <ApprovalDetail
      v-if="detail.ExpenseClaimApproval.length > 0"
      approve-url="/api/expense-claims/approve"
      query-key="expense-claims"
      :approvals="detail.ExpenseClaimApproval"
      :request-id="detail.id"
      @reload="reload"
    />

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="closeDetail">
        CLOSE
      </el-button>

      <el-button
        v-if="detail.status == 'DRAFT'"
        :icon="SuccessFilled"
        type="warning"
        @click="openForm(detail.id)"
      >
        EDIT
      </el-button>

      <el-button
        v-if="detail.status == 'DRAFT'"
        :icon="SuccessFilled"
        type="success"
        @click="submit(detail.id)"
      >
        SUBMIT
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { SuccessFilled, CircleCloseFilled } from "@element-plus/icons-vue";
import { showDetail, detail, closeDetail } from "~/stores/detail";
import { colors } from "~/constants/colors";

const config = useRuntimeConfig();
const queryClient = useQueryClient();

const { request, edit } = useCrud({
  url: "/api/expense-claims",
  queryKey: "expense-claims",
});

function openForm(id) {
  closeDetail();
  edit(id);
}

const totalAmount = computed(() => {
  return (
    detail.value.ExpenseClaimItem?.reduce(
      (total, current) => total + Number(current.amount),
      0
    ) ?? 0
  );
});

const claim = computed(() => {
  return totalAmount.value - Number(detail.value.cashAdvance);
});

const summary = computed(() => {
  const summaryObj = {};
  detail.value.ExpenseClaimItem?.forEach((item) => {
    if (!summaryObj[item.ExpenseType.name])
      summaryObj[item.ExpenseType.name] = 0;
    summaryObj[item.ExpenseType.name] += item.amount;
  });

  const summaryArr = Object.keys(summaryObj).map((k) => {
    return {
      expenseType: k,
      amount: summaryObj[k],
    };
  });

  return summaryArr;
});

const srcList = computed(() => {
  return (
    detail.value.ExpenseClaimAttachment?.map(
      (el) => `${config.public.apiBase}/${el.filePath}`
    ) ?? []
  );
});

function reload() {
  request(`/api/expense-claims/${detail.value.id}`).then(
    (res) => (detail.value = res)
  );
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
    queryClient.invalidateQueries({ queryKey: ["expense-claims"] });
    closeDetail();
  } catch (error) {
    return;
  }
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
