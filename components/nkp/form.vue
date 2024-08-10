<template>
  <el-dialog
    v-model="show"
    width="900"
    title="NOTA KUASA PEMBAYARAN"
    :close-on-click-modal="false"
    center
  >
    <br />
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

      <el-form-item label="Type" :error="errors.type">
        <el-radio-group v-model="form.paymentType" @change="resetBank">
          <el-radio value="EMPLOYEE">EMPLOYEE</el-radio>
          <el-radio value="VENDOR">VENDOR</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="form.paymentType == 'EMPLOYEE'"
        label="Employee"
        :error="errors.employeeId"
      >
        <el-select
          v-model="form.employeeId"
          placeholder="Employee"
          @change="updateBank"
          @clear="resetBank"
          default-first-option
          filterable
          clearable
        >
          <el-option
            v-for="(el, i) in users"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        v-if="form.paymentType == 'VENDOR'"
        label="Vendor"
        :error="errors.supplierId"
      >
        <el-select
          v-model="form.supplierId"
          placeholder="Vendor"
          @change="updateBank"
          @clear="resetBank"
          default-first-option
          filterable
          clearable
        >
          <el-option
            v-for="(el, i) in suppliers"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Bank" :error="errors.bankId">
        <el-select
          v-model="form.bankId"
          placeholder="Bank"
          default-first-option
          filterable
        >
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

      <el-form-item label="Currency" :error="errors.currency">
        <el-radio-group v-model="form.currency">
          <el-radio
            v-for="(currency, i) in currencies"
            :value="currency"
            :key="i"
          >
            {{ currency }}
          </el-radio>
        </el-radio-group>
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

      <el-table-column width="115" align="right">
        <template #default="{ row }">
          <strong>{{ toDecimal(row.amount) }}</strong>
        </template>
      </el-table-column>

      <el-table-column
        label="CURR"
        width="70"
        align="center"
        header-align="center"
      >
        <template #default="{ row }">
          {{ form.currency }}
        </template>
      </el-table-column>

      <el-table-column width="50" header-align="center" align="center">
        <template #header>
          <el-button
            link
            :icon="ElIconPlus"
            type="success"
            @click="addItem"
          ></el-button>
        </template>
        <template #default="{ row, $index }">
          <el-button
            link
            :icon="ElIconDelete"
            type="danger"
            @click="removeItem($index, row.id)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <table class="table">
      <tbody>
        <tr>
          <td>Grand Total</td>
          <td class="text-right">
            <strong>{{ toCurrency(amount) }}</strong>
          </td>
        </tr>

        <tr>
          <td>Tax</td>
          <td class="text-right">
            <el-input
              type="number"
              v-model="form.tax"
              placeholder="Tax"
              style="width: 120px; margin-right: 10px"
            />
            <strong>{{ toDecimal(form.tax) }}</strong>
          </td>
        </tr>

        <tr>
          <td>Deduction</td>
          <td class="text-right">
            <el-input
              type="number"
              v-model="form.deduction"
              placeholder="Deduction"
              style="width: 120px; margin-right: 10px"
            />
            <strong>{{ toCurrency(form.deduction) }}</strong>
          </td>
        </tr>

        <tr>
          <td>Net Amount</td>
          <td class="text-right">
            <strong>{{ toDecimal(netAmount, form.currency) }}</strong>
          </td>
        </tr>

        <tr>
          <td>Down Payment</td>
          <td class="text-right">
            <el-input
              type="number"
              v-model="form.downPayment"
              placeholder="Down Payment"
              style="width: 120px; margin-right: 10px"
            />
            <strong>{{ toDecimal(form.downPayment) }}</strong>
          </td>
        </tr>

        <tr>
          <td>Terbilang</td>
          <td class="text-right">
            <strong>
              {{ terbilang(netAmount).toUpperCase() }}
            </strong>
          </td>
        </tr>
      </tbody>
    </table>

    <template #footer>
      <el-button :icon="ElIconCircleCloseFilled" @click="closeForm">
        CLOSE
      </el-button>
      <el-button
        :icon="ElIconSuccessFilled"
        type="info"
        @click="saveWithStatus('DRAFT')"
      >
        SAVE AS DRAFT
      </el-button>

      <el-button
        :icon="ElIconSuccessFilled"
        type="success"
        @click="saveWithStatus('SUBMITTED')"
      >
        SUBMIT
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { currencies } from "~/constants/currencies";

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

const { data: suppliers } = useQuery({
  queryKey: ["suppliers"],
  queryFn: () => request("/api/suppliers"),
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

function updateBank(id) {
  let data = {};

  if (form.value.paymentType == "EMPLOYEE") {
    data = users.value.find((u) => u.id == id);
  }

  if (form.value.paymentType == "VENDOR") {
    data = suppliers.value.find((u) => u.id == id);
  }

  if (data) {
    form.value.bankId = data.bankId;
    form.value.bankAccount = data.bankAccount;
    form.value.currency = data.currency;
  }
}

function resetBank() {
  form.value.employeeId = null;
  form.value.supplierId = null;
  form.value.bankId = null;
  form.value.bankAccount = null;
  form.value.currency = null;
}

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

async function saveWithStatus(status) {
  if (status == "SUBMITTED") {
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
  }

  form.value.grossAmount = amount;
  form.value.netAmount = netAmount;
  form.value.deduction = Number(form.value.deduction);

  form.value.PaymentAuthorizationItem.forEach((e) => {
    e.amount = Number(e.amount);
    e.currency = form.value.currency;
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
