<template>
  <el-dialog
    v-model="show"
    title="CASH / BANK TRANSACTION"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Date" :error="errors.date">
        <el-date-picker
          v-model="form.date"
          type="date"
          value-format="YYYY-MM-DD"
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="Account" :error="errors.accountId">
        <el-select v-model="form.accountId" class="w-full">
          <el-option
            v-for="a in cashBanks"
            :key="a.id"
            :value="a.id"
            :label="a.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Offset Account" :error="errors.offsetAccountId">
        <el-select v-model="form.offsetAccountId" filterable class="w-full">
          <el-option
            v-for="a in glAccounts.filter(
              (item) => item.isActive && item.isPostable,
            )"
            :key="a.id"
            :value="a.id"
            :label="`${a.code} - ${a.name}`"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Fiscal Period" :error="errors.periodId">
        <el-select v-model="form.periodId" class="w-full">
          <el-option
            v-for="period in periods.filter((item) => item.status === 'OPEN')"
            :key="period.id"
            :value="period.id"
            :label="period.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Type">
        <el-radio-group v-model="form.type">
          <el-radio-button value="IN">Money In</el-radio-button>
          <el-radio-button value="OUT">Money Out</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Description" :error="errors.description">
        <el-input v-model="form.description" />
      </el-form-item>
      <el-form-item label="Amount" :error="errors.amount">
        <el-input-number
          v-model="form.amount"
          :min="0"
          :controls="false"
          class="w-full!"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button
        :icon="ElIconCircleCloseFilled"
        type="info"
        plain
        @click="show = false"
      >
        CANCEL
      </el-button>
      <el-button :icon="ElIconSuccessFilled" type="success" @click="submit">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  cashBanks: { type: Array, default: () => [] },
  glAccounts: { type: Array, default: () => [] },
  periods: { type: Array, default: () => [] },
  defaultAccountId: { type: Number, default: null },
});
const emit = defineEmits(["save"]);
const show = defineModel("show", { default: false });

const blank = () => ({
  id: null,
  date: new Date().toISOString().slice(0, 10),
  accountId: props.defaultAccountId,
  offsetAccountId: null,
  periodId: null,
  type: "IN",
  description: "",
  amount: 0,
  reconciled: false,
});
const form = ref(blank());
const errors = ref({});

watch(show, (v) => {
  if (!v) return;
  errors.value = {};
  form.value = blank();
});

function submit() {
  errors.value = {};
  if (!form.value.date) errors.value.date = "Date is required";
  if (!form.value.accountId) errors.value.accountId = "Required";
  if (!form.value.offsetAccountId) errors.value.offsetAccountId = "Required";
  if (
    cashBanks.find((account) => account.id === form.value.accountId)
      ?.accountId === form.value.offsetAccountId
  )
    errors.value.offsetAccountId =
      "Offset must differ from the cash/bank account";
  if (!form.value.periodId) errors.value.periodId = "Required";
  if (!form.value.description) errors.value.description = "Required";
  if (!form.value.amount) errors.value.amount = "Amount is required";
  if (Object.keys(errors.value).length) return;
  emit("save", { ...form.value });
}
</script>
