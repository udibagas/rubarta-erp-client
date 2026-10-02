<template>
  <el-dialog
    v-model="show"
    title="ACCOUNTING EXPENSE"
    width="550px"
    :close-on-click-modal="false"
  >
    <el-form label-width="140px" label-position="left">
      <el-form-item label="Date" :error="errors.date">
        <el-date-picker
          v-model="form.date"
          type="date"
          value-format="YYYY-MM-DD"
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="Description" :error="errors.description">
        <el-input v-model="form.description" type="textarea" />
      </el-form-item>
      <el-form-item label="Expense Account" :error="errors.accountId">
        <el-select v-model="form.accountId" filterable class="w-full">
          <el-option
            v-for="account in accounts.filter(
              (item) =>
                item.type === 'EXPENSE' && item.isActive && item.isPostable,
            )"
            :key="account.id"
            :value="account.id"
            :label="`${account.code} - ${account.name}`"
          />
        </el-select>
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
        >CANCEL</el-button
      >
      <el-button :icon="ElIconSuccessFilled" type="success" @click="submit"
        >SAVE</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  accounts: { type: Array, default: () => [] },
  row: { type: Object, default: null },
});
const emit = defineEmits(["save"]);
const show = defineModel("show", { default: false });
const errors = ref({});
const form = ref({});

watch(show, (visible) => {
  if (!visible) return;
  errors.value = {};
  form.value = props.row
    ? { ...props.row, accountId: props.row.accountId ?? props.row.account?.id }
    : {
        date: new Date().toISOString().slice(0, 10),
        description: "",
        amount: 0,
        accountId: null,
      };
});

function submit() {
  errors.value = {};
  if (!form.value.date) errors.value.date = "Date is required";
  if (!form.value.description)
    errors.value.description = "Description is required";
  if (!form.value.accountId)
    errors.value.accountId = "Expense account is required";
  if (!(Number(form.value.amount) > 0))
    errors.value.amount = "Amount must be greater than zero";
  if (Object.keys(errors.value).length) return;
  emit("save", {
    ...form.value,
    accountId: Number(form.value.accountId),
    amount: Number(form.value.amount),
  });
}
</script>
