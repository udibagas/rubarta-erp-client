<template>
  <el-dialog v-if="detail.id" v-model="showDetail" width="750" draggable>
    <template #header="{ titleId, titleClass }">
      <div class="my-header">
        <div :id="titleId" :class="titleClass" style="font-weight: bold">
          NKP #{{ detail.number }}
        </div>
        <StatusTag :status="detail.status" />
      </div>
    </template>

    <el-descriptions :border="true" :column="1" direction="horizontal">
      <el-descriptions-item label="Company">
        {{ detail.Company?.name }}
      </el-descriptions-item>

      <el-descriptions-item label="Parent" v-if="detail.Parent">
        {{ detail.Parent?.number ?? "- " }}
      </el-descriptions-item>

      <el-descriptions-item label="Date">
        {{ formatDateLong(detail.date) }}
      </el-descriptions-item>

      <el-descriptions-item label="Requester">
        {{ detail.Requester?.name }}
      </el-descriptions-item>

      <el-descriptions-item label="Type">
        {{ detail.paymentType }} / {{ detail.nkpType?.replace("_", " ") }}
      </el-descriptions-item>

      <el-descriptions-item
        :label="detail.paymentType == 'VENDOR' ? 'Vendor' : 'Employee'"
      >
        {{
          detail.paymentType == "VENDOR"
            ? detail.Supplier.name
            : detail.Employee.name
        }}
      </el-descriptions-item>

      <el-descriptions-item label="Bank">
        {{ detail.Bank?.name }}
      </el-descriptions-item>

      <el-descriptions-item label="Bank Account">
        {{ detail.bankAccount }} ({{ detail.currency }})
      </el-descriptions-item>

      <el-descriptions-item
        label="Invoice Number"
        v-if="detail.paymentType == 'VENDOR'"
      >
        {{ detail.invoiceNumber }}
      </el-descriptions-item>

      <el-descriptions-item
        label="Total Amount"
        v-if="detail.paymentType == 'VENDOR'"
      >
        {{ toCurrency(detail.totalAmount, detail.currency) }}
      </el-descriptions-item>

      <el-descriptions-item label="Description">
        {{ detail.description }}
      </el-descriptions-item>

      <el-descriptions-item label="Bank Ref No">
        <el-text type="success">{{ detail.bankRefNo }}</el-text>
      </el-descriptions-item>
    </el-descriptions>

    <br />

    <el-table :data="detail.NkpItem">
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
            <strong>{{ toDecimal(detail.grandTotal) }}</strong>
          </td>
          <td class="text-center" style="width: 60px">
            {{ detail.currency }}
          </td>
        </tr>

        <tr v-if="detail.paymentType == 'VENDOR'">
          <td>TAX</td>
          <td class="text-right">
            <strong>{{ toDecimal(detail.tax) }}</strong>
          </td>
          <td class="text-center">{{ detail.currency }}</td>
        </tr>

        <tr v-if="detail.paymentType == 'VENDOR'">
          <td>DEDUCTION</td>
          <td class="text-right">
            <strong>{{ toDecimal(detail.deduction) }}</strong>
          </td>
          <td class="text-center">{{ detail.currency }}</td>
        </tr>

        <tr v-if="detail.paymentType == 'VENDOR'">
          <td>NET AMOUNT</td>
          <td class="text-right">
            <strong>{{ toDecimal(detail.netAmount) }}</strong>
          </td>
          <td class="text-center">{{ detail.currency }}</td>
        </tr>

        <tr
          v-if="
            detail.paymentType == 'VENDOR' && detail.nkpType == 'SETTLEMENT'
          "
        >
          <td>DOWN PAYMENT</td>
          <td class="text-right">
            <strong>{{ toDecimal(detail.downPayment) }}</strong>
          </td>
          <td class="text-center">{{ detail.currency }}</td>
        </tr>

        <tr
          v-if="detail.paymentType == 'EMPLOYEE' && detail.cashAdvanceBalance"
        >
          <td>CASH ADVANCE BALANCE</td>
          <td class="text-right">
            <strong>{{ toDecimal(detail.cashAdvanceBalance) }}</strong>
          </td>
          <td class="text-center">{{ detail.currency }}</td>
        </tr>

        <tr v-if="detail.paymentType == 'EMPLOYEE' && detail.parentId">
          <td>
            KEMBALI KE {{ detail.finalPayment > 0 ? "KARYAWAN" : "PERUSAHAAN" }}
          </td>
          <td class="text-right">
            <el-text :type="detail.finalPayment > 0 ? 'success' : 'danger'">
              <strong>{{ toDecimal(Math.abs(detail.finalPayment)) }}</strong>
            </el-text>
          </td>
          <td class="text-center">{{ detail.currency }}</td>
        </tr>

        <tr v-if="detail.nkpType !== 'DECLARATION'">
          <td>TRANSFER TO {{ detail.paymentType }}</td>
          <td class="text-right">
            <strong>{{ toDecimal(detail.finalPayment) }}</strong>
          </td>
          <td class="text-center">{{ detail.currency }}</td>
        </tr>

        <tr>
          <td>TERBILANG</td>
          <td>
            <strong>
              {{ terbilang(detail.finalPayment).toUpperCase() }}
            </strong>
          </td>
          <td class="text-center">{{ detail.currency }}</td>
        </tr>
      </tbody>
    </table>

    <h1 v-if="detail.NkpAttachment.length">Attachment</h1>
    <ul style="list-style: none; padding-left: 0">
      <li
        v-for="(attachment, i) in detail.NkpAttachment"
        :key="i"
        style="margin-bottom: 5px"
      >
        <a
          :href="`${config.public.apiBase}/${attachment.filePath}`"
          target="_blank"
        >
          <el-icon>
            <ElIconDocument />
          </el-icon>
          {{ attachment.fileName }}
        </a>
      </li>
    </ul>

    <br />

    <ApprovalDetail
      v-if="detail.NkpApproval.length > 0"
      approve-url="/api/nkp/approve"
      query-key="nkp"
      :approvals="detail.NkpApproval"
      :request-id="detail.id"
      @reload="reload"
    />

    <template #footer>
      <el-button
        v-if="allowAction"
        :icon="ElIconSuccessFilled"
        type="warning"
        @click="
          () => {
            const { id } = detail;
            closeDetail();
            edit(id);
          }
        "
      >
        EDIT
      </el-button>

      <el-button
        v-if="
          detail.status == 'CLOSED' && detail.Parent == null && !detail.Child
        "
        :icon="ElIconDocument"
        type="warning"
        @click="declare"
      >
        {{ detail.paymentType == "EMPLOYEE" ? "DECLARE" : "SETTLEMENT" }}
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
        @click="showCloseForm = true"
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

  <NkpCloseForm
    :show="showCloseForm"
    :id="detail.id"
    @close="showCloseForm = false"
    @refresh="
      () => {
        refreshData();
        reload();
      }
    "
  />
</template>

<script setup>
import { showDetail, detail, closeDetail } from "~/stores/detail";
const { user } = useSanctumAuth();
const config = useRuntimeConfig();
const showCloseForm = ref(false);

const allowClose = computed(() => {
  // TODO: baca role user untuk otorisasi
  return detail.value.status == "FULLY_APPROVED";
});

const allowAction = computed(() => {
  return (
    detail.value.status == "DRAFT" && user.value.id == detail.value.requesterId
  );
});

const { request, edit, handleRemove, removeMutation, refreshData, openForm } =
  useCrud({ url: "/api/nkp", queryKey: "nkp" });

const { mutate: remove } = removeMutation();

function reload() {
  request(`/api/nkp/${detail.value.id}`).then((res) => {
    detail.value = res;
  });
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
      { type: "warning" }
    );

    await request(`/api/nkp/submit/${id}`, { method: "POST" });
    refreshData(); // refresh data on table
    reload(); // reload detail data
  } catch (error) {
    return;
  }
}

function declare() {
  const data = { ...detail.value };
  closeDetail();

  const nkpType = data.paymentType == "EMPLOYEE" ? "DECLARATION" : "SETTLEMENT";
  const description = `${
    data.paymentType == "EMPLOYEE" ? "DEKLARASI" : "PELUNASAN"
  } NKP NO. ${data.number}`;
  const items =
    nkpType == "SETTLEMENT"
      ? [
          {
            date: new Date(),
            description: "Pelunasan",
            amount: data.totalAmount,
          },
        ]
      : [{ date: "", description: "", amount: 0 }];

  openForm({
    ...data,
    id: undefined, // biar ga jadi edit
    parentId: data.id,
    Parent: data,
    nkpType,
    description,
    NkpAttachment: [],
    cashAdvanceBalance: data.paymentType == "EMPLOYEE" ? data.grandTotal : 0,
    downPayment: data.paymentType == "VENDOR" ? data.finalPayment : 0,
    NkpItem: items,
    deduction: 0,
    tax: 0,
  });
}

function handlePrint(id) {
  const url = `${config.public.apiBase}/api/nkp/print/${id}`;
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
