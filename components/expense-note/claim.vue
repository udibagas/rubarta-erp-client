<template>
  <el-dialog :model-value="show" width="800" draggable title="CLAIM EXPENSE">
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
          <strong>{{ toRupiah(row.amount) }}</strong>
        </template>
      </el-table-column>
    </el-table>

    <ExpenseClaimSummary :items="data.ExpenseClaimItem" />

    <table class="table">
      <tbody>
        <tr>
          <td class="strong">TOTAL EXPENSE</td>
          <td class="text-right">
            <strong>{{ toRupiah(data.totalAmount) }}</strong>
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
            <strong>{{ toRupiah(data.cashAdvance) }}</strong>
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

    <template #footer>
      <el-button :icon="SuccessFilled" type="success" @click="submit(data)">
        SUBMIT
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { SuccessFilled, Delete } from "@element-plus/icons-vue";
const { show, data } = defineProps(["show", "data"]);
const emit = defineEmits(["close"]);
const { user } = useSanctumAuth();
const config = useRuntimeConfig();
const request = useRequest();

async function submit(data) {
  try {
    await ElMessageBox.confirm(
      "Anda yakin akan mengajukan klaim ini?",
      "Warning",
      {
        type: "warning",
      }
    );

    await request(`/api/expense-claims/`, { method: "POST", body: data.value });
    await request(`/api/expense-notes`, { method: "DELETE" });
    emit("close");
  } catch (error) {
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

const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: () => request("/api/users"),
});

const claim = computed(() => {
  return data.value?.totalAmount - data.value?.cashAdvance;
});

// watch(
//   () => data.value?.cashAdvance,
//   (value) => {
//     data.value.claim = data.value?.totalAmount - value;
//   }
// );
</script>
