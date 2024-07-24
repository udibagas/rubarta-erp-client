<template>
  <el-dialog
    v-model="paymentAuthorizationStore.showForm"
    width="900"
    title="PAYMENT AUTHORIZATION"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item
        label="Company"
        :error="paymentAuthorizationStore.formErrors.companyId"
      >
        <el-select
          v-model="paymentAuthorizationStore.formModel.companyId"
          placeholder="Company"
          disabled
        >
          <el-option
            v-for="(el, i) in companyStore.companies"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="Employee"
        :error="paymentAuthorizationStore.formErrors.employeeId"
      >
        <el-select
          v-model="paymentAuthorizationStore.formModel.employeeId"
          placeholder="Employee"
          @change="updateBank"
        >
          <el-option
            v-for="(el, i) in userStore.users"
            :value="el.id"
            :label="el.name"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="Bank"
        :error="paymentAuthorizationStore.formErrors.bankId"
      >
        <el-select
          v-model="paymentAuthorizationStore.formModel.bankId"
          placeholder="Bank"
          style="width: 100%"
        >
          <el-option
            v-for="(el, i) in bankStore.banks"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="Bank Account"
        :error="paymentAuthorizationStore.formErrors.bankAccount"
      >
        <el-input
          v-model="paymentAuthorizationStore.formModel.bankAccount"
          placeholder="Bank Account"
        />
      </el-form-item>

      <el-form-item
        label="Description"
        :error="paymentAuthorizationStore.formErrors.description"
      >
        <el-input
          type="textarea"
          :rows="3"
          v-model="paymentAuthorizationStore.formModel.description"
          placeholder="Description"
        />
      </el-form-item>
    </el-form>

    <el-table :data="formModel.PaymentAuthorizationItem">
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
            @click="paymentAuthorizationStore.addItem"
          ></el-button>
        </template>
        <template #default="{ row, $index }">
          <el-button
            link
            :icon="Delete"
            type="danger"
            @click="paymentAuthorizationStore.removeItem($index, row.id)"
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
              v-model="paymentAuthorizationStore.formModel.deduction"
              placeholder="Deduction"
              style="width: 120px; margin-right: 10px"
            />
            <strong>{{
              toRupiah(paymentAuthorizationStore.formModel.deduction)
            }}</strong>
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
          <td>
            <strong>Terbilang</strong>
          </td>
        </tr>
      </tbody>
    </table>

    <template #footer>
      <el-button
        :icon="CircleCloseFilled"
        @click="paymentAuthorizationStore.closeForm"
      >
        CANCEL
      </el-button>
      <el-button
        :icon="SuccessFilled"
        type="info"
        @click="paymentAuthorizationStore.save('DRAFT')"
      >
        SAVE AS DRAFT
      </el-button>

      <el-button
        :icon="SuccessFilled"
        type="success"
        @click="paymentAuthorizationStore.save('SUBMITTED')"
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

const userStore = useUserStore();
const companyStore = useCompanyStore();
const paymentAuthorizationStore = usePaymentAuthorizationStore();

const disabledDate = (time) => {
  return time.getTime() > Date.now();
};

const updateBank = (id) => {
  const user = userStore.users.find((u) => u.id == id);
  if (user) {
    paymentAuthorizationStore.formModel.bankId = user.bankId;
    paymentAuthorizationStore.formModel.bankAccount = user.bankAccount;
  }
};
</script>
