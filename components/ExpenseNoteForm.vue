<template>
  <el-dialog
    v-model="show"
    title="EXPENSE NOTES"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Date" :error="errors.date">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="Date"
          :disabled-date="disabledDate"
          format="DD-MMM-YYYY"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="Expense Type" :error="errors.expenseTypeId">
        <el-select v-model="form.expenseTypeId" placeholder="Expense Type">
          <el-option
            v-for="(el, i) in expenseTypes"
            :value="el.id"
            :label="el.name"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Description" :error="errors.description">
        <el-input
          type="textarea"
          v-model="form.description"
          placeholder="Description"
          :rows="1"
        />
      </el-form-item>

      <el-form-item label="Amount" :error="errors.amount">
        <div class="flex">
          <el-input
            type="number"
            v-model="form.amount"
            placeholder="Amount"
            class="mr-2"
          />
          <strong>{{ toRupiah(form.amount) }}</strong>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="closeForm">
        CANCEL
      </el-button>
      <el-button :icon="SuccessFilled" type="success" @click="submit(form)">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { SuccessFilled, CircleCloseFilled } from "@element-plus/icons-vue";
const request = useRequest();

const disabledDate = (time) => {
  return time.getTime() > Date.now();
};

const { errors, form, show, closeForm, saveMutation } = useCrud({
  url: "/api/expense-notes",
  queryKey: "expense-notes",
});

const { mutate: save } = saveMutation();

const { data: expenseTypes } = useQuery({
  queryKey: ["expenseTypes"],
  queryFn: () => request("/api/expense-types"),
});

function submit(data) {
  const { amount, ...payload } = data;
  save({ ...payload, amount: Number(amount) });
}
</script>
