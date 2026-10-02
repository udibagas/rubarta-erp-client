<template>
  <el-dialog
    v-model="show"
    title="VENDOR BILL"
    width="650px"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Bill Number" :error="errors.number">
        <el-input v-model="form.number" placeholder="e.g. BILL-2026-001" />
      </el-form-item>
      <el-form-item label="Vendor" :error="errors.supplierId">
        <el-select v-model="form.supplierId" filterable class="w-full">
          <el-option
            v-for="supplier in suppliers"
            :key="supplier.id"
            :value="supplier.id"
            :label="supplier.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Vendor Reference">
        <el-input v-model="form.vendorRef" />
      </el-form-item>
      <div class="grid grid-cols-2 gap-x-4">
        <el-form-item label="Bill Date" :error="errors.date">
          <el-date-picker
            v-model="form.date"
            type="date"
            value-format="YYYY-MM-DD"
            class="w-full!"
          />
        </el-form-item>
        <el-form-item label="Due Date" :error="errors.dueDate">
          <el-date-picker
            v-model="form.dueDate"
            type="date"
            value-format="YYYY-MM-DD"
            class="w-full!"
          />
        </el-form-item>
      </div>
      <div class="grid grid-cols-2 gap-x-4">
        <el-form-item label="Subtotal" :error="errors.subtotal">
          <el-input-number
            v-model="form.subtotal"
            :min="0"
            :controls="false"
            class="w-full!"
          />
        </el-form-item>
        <el-form-item label="Tax Amount">
          <el-input-number
            v-model="form.taxAmount"
            :min="0"
            :controls="false"
            class="w-full!"
          />
        </el-form-item>
      </div>
      <el-form-item label="Total">
        <el-input :model-value="toCurrency(total)" disabled />
      </el-form-item>
      <el-form-item label="Currency">
        <el-select v-model="form.currency" class="w-full">
          <el-option value="IDR" label="IDR" />
          <el-option value="USD" label="USD" />
          <el-option value="AUD" label="AUD" />
        </el-select>
      </el-form-item>
      <el-form-item label="Notes">
        <el-input v-model="form.notes" type="textarea" />
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
        >SAVE DRAFT</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({ suppliers: { type: Array, default: () => [] } });
const emit = defineEmits(["save"]);
const show = defineModel("show", { default: false });
const form = ref({});
const errors = ref({});
const total = computed(
  () =>
    (Number(form.value.subtotal) || 0) + (Number(form.value.taxAmount) || 0),
);

function reset() {
  const today = new Date().toISOString().slice(0, 10);
  form.value = {
    number: `BILL-${today.slice(0, 4)}-${Date.now()}`,
    supplierId: null,
    vendorRef: "",
    date: today,
    dueDate: today,
    subtotal: 0,
    taxAmount: 0,
    currency: "IDR",
    notes: "",
  };
  errors.value = {};
}

watch(show, (visible) => {
  if (visible) reset();
});

function submit() {
  errors.value = {};
  if (!form.value.number) errors.value.number = "Bill number is required";
  if (!form.value.supplierId) errors.value.supplierId = "Vendor is required";
  if (!form.value.date) errors.value.date = "Bill date is required";
  if (!form.value.dueDate) errors.value.dueDate = "Due date is required";
  if (!(Number(form.value.subtotal) >= 0))
    errors.value.subtotal = "Subtotal is required";
  if (form.value.dueDate < form.value.date)
    errors.value.dueDate = "Due date cannot precede bill date";
  if (total.value <= 0)
    errors.value.subtotal = "Total must be greater than zero";
  if (Object.keys(errors.value).length) return;
  emit("save", {
    ...form.value,
    supplierId: Number(form.value.supplierId),
    subtotal: Number(form.value.subtotal),
    taxAmount: Number(form.value.taxAmount) || 0,
    total: total.value,
  });
}
</script>
