<template>
  <el-dialog
    :model-value="show"
    width="700"
    title="NOTA KUASA PEMBAYARAN"
    :before-close="() => emit('close')"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Company" :error="errors.companyId">
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

      <el-form-item label="Employee" :error="errors.employeeId">
        <el-select v-model="data.employeeId" placeholder="Employee" disabled>
          <el-option
            v-for="(el, i) in users"
            :value="el.id"
            :label="el.name"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Bank" :error="errors.bankId">
        <el-select v-model="data.bankId" placeholder="Bank" disabled>
          <el-option
            v-for="(el, i) in banks"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Bank Account" :error="errors.bankAccount">
        <el-input
          v-model="data.bankAccount"
          placeholder="Bank Account"
          disabled
        />
      </el-form-item>

      <el-form-item label="Description" :error="errors.description">
        <el-input
          type="textarea"
          :rows="3"
          v-model="description"
          placeholder="Description"
        />
      </el-form-item>
    </el-form>

    <el-table :data="data.PaymentAuthorizationItem">
      <el-table-column type="index" label="#"></el-table-column>

      <el-table-column label="DATE" width="120">
        <template #default="{ row }">
          {{ formatDate(row.date) }}
        </template>
      </el-table-column>

      <el-table-column label="DESCRIPTION" prop="description" />

      <el-table-column label="AMOUNT" width="120" align="right">
        <template #default="{ row }">
          <strong>{{ toRupiah(row.amount) }}</strong>
        </template>
      </el-table-column>
    </el-table>

    <table class="table">
      <tbody>
        <tr>
          <td>GRAND TOTAL</td>
          <td class="text-right">
            <strong>{{ toRupiah(data.grandTotal) }}</strong>
          </td>
        </tr>

        <tr>
          <td>CASH ADVANCE</td>
          <td class="text-right">
            <strong>{{ toRupiah(data.cashAdvance) }}</strong>
          </td>
        </tr>

        <tr>
          <td>{{ data.finalPayment > 0 ? "CLAIM" : "REFUND" }}</td>
          <td class="text-right">
            <strong>
              <el-text :type="data.finalPayment > 0 ? 'success' : 'danger'">
                {{ toRupiah(data.finalPayment) }}
              </el-text>
            </strong>
          </td>
        </tr>

        <tr>
          <td>TERBILANG</td>
          <td class="text-right">
            <strong>
              {{ terbilang(data.finalPayment).toUpperCase() }}
            </strong>
          </td>
        </tr>
      </tbody>
    </table>

    <template #footer>
      <el-button :icon="ElIconCircleCloseFilled" @click="emit('close')">
        CLOSE
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
const request = useRequest();
const queryClient = useQueryClient();
const { show, data: sourceData } = defineProps(["show", "data"]);
const emit = defineEmits(["close"]);
const errors = ref({});
const deduction = ref(0);
const description = ref("");

const { data: companies } = useQuery({
  queryKey: ["companies"],
  queryFn: () => request("/api/companies"),
});

const { data: banks } = useQuery({
  queryKey: ["banks"],
  queryFn: () => request("/api/banks"),
});

const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: () => request("/api/users"),
});

async function submit(data) {
  try {
    await ElMessageBox.confirm(
      "Pastikan Anda telah mengisi for dengan benar!",
      "Warning",
      {
        type: "warning",
      }
    );
  } catch (error) {
    return;
  }

  const body = {
    ...data,
    description: description.value,
    deduction: deduction.value,
    netAmount: data.amount - deduction.value,
    status: "SUBMITTED",
  };

  request(`/api/payment-authorizations`, { method: "POST", body })
    .then((res) => {
      emit("close");
      queryClient.invalidateQueries({ queryKey: ["expense-claims"] });
      ElMessageBox.alert(
        `Permintaan Anda telah diajukan dan menunggu persetujuan. 
        Silakan ke menu 'Payment Authorizations' untuk melihat status pengajuan.`,
        "SUCCESS",
        {
          confirmButtonText: "OK",
        }
      );
    })
    .catch((err) => {
      errors.value = parseError(err);
    });
}
</script>
