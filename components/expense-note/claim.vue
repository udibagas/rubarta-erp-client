<template>
  <el-dialog
    draggable
    title="CLAIM EXPENSE"
    :model-value="show"
    :before-close="() => emit('close')"
    width="800"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Company">
        <el-select v-model="data.companyId" placeholder="Company" disabled>
          <el-option
            v-for="(el, i) in companies"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Department">
        <el-select v-model="data.departmentId" placeholder="Department">
          <el-option
            v-for="(el, i) in departments"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <el-table :data="data.ExpenseClaimItem">
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
          <strong>{{ toCurrency(row.amount) }}</strong>
        </template>
      </el-table-column>
    </el-table>

    <NkpDeclarationSummary :items="data.ExpenseClaimItem" />

    <table class="table">
      <tbody>
        <tr>
          <td class="strong">TOTAL EXPENSE</td>
          <td class="text-right">
            <strong>{{ toCurrency(data.totalAmount) }}</strong>
          </td>
        </tr>

        <tr>
          <td class="strong">CASH ADVANCE</td>
          <td class="text-right">
            <el-input
              type="number"
              v-model="data.cashAdvance"
              placeholder="Cash Advance"
              style="width: 150px; margin-right: 10px"
            />
            <strong>{{ toCurrency(data.cashAdvance) }}</strong>
          </td>
        </tr>

        <tr>
          <td class="strong">
            {{ data.totalAmount - data.cashAdvance > 0 ? "CLAIM" : "REFUND" }}
          </td>
          <td class="text-right">
            <strong>
              <el-text
                :type="
                  data.totalAmount - data.cashAdvance > 0 ? 'success' : 'danger'
                "
              >
                {{ toCurrency(data.totalAmount - data.cashAdvance) }}
              </el-text>
            </strong>
          </td>
        </tr>
      </tbody>
    </table>

    <template #footer>
      <el-button :icon="ElIconCircleCloseFilled" @click="emit('close')">
        CANCEL
      </el-button>
      <el-button
        :icon="ElIconSuccessFilled"
        type="success"
        @click="submit(data)"
      >
        SUBMIT
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useQueryClient, useQuery } from "@tanstack/vue-query";
const { show, data } = defineProps(["show", "data"]);
const emit = defineEmits(["close"]);
const request = useRequest();
const queryClient = useQueryClient();

async function submit(data) {
  try {
    await ElMessageBox.confirm(
      "Anda yakin akan mengajukan klaim ini?. Pastikan data yang Anda input sudah benar!.",
      "Perhatian",
      {
        type: "warning",
      }
    );

    // clone object
    const body = JSON.parse(JSON.stringify(data));
    body.cashAdvance = Number(body.cashAdvance);
    body.claim = body.totalAmount - body.cashAdvance;
    body.ExpenseClaimAttachment = body.ExpenseClaimItem.map((item) => {
      const { id, ...attachment } = item.attachment;
      return attachment;
    });

    body.ExpenseClaimItem.forEach((el) => {
      delete el.id;
      delete el.attachment;
      delete el.ExpenseType;
    });

    await request(`/api/expense-claims/`, { method: "POST", body });
    await request(`/api/expense-notes`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["expense-notes"] });
    emit("close");

    ElMessageBox.alert(
      "Klaim anda telah diajukan dan menunggu persetujuan. Silakan ke menu 'Expense Claim' untuk melihat status pengajuan.",
      "SUCCESS",
      {
        confirmButtonText: "OK",
      }
    );
  } catch (error) {
    console.log(error);
    return;
  }
}

const { data: departments } = useQuery({
  queryKey: ["departments"],
  queryFn: () => request("/api/departments"),
});

const { data: companies } = useQuery({
  queryKey: ["companies"],
  queryFn: () => request("/api/companies"),
});
</script>
