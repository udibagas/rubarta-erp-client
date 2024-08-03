<template>
  <el-dialog v-model="showDetail" width="800">
    <template #header="{ titleId, titleClass }">
      <div class="my-header">
        <div :id="titleId" :class="titleClass">
          PAYMENT AUTHORIZATION DETAIL
        </div>
        <el-tag :type="colors[detail.status]" effect="dark">
          {{ detail.status.replace("_", " ") }}
        </el-tag>
      </div>
    </template>

    <el-descriptions :border="true" :column="2" direction="horizontal">
      <el-descriptions-item label="Number">
        <strong> {{ detail.number }}</strong>
      </el-descriptions-item>

      <el-descriptions-item label="Employee">
        {{ detail.Employee?.name }}
      </el-descriptions-item>

      <el-descriptions-item label="Date">
        {{ formatDateLong(detail.date) }}
      </el-descriptions-item>

      <el-descriptions-item label="Bank">
        {{ detail.Bank?.name }}
      </el-descriptions-item>

      <el-descriptions-item label="Company">
        {{ detail.Company?.name }}
      </el-descriptions-item>

      <el-descriptions-item label="Bank Account">
        {{ detail.bankAccount }}
      </el-descriptions-item>

      <el-descriptions-item label="Requester">
        {{ detail.Requester?.name }}
      </el-descriptions-item>

      <el-descriptions-item label="Description">
        {{ detail.description }}
      </el-descriptions-item>
    </el-descriptions>

    <br />

    <el-table :data="detail.PaymentAuthorizationItem">
      <el-table-column type="index" label="#"></el-table-column>

      <el-table-column label="DATE" width="120">
        <template #default="{ row }">
          {{ formatDate(row.date) }}
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

    <table class="table">
      <tbody>
        <tr>
          <td>GRAND TOTAL/GROSS AMOUNT</td>
          <td class="text-right">
            <strong>{{ toRupiah(detail.amount) }}</strong>
          </td>
        </tr>

        <tr>
          <td>DEDUCTION</td>
          <td class="text-right">
            <strong>{{ toRupiah(detail.deduction) }}</strong>
          </td>
        </tr>

        <tr>
          <td>NET AMOUNT</td>
          <td class="text-right">
            <strong>{{ toRupiah(detail.netAmount) }}</strong>
          </td>
        </tr>

        <tr>
          <td>TERBILANG</td>
          <td class="text-right">
            <strong>
              {{ terbilang(detail.netAmount).toUpperCase() }} RUPIAH
            </strong>
          </td>
        </tr>
      </tbody>
    </table>

    <br />

    <ApprovalDetail
      v-if="detail.PaymentAuthorizationApproval.length > 0"
      approve-url="/api/payment-authorizations/approve"
      query-key="payment-authorizations"
      :approvals="detail.PaymentAuthorizationApproval"
      :request-id="detail.id"
      @reload="reload"
    />

    <template #footer>
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
        :icon="Delete"
        type="danger"
        @click="handleRemove(detail.id, closeDetailAndRemove)"
      >
        DELETE
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
import { SuccessFilled, Delete } from "@element-plus/icons-vue";
import { showDetail, detail, closeDetail } from "~/stores/detail";
import { colors } from "~/constants/colors";

const { request, edit, handleRemove, removeMutation, refreshData } = useCrud({
  url: "/api/payment-authorizations",
  queryKey: "payment-authorizations",
});

const { mutate: remove } = removeMutation();

function reload() {
  request(`/api/payment-authorizations/${detail.value.id}`).then((res) => {
    detail.value = res;
  });
}

function openForm(id) {
  closeDetail();
  edit(id);
}

function closeDetailAndRemove(id) {
  closeDetail();
  remove(id);
}

async function submit(id) {
  try {
    await ElMessageBox.confirm(
      "Anda yakin akan mengajukan permintaan ini ini?",
      "Warning",
      {
        type: "warning",
      }
    );

    await request(`/api/payment-authorizations/submit/${id}`, {
      method: "POST",
    });
    refreshData(); // refresh data on table
    reload(); // reload detail data
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
