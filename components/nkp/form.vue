<template>
  <el-dialog
    v-model="show"
    width="900"
    title="NOTA KUASA PEMBAYARAN"
    :close-on-click-modal="false"
  >
    <br />
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Parent" v-if="form.parentId">
        <strong>{{ form.Parent.number }}</strong>
      </el-form-item>

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

      <el-form-item label="Payment Target" :error="errors.paymentType">
        <el-radio-group v-model="form.paymentType" @change="resetBank">
          <el-radio value="EMPLOYEE" :disabled="!!form.parentId">
            EMPLOYEE
          </el-radio>
          <el-radio value="VENDOR" :disabled="!!form.parentId">VENDOR</el-radio>
          <!-- <el-radio value="COMPANY">COMPANY</el-radio> -->
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="form.paymentType"
        label="NKP Type"
        :error="errors.nkpType"
      >
        <el-radio-group v-model="form.nkpType" @change="resetBank">
          <el-radio
            v-if="form.paymentType == 'EMPLOYEE'"
            value="CASH_ADVANCE"
            :disabled="!!form.parentId"
          >
            CASH ADVANCE
          </el-radio>
          <el-radio
            v-if="form.paymentType == 'EMPLOYEE'"
            value="DECLARATION"
            :disabled="!!form.parentId"
          >
            DECLARATION
          </el-radio>

          <el-radio
            v-if="form.paymentType == 'VENDOR'"
            value="DOWN_PAYMENT"
            :disabled="!!form.parentId"
          >
            DOWN PAYMENT
          </el-radio>
          <el-radio
            v-if="form.paymentType == 'VENDOR'"
            value="SETTLEMENT"
            :disabled="!!form.parentId"
          >
            SETTLEMENT
          </el-radio>

          <!-- <el-radio
            v-if="form.paymentType == 'COMPANY'"
            value="MUTATION"
            :disabled="!!form.parentId"
          >
            MUTATION
          </el-radio> -->
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
          :disabled="!!form.parentId"
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

      <!-- <el-form-item
        v-if="form.paymentType"
        label="Source Bank"
        :error="errors.sourceBank"
      >
        <el-select
          v-model="form.sourceBank"
          placeholder="Source Bank"
          default-first-option
          filterable
          :disabled="!!form.parentId"
        >
          <el-option
            v-for="(el, i) in banks"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item> -->

      <el-form-item v-if="form.paymentType" label="Bank" :error="errors.bankId">
        <el-select
          v-model="form.bankId"
          placeholder="Bank"
          default-first-option
          filterable
          :disabled="!!form.parentId"
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

      <el-form-item
        v-if="form.paymentType"
        label="Bank Account"
        :error="errors.bankAccount"
      >
        <el-input
          v-model="form.bankAccount"
          placeholder="Bank Account"
          :disabled="!!form.parentId"
        />
      </el-form-item>

      <el-form-item
        v-if="form.paymentType"
        label="Currency"
        :error="errors.currency"
      >
        <el-radio-group v-model="form.currency">
          <el-radio
            v-for="(currency, i) in currencies"
            :value="currency"
            :key="i"
            :disabled="!!form.parentId"
          >
            {{ currency }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="form.paymentType == 'VENDOR'"
        label="Invoice Number"
        :error="errors.invoiceNumber"
      >
        <el-input v-model="form.invoiceNumber" placeholder="Invoice Number" />
      </el-form-item>

      <el-form-item
        v-if="form.paymentType == 'VENDOR'"
        label="Total Amount"
        :error="errors.totalAmount"
      >
        <el-input
          type="number"
          v-model="form.totalAmount"
          placeholder="Total Amount"
        />
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

    <el-table :data="form.NkpItem">
      <el-table-column type="index" label="#"></el-table-column>

      <el-table-column label="DATE" width="170">
        <template #default="{ row }">
          <el-date-picker
            v-model="row.date"
            type="date"
            placeholder="Date"
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
        <template #default="{ row, $index }">
          <el-input
            type="number"
            v-model="row.amount"
            placeholder="Amount"
            @keydown.tab="(e) => handleTab(e, $index)"
          >
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
            tabindex="-1"
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
          <td style="width: 200px">Grand Total</td>
          <td></td>
          <td class="text-right" style="padding-right: 25px">
            <strong>{{ toDecimal(grandTotal) }}</strong>
          </td>
          <td style="width: 86px">{{ form.currency }}</td>
        </tr>

        <tr v-if="form.paymentType == 'VENDOR'">
          <td>Tax</td>
          <td>
            <el-input
              type="number"
              v-model="form.tax"
              placeholder="Tax"
              style="width: 150px"
            />
          </td>
          <td class="text-right" style="padding-right: 25px">
            <strong>{{ toDecimal(form.tax) }}</strong>
          </td>
          <td>{{ form.currency }}</td>
        </tr>

        <tr v-if="form.paymentType == 'VENDOR'">
          <td>Deduction</td>
          <td>
            <el-input
              type="number"
              v-model="form.deduction"
              placeholder="Deduction"
              style="width: 150px"
            />
          </td>
          <td class="text-right" style="padding-right: 25px">
            <strong>{{ toDecimal(form.deduction) }}</strong>
          </td>
          <td>{{ form.currency }}</td>
        </tr>

        <tr v-if="form.paymentType == 'VENDOR'">
          <td>Net Amount</td>
          <td></td>
          <td class="text-right" style="padding-right: 25px">
            <strong>{{ toDecimal(netAmount) }}</strong>
          </td>
          <td>{{ form.currency }}</td>
        </tr>

        <tr v-if="form.paymentType == 'EMPLOYEE' && form.cashAdvanceBalance">
          <td>Cash Advance Balance</td>
          <td></td>
          <td class="text-right" style="padding-right: 25px">
            <strong>{{ toDecimal(form.cashAdvanceBalance) }}</strong>
          </td>
          <td>{{ form.currency }}</td>
        </tr>

        <tr v-if="form.paymentType == 'VENDOR' && form.nkpType == 'SETTLEMENT'">
          <td>Down Payment</td>
          <td></td>
          <td class="text-right" style="padding-right: 25px">
            <strong>{{ toDecimal(form.downPayment) }}</strong>
          </td>
          <td>{{ form.currency }}</td>
        </tr>

        <tr v-if="form.nkpType !== 'DECLARATION'">
          <td>TRANSFER TO {{ form.paymentType }}</td>
          <td></td>
          <td class="text-right" style="padding-right: 25px">
            <strong>{{ toDecimal(finalPayment) }}</strong>
          </td>
          <td>{{ form.currency }}</td>
        </tr>

        <tr v-if="form.paymentType == 'EMPLOYEE' && form.parentId">
          <td>Kembali Ke {{ finalPayment > 0 ? "Karyawan" : "Perusahaan" }}</td>
          <td></td>
          <td class="text-right" style="padding-right: 25px">
            <el-text :type="finalPayment > 0 ? 'success' : 'danger'">
              <strong>{{ toDecimal(Math.abs(finalPayment)) }}</strong>
            </el-text>
          </td>
          <td>{{ form.currency }}</td>
        </tr>

        <tr>
          <td>Terbilang</td>
          <td class="text-right" colspan="2" style="padding-right: 25px">
            <strong>
              {{ terbilang(finalPayment).toUpperCase() }}
            </strong>
          </td>
          <td>{{ form.currency }}</td>
        </tr>
      </tbody>
    </table>

    <br />

    <h1>Attachment</h1>

    <el-upload
      v-model:file-list="fileList"
      :action="`${config.public.apiBase}/api/file`"
      :with-credentials="true"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :multiple="true"
    >
      <el-button type="success" :icon="ElIconUpload">Upload</el-button>
    </el-upload>

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

const url = "/api/nkp";

const { errors, form, show, request, closeForm, saveMutation } = useCrud({
  url,
  queryKey: "nkp",
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

const { data: balances } = useQuery({
  queryKey: ["user-balance"],
  queryFn: () => request("/api/users/balance"),
});

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

const grandTotal = computed(() => {
  return (
    form.value.NkpItem?.reduce(
      (total, current) => total + Number(current.amount),
      0
    ) ?? 0
  );
});

const netAmount = computed(() => {
  if (form.value.paymentType == "EMPLOYEE") {
    return grandTotal.value;
  }

  if (form.value.paymentType == "VENDOR") {
    return grandTotal.value - form.value.tax - form.value.deduction;
  }

  return 0;
});

const finalPayment = computed(() => {
  if (form.value.paymentType == "EMPLOYEE") {
    return grandTotal.value - form.value.cashAdvanceBalance;
  }

  if (form.value.paymentType == "VENDOR") {
    return netAmount.value - form.value.downPayment;
  }

  return 0;
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

  form.value.grandTotal = grandTotal.value;
  form.value.netAmount = netAmount.value;
  form.value.totalAmount = Number(form.value.totalAmount);
  form.value.finalPayment = finalPayment.value;
  form.value.deduction = Number(form.value.deduction);
  form.value.tax = Number(form.value.tax);
  form.value.cashAdvanceBalance = Number(form.value.cashAdvanceBalance);
  form.value.downPayment = Number(form.value.downPayment);
  form.value.status = status;

  form.value.NkpItem.forEach((e) => {
    e.amount = Number(e.amount);
    e.currency = form.value.currency;
  });

  save(form.value);
}

async function removeItem(index, id) {
  if (id) {
    await request(`${url}/${form.value.id}/${id}`, {
      method: "DELETE",
    });
  }

  form.value.NkpItem.splice(index, 1);
}

function addItem() {
  form.value.NkpItem.push({ ...newRow });
}

// UPLOAD RELATED

const config = useRuntimeConfig();
const fileList = ref([]);

watch(
  () => form.value.PaymentAuthorizationAttachment,
  async (value, oldValue) => {
    if (!value) {
      return (fileList.value = []);
    }

    fileList.value = form.value.PaymentAuthorizationAttachment.map((el) => {
      const { fileName: name, fileSize: size, filePath, fileType } = el;
      return {
        name,
        size,
        url: `${config.public.apiBase}/${filePath}`,
        filePath,
      };
    });
  }
);

// kalau dia cash advance, ambil data balance employee
watch(
  () => form.value.employeeId,
  (value) => {
    if (form.value.nkpType == "CASH_ADVANCE") {
      const employeeBalance = balances.value.find((el) => el.userId == value);
      form.value.cashAdvanceBalance = employeeBalance?.balance ?? 0;
    }
  }
);

function handleSuccess(file) {
  if (!form.value.PaymentAuthorizationAttachment) {
    form.value.PaymentAuthorizationAttachment = [];
  }

  form.value.PaymentAuthorizationAttachment.push(file);
}

function handlePreview(file) {
  window.open(`${config.public.apiBase}/${file.filePath}`, "_blank");
}

function handleRemove(file) {
  const path = file.response?.filePath ?? file.filePath;
  const index = form.value.PaymentAuthorizationAttachment.findIndex(
    (f) => f.filePath == path
  );

  if (index !== -1) {
    form.value.PaymentAuthorizationAttachment.splice(index, 1);
  }

  request(`/api/file`, {
    method: "DELETE",
    params: { path },
  }).then((res) => {
    ElMessage({
      message: res.message,
      type: "success",
      showClose: true,
    });
  });
}

function handleTab(e, index) {
  if (index == form.value.NkpItem.length - 1) {
    addItem();
  }
}

async function handleChangeBank(value) {
  if (form.value.paymentType == "COMPANY") {
    // TODO: cari detail bank milik company
    // form.value.bankAccount =
  }
}
</script>
