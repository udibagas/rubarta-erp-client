<template>
  <el-dialog v-if="detail.id" v-model="showDetail" width="700" draggable>
    <template #header="{ titleId, titleClass }">
      <div class="my-header">
        <div :id="titleId" :class="titleClass" style="font-weight: bold">
          NKP #{{ detail.number }}
        </div>
        <StatusTag :status="detail.status" />
      </div>
    </template>

    <el-descriptions :border="true" :column="2" direction="horizontal">
      <el-descriptions-item label="Date">
        {{ formatDateLong(detail.date) }}
      </el-descriptions-item>

      <el-descriptions-item
        v-if="detail.paymentType == 'EMPLOYEE'"
        label="Employee"
      >
        {{ detail.Employee?.name }}
      </el-descriptions-item>

      <el-descriptions-item
        v-if="detail.paymentType == 'VENDOR'"
        label="Vendor"
      >
        {{ detail.Vendor?.name }}
      </el-descriptions-item>

      <el-descriptions-item label="Company">
        {{ detail.Company?.name }}
      </el-descriptions-item>

      <el-descriptions-item label="Bank">
        {{ detail.Bank?.name }}
      </el-descriptions-item>

      <el-descriptions-item label="Requester">
        {{ detail.Requester?.name }}
      </el-descriptions-item>

      <el-descriptions-item label="Bank Account">
        {{ detail.bankAccount }}
      </el-descriptions-item>

      <el-descriptions-item label="Type">
        {{ detail.paymentType }}
      </el-descriptions-item>

      <el-descriptions-item label="Currency">
        {{ detail.currency }}
      </el-descriptions-item>

      <el-descriptions-item label="Description">
        {{ detail.description }}
      </el-descriptions-item>
    </el-descriptions>

    <br />

    <el-table :data="detail.PaymentAuthorizationItem">
      <el-table-column type="index" label="#" />

      <el-table-column label="DATE" width="120">
        <template #default="{ row }">
          {{ formatDate(row.date) }}
        </template>
      </el-table-column>

      <el-table-column label="DESCRIPTION" prop="description" />

      <el-table-column label="AMOUNT" width="120" align="right">
        <template #default="{ row }">
          <strong>{{ toDecimal(row.amount) }}</strong>
        </template>
      </el-table-column>

      <el-table-column
        label="CURR"
        prop="currency"
        width="80"
        align="center"
        header-align="center"
      />
    </el-table>

    <table class="table">
      <tbody>
        <tr>
          <td>GRAND TOTAL</td>
          <td class="text-right">
            <strong>{{ toDecimal(detail.amount) }}</strong>
          </td>
          <td class="text-center" style="width: 60px">
            {{ detail.currency }}
          </td>
        </tr>

        <tr>
          <td>TAX</td>
          <td class="text-right">
            <strong>{{ toDecimal(detail.tax) }}</strong>
          </td>
          <td class="text-center">{{ detail.currency }}</td>
        </tr>

        <tr>
          <td>DEDUCTION</td>
          <td class="text-right">
            <strong>{{ toDecimal(detail.deduction) }}</strong>
          </td>
          <td class="text-center">{{ detail.currency }}</td>
        </tr>

        <tr>
          <td>NET AMOUNT</td>
          <td class="text-right">
            <strong>{{ toDecimal(detail.netAmount, detail.currency) }}</strong>
          </td>
          <td class="text-center">{{ detail.currency }}</td>
        </tr>

        <tr>
          <td>TERBILANG</td>
          <td>
            <strong>
              {{ terbilang(detail.netAmount, detail.currency).toUpperCase() }}
            </strong>
          </td>
          <td class="text-center">{{ detail.currency }}</td>
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
        v-if="allowClose"
        :icon="ElIconSuccessFilled"
        type="success"
        @click="close(detail.id)"
      >
        CLOSE
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
    </template>
  </el-dialog>
</template>

<script setup>
import { showDetail, detail, closeDetail } from "~/stores/detail";
const { user } = useSanctumAuth();

const allowClose = computed(() => {
  // TODO: baca role user untuk otorisasi
  return detail.value.status == "FULLY_APPROVED";
});

const allowAction = computed(() => {
  return (
    detail.value.status == "DRAFT" && user.value.id == detail.value.requesterId
  );
});

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
      "Anda yakin akan mengajukan permintaan ini?",
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

async function close(id) {
  try {
    const bankRefNo = await ElMessageBox.prompt(
      "Anda yakin akan menutup NKP ini?",
      "PERHATIAN",
      {
        inputPlaceholder: "Masukkan nomor referensi bank",
        confirmButtonClass: "success",
        confirmButtonText: "OK",
        cancelButtonText: "CANCEL",
        center: true,
        draggable: true,
        showClose: false,
        type: "warning",
        inputValidator: (value) => {
          if (value?.length < 5) return "Nomor referensi bank wajib diisi";
        },
      }
    );

    await request(`/api/payment-authorizations/close/${id}`, {
      method: "POST",
      body: { bankRefNo: bankRefNo.value },
    });
    refreshData(); // refresh data on table
    reload(); // reload detail data
  } catch (error) {
    ElMessage({
      type: "info",
      message: error.message || "Action cancelled",
    });
  }
}

function handlePrint(id) {
  //! TODO
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
