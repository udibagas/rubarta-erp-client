<template>
  <el-dialog v-model="showDetail" width="800">
    <template #header="{ close, titleId, titleClass }">
      <div class="my-header">
        <div :id="titleId" :class="titleClass">
          PAYMENT AUTHORIZATION DETAIL
        </div>
        <el-tag :type="colors[detail.status]" effect="dark">
          {{ detail.status }}
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
        {{ formatDate(detail.date) }}
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

    <div
      v-if="detail.PaymentAuthorizationApproval?.length"
      style="
        display: flex;
        align-items: stretch;
        justify-content: space-evenly;
        text-align: center;
        border: 1px solid #ddd;
        padding: 20px;
        border-radius: 5px;
      "
    >
      <div v-for="approval in detail.PaymentAuthorizationApproval">
        <strong>{{ actions[approval.approvalActionType] }}</strong>
        <div style="height: 60px; line-height: 60px">
          <el-button
            type="danger"
            :icon="Stamp"
            @click="approve(approval.id)"
            v-if="
              user.id == approval.userId && approval.approvalStatus === null
            "
          >
            APPROVE
          </el-button>

          <div v-else>
            <img
              v-if="approval.approvalStatus && approval.User.signatureSpeciment"
              :src="`${config.public.apiBase}/${approval.User.signatureSpeciment.filePath}`"
              alt=""
              style="height: 60px"
            />
            <el-tag
              v-else
              :type="approval.approvalStatus === null ? 'info' : 'success'"
              effect="dark"
            >
              {{ approval.approvalStatus === null ? "PENDING" : "APPROVED" }}
            </el-tag>
          </div>
        </div>

        <div class="strong">
          {{ approval.User?.name }}
        </div>
        <div>
          {{
            approval.approvalStatus ? formatDateTime(approval.updatedAt) : "-"
          }}
        </div>
      </div>
    </div>

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="closeDetail">
        CLOSE
      </el-button>

      <el-button
        v-if="detail.status == 'DRAFT'"
        :icon="SuccessFilled"
        type="warning"
        @click="edit(detail)"
      >
        EDIT
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {
  SuccessFilled,
  CircleCloseFilled,
  Stamp,
} from "@element-plus/icons-vue";
import { showDetail, detail, closeDetail } from "~/stores/detail";
import { colors } from "~/constants/colors";
import { openForm } from "~/stores/form";

const { user } = useSanctumAuth();
const request = useRequest();
const queryClient = useQueryClient();
const config = useRuntimeConfig();

const actions = {
  APPROVAL: "APPROVED BY",
  VERIFICATION: "VERIFIED BY",
  AUTHORIZATION: "AUTHORIZED BY",
};

async function approve(id) {
  try {
    await ElMessageBox.confirm(
      "Anda yakin akan melakukan persetujuan?",
      "Warning",
      {
        type: "warning",
      }
    );

    const response = await request(
      `/api/payment-authorizations/approve/${detail.value.id}`,
      { method: "POST" }
    );

    detail.value = response;
    queryClient.invalidateQueries({
      queryKey: ["payment-authorizations"],
    });
  } catch (error) {
    console.log(error);
  }
}

function edit(data) {
  closeDetail();
  openForm(data);
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
