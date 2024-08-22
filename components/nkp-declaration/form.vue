<template>
  <el-dialog
    v-model="show"
    width="1000"
    title="NKP DECLARATION"
    :close-on-click-modal="false"
    center
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

      <el-form-item label="Department" :error="errors.departmentId">
        <el-select
          v-model="form.departmentId"
          placeholder="Department"
          style="width: 100%"
        >
          <el-option
            v-for="(el, i) in departments"
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

      <!-- <el-form-item label="Bank" :error="errors.bankId">
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
      </el-form-item> -->

      <!-- <el-form-item label="Description" :error="errors.description">
        <el-input
          type="textarea"
          :rows="3"
          v-model="form.description"
          placeholder="Description"
        />
      </el-form-item> -->
    </el-form>

    <el-table :data="form.ExpenseClaimItem">
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

      <el-table-column label="EXPENSE TYPE" width="170">
        <template #default="{ row }">
          <el-select
            v-model="row.expenseTypeId"
            placeholder="Expense Type"
            filterable
            default-first-option
          >
            <el-option
              v-for="(el, i) in expenseTypes"
              :value="el.id"
              :label="el.name"
              :key="i"
            >
            </el-option>
          </el-select>
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
          <strong>{{ toDecimal(row.amount) }}</strong>
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

    <el-table :data="summary">
      <el-table-column
        prop="expenseType"
        label="Expense Type"
      ></el-table-column>
      <el-table-column label="Amount" align="right" header-align="right">
        <template #default="{ row }">
          <strong>{{ toDecimal(row.amount) }}</strong>
        </template>
      </el-table-column>
    </el-table>

    <table class="table">
      <tbody>
        <tr>
          <td class="strong">TOTAL EXPENSE</td>
          <td class="text-right">
            <strong>{{ toDecimal(totalAmount) }}</strong>
          </td>
        </tr>

        <tr>
          <td class="strong">CASH ADVANCE</td>
          <td class="text-right">
            <el-input
              type="number"
              v-model="form.cashAdvance"
              placeholder="Cash Advance"
              style="width: 120px; margin-right: 10px"
            />
            <strong>{{ toDecimal(form.cashAdvance) }}</strong>
          </td>
        </tr>

        <tr>
          <td class="strong">BALANCE</td>
          <td class="text-right">
            <el-text :type="balance > 0 ? 'success' : 'danger'" class="strong">
              {{ toDecimal(balance) }}
            </el-text>
          </td>
        </tr>
      </tbody>
    </table>

    <br />

    <el-upload
      v-model:file-list="fileList"
      :action="`${config.public.apiBase}/api/file`"
      :with-credentials="true"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :multiple="true"
      list-type="picture-card"
    >
      <el-icon><ElIconPlus /></el-icon>
    </el-upload>

    <template #footer>
      <el-button :icon="ElIconCircleCloseFilled" @click="closeForm">
        CANCEL
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

  <el-dialog v-model="showPreview" center>
    <img :src="previewUrl" alt="" style="width: 100%" />

    <template #footer>
      <el-button
        :icon="ElIconCircleCloseFilled"
        @click="showPreview = false"
        type="success"
      >
        CLOSE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { currencies } from "~/constants/currencies";
const url = "/api/expense-claims";
const { errors, form, show, closeForm, saveMutation, request } = useCrud({
  url,
  queryKey: "expense-claims",
});

const { mutate: save } = saveMutation();
const { data: companies } = useQuery({
  queryKey: ["companies"],
  queryFn: () => request("/api/companies"),
});

const { data: departments } = useQuery({
  queryKey: ["departments"],
  queryFn: () => request("/api/departments"),
});

const { data: expenseTypes } = useQuery({
  queryKey: ["expense-types"],
  queryFn: () => request("/api/expense-types"),
});

const { data: banks } = useQuery({
  queryKey: ["banks"],
  queryFn: () => request("/api/banks"),
});

const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: () => request("/api/users"),
});

const totalAmount = computed(() => {
  return (
    form.value.ExpenseClaimItem?.reduce(
      (total, current) => total + Number(current.amount),
      0
    ) ?? 0
  );
});

const balance = computed(() => {
  return totalAmount.value - Number(form.value.cashAdvance);
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

  form.value.status = status;
  form.value.cashAdvance = Number(form.value.cashAdvance);

  form.value.ExpenseClaimItem.forEach((e) => {
    e.amount = Number(e.amount);
  });

  form.value.totalAmount =
    form.value.ExpenseClaimItem?.reduce(
      (total, current) => total + Number(current.amount),
      0
    ) ?? 0;

  form.value.balance = form.value.cashAdvance - form.value.totalAmount;
  save(form.value);
}

const summary = computed(() => {
  const summaryObj = {};
  form.value.ExpenseClaimItem?.forEach((item) => {
    if (!summaryObj[item.expenseTypeId]) summaryObj[item.expenseTypeId] = 0;
    summaryObj[item.expenseTypeId] += item.amount;
  });
  // {1: 20000, 3: 20000, 4: 150000}
  const summaryArr = Object.keys(summaryObj).map((k) => {
    const expenseType =
      expenseTypes.value.find((e) => e.id == k)?.name ?? "OTHER";
    return {
      expenseType,
      amount: summaryObj[k],
    };
  });
  return summaryArr;
});

const disabledDate = (time) => {
  return time.getTime() > Date.now();
};

async function removeItem(index, id) {
  if (id) {
    await request(`${url}/${form.value.id}/${id}`, {
      method: "DELETE",
    });
  }

  form.value.ExpenseClaimItem.splice(index, 1);
}

function addItem() {
  form.value.ExpenseClaimItem.push({
    date: undefined,
    expenseTypeId: undefined,
    description: undefined,
    amount: 0,
  });
}

function updateBank(id) {
  let data = users.value.find((u) => u.id == id);

  if (data) {
    form.value.bankId = data.bankId;
    form.value.bankAccount = data.bankAccount;
    form.value.currency = data.currency;
  }
}

function resetBank() {
  form.value.bankId = null;
  form.value.bankAccount = null;
  form.value.currency = null;
}

// UPLOAD RELATED

const config = useRuntimeConfig();
const fileList = ref([]);
const showPreview = ref(false);
const previewUrl = ref("");

watch(
  () => form.value.ExpenseClaimAttachment,
  async (value, oldValue) => {
    if (!value) {
      return (fileList.value = []);
    }

    fileList.value = form.value.ExpenseClaimAttachment.map((el) => {
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

function handleSuccess(file) {
  if (!form.value.ExpenseClaimAttachment) {
    form.value.ExpenseClaimAttachment = [];
  }

  form.value.ExpenseClaimAttachment.push(file);
}

function handlePreview(file) {
  previewUrl.value = file.url;
  showPreview.value = true;
}

function handleRemove(file) {
  const path = file.response?.filePath ?? file.filePath;
  const index = form.value.ExpenseClaimAttachment.findIndex(
    (f) => f.filePath == path
  );

  if (index !== -1) {
    form.value.ExpenseClaimAttachment.splice(index, 1);
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
</script>
