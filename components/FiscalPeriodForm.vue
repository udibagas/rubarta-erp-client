<template>
  <el-dialog
    v-model="show"
    title="FISCAL PERIOD"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Name" :error="errors.name">
        <el-input v-model="form.name" placeholder="e.g. Dec 2026" />
      </el-form-item>
      <el-form-item label="Start Date" :error="errors.startDate">
        <el-date-picker
          v-model="form.startDate"
          type="date"
          value-format="YYYY-MM-DD"
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="End Date" :error="errors.endDate">
        <el-date-picker
          v-model="form.endDate"
          type="date"
          value-format="YYYY-MM-DD"
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
const emit = defineEmits(["save"]);
const show = defineModel("show", { default: false });

const blank = () => ({
  id: null,
  name: "",
  startDate: "",
  endDate: "",
  status: "OPEN",
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
  if (!form.value.name) errors.value.name = "Name is required";
  if (!form.value.startDate) errors.value.startDate = "Required";
  if (!form.value.endDate) errors.value.endDate = "Required";
  if (
    form.value.startDate &&
    form.value.endDate &&
    form.value.endDate < form.value.startDate
  )
    errors.value.endDate = "End date must be after start date";
  if (Object.keys(errors.value).length) return;
  emit("save", { ...form.value });
}
</script>
