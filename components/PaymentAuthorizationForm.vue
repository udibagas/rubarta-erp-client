<template>
  <el-dialog
    v-model="show"
    width="900"
    title="PAYMENT AUTHORIZATION"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Company" :error="errors.companyId">
        <el-select v-model="form.companyId" placeholder="Company" disabled>
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
        <el-select
          v-model="form.employeeId"
          placeholder="Employee"
          @change="updateBank"
        >
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
        <el-select v-model="form.bankId" placeholder="Bank" style="width: 100%">
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
        <el-input v-model="form.bankAccount" placeholder="Bank Account" />
      </el-form-item>

      <el-form-item label="Description" :error="errors.description">
        <el-input
          type="textarea"
          :rows="3"
          v-model="form.description"
          placeholder="Description"
        />
      </el-form-item>
    </el-form>

    <el-table :data="form.PaymentAuthorizationItem">
      <el-table-column type="index" label="#"></el-table-column>

      <el-table-column label="DATE" width="170">
        <template #default="{ row }">
          <el-date-picker
            v-model="row.date"
            type="date"
            placeholder="Date"
            :disabled-date="disabledDate"
            format="DD-MMM-YYYY"
            style="width: 140px"
          />
        </template>
      </el-table-column>

      <el-table-column label="DESCRIPTION">
        <template #default="{ row }">
          <el-input
            type="textarea"
            v-model="row.description"
            placeholder="Description"
            :rows="1"
            clearable
          />
        </template>
      </el-table-column>

      <el-table-column label="AMOUNT" width="150">
        <template #default="{ row }">
          <el-input type="number" v-model="row.amount" placeholder="Amount">
          </el-input>
        </template>
      </el-table-column>

      <el-table-column width="120" align="right">
        <template #default="{ row }">
          <strong>{{ toRupiah(row.amount) }}</strong>
        </template>
      </el-table-column>

      <el-table-column width="50" header-align="center" align="center">
        <template #header>
          <el-button
            link
            :icon="Plus"
            type="success"
            @click="addItem"
          ></el-button>
        </template>
        <template #default="{ row, $index }">
          <el-button
            link
            :icon="Delete"
            type="danger"
            @click="removeItem($index, row.id)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <table class="table">
      <tbody>
        <tr>
          <td>GRAND TOTAL/GROSS AMOUNT</td>
          <td class="text-right">
            <strong>{{ toRupiah(amount) }}</strong>
          </td>
        </tr>

        <tr>
          <td>DEDUCTION</td>
          <td class="text-right">
            <el-input
              type="number"
              v-model="form.deduction"
              placeholder="Deduction"
              style="width: 120px; margin-right: 10px"
            />
            <strong>{{ toRupiah(form.deduction) }}</strong>
          </td>
        </tr>

        <tr>
          <td>NET AMOUNT</td>
          <td class="text-right">
            <strong>{{ toRupiah(netAmount) }}</strong>
          </td>
        </tr>

        <tr>
          <td>TERBILANG</td>
          <td class="text-right">
            <strong>{{ terbilang(netAmount).toUpperCase() }} RUPIAH</strong>
          </td>
        </tr>
      </tbody>
    </table>

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="closeForm">
        CLOSE
      </el-button>
      <el-button
        :icon="SuccessFilled"
        type="info"
        @click="saveWithStatus('DRAFT')"
      >
        SAVE AS DRAFT
      </el-button>

      <el-button
        :icon="SuccessFilled"
        type="success"
        @click="saveWithStatus('SUBMITTED')"
      >
        SUBMIT
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {
  SuccessFilled,
  CircleCloseFilled,
  Delete,
  Plus,
} from "@element-plus/icons-vue";

const newRow = {
  date: undefined,
  description: undefined,
  amount: undefined,
};

const url = "/api/payment-authorizations";
const request = useRequest();

const { errors, form, show, closeForm, saveMutation } = useCrud({
  url,
  queryKey: "payment-authorizations",
});
const { mutate: save } = saveMutation();

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

const disabledDate = (time) => {
  return time.getTime() > Date.now();
};

const updateBank = (id) => {
  const user = users.find((u) => u.id == id);
  if (user) {
    form.value.bankId = user.bankId;
    form.value.bankAccount = user.bankAccount;
  }
};

const amount = computed(() => {
  return (
    form.value.PaymentAuthorizationItem?.reduce(
      (total, current) => total + Number(current.amount),
      0
    ) ?? 0
  );
});

const netAmount = computed(() => {
  return amount.value - Number(form.value.deduction);
});

function saveWithStatus(status) {
  form.value.grossAmount = amount;
  form.value.netAmount = netAmount;
  form.value.deduction = Number(form.value.deduction);

  form.value.PaymentAuthorizationItem.forEach((e) => {
    e.amount = Number(e.amount);
  });

  form.value.amount = amount;
  form.value.status = status;

  save(form.value);
}

async function removeItem(index, id) {
  if (id) {
    await request(`${url}/${form.value.id}/${id}`, {
      method: "DELETE",
    });
  }

  form.value.PaymentAuthorizationItem.splice(index, 1);
}

function addItem() {
  form.value.PaymentAuthorizationItem.push({ ...newRow });
}
</script>
