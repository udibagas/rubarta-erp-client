<template>
  <el-dialog
    v-model="show"
    title="TAX RATE"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Code" :error="errors.code">
        <el-input v-model="form.code" />
      </el-form-item>
      <el-form-item label="Name" :error="errors.name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="Rate (%)" :error="errors.rate">
        <el-input-number
          v-model="form.rate"
          :min="0"
          :max="100"
          :precision="2"
          :controls="false"
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="Type">
        <el-select v-model="form.type" class="w-full">
          <el-option value="OUTPUT" label="Output (Sales)" />
          <el-option value="INPUT" label="Input (Purchase)" />
          <el-option value="WITHHOLDING" label="Withholding" />
        </el-select>
      </el-form-item>
      <el-form-item label="Tax Account">
        <el-select v-model="form.accountId" filterable class="w-full">
          <el-option
            v-for="a in accounts.filter(
              (item) => item.isActive && item.isPostable,
            )"
            :key="a.id"
            :value="a.id"
            :label="`${a.code} - ${a.name}`"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Active">
        <el-switch v-model="form.isActive" />
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
  row: { type: Object, default: null },
  accounts: { type: Array, default: () => [] },
});
const emit = defineEmits(["save"]);
const show = defineModel("show", { default: false });

const blank = () => ({
  id: null,
  code: "",
  name: "",
  rate: 0,
  type: "OUTPUT",
  accountId: null,
  isActive: true,
});
const form = ref(blank());
const errors = ref({});

watch(show, (v) => {
  if (!v) return;
  errors.value = {};
  form.value = props.row ? { ...props.row } : blank();
});

function submit() {
  errors.value = {};
  if (!form.value.code) errors.value.code = "Code is required";
  if (!form.value.name) errors.value.name = "Name is required";
  if (!form.value.accountId) errors.value.accountId = "Account is required";
  if (Object.keys(errors.value).length) return;
  emit("save", { ...form.value });
}
</script>
