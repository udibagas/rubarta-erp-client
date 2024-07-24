<template>
  <el-dialog
    v-model="expenseNoteStore.showForm"
    title="EXPENSE NOTES"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Date" :error="expenseNoteStore.formErrors.date">
        <el-date-picker
          v-model="expenseNoteStore.formModel.date"
          type="date"
          placeholder="Date"
          :disabled-date="disabledDate"
          format="DD-MMM-YYYY"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item
        label="Expense Type"
        :error="expenseNoteStore.formErrors.expenseTypeId"
      >
        <el-select
          v-model="expenseNoteStore.formModel.expenseTypeId"
          placeholder="Expense Type"
        >
          <el-option
            v-for="(el, i) in store.expenseTypes"
            :value="el.id"
            :label="el.name"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="Description"
        :error="expenseNoteStore.formErrors.description"
      >
        <el-input
          type="textarea"
          v-model="expenseNoteStore.formModel.description"
          placeholder="Description"
          :rows="1"
        />
      </el-form-item>

      <el-form-item label="Amount" :error="expenseNoteStore.formErrors.amount">
        <div class="flex">
          <el-input
            type="number"
            v-model="expenseNoteStore.formModel.amount"
            placeholder="Amount"
            class="mr-2"
          />
          <strong>{{ toRupiah(expenseNoteStore.formModel.amount) }}</strong>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="expenseNoteStore.closeForm">
        CANCEL
      </el-button>
      <el-button
        :icon="SuccessFilled"
        type="success"
        @click="expenseNoteStore.save()"
      >
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { SuccessFilled, CircleCloseFilled } from "@element-plus/icons-vue";
const expenseNoteStore = useExpenseNoteStore();
const store = useWebsiteStore();

const disabledDate = (time) => {
  return time.getTime() > Date.now();
};
</script>
