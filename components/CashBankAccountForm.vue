<template>
  <el-dialog
    v-model="show"
    title="CASH / BANK ACCOUNT"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Name" :error="errors.name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="Type">
        <el-radio-group v-model="form.type">
          <el-radio-button value="CASH">Cash</el-radio-button>
          <el-radio-button value="BANK">Bank</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="GL Account" :error="errors.accountId">
        <el-select v-model="form.accountId" filterable class="w-full">
          <el-option
            v-for="a in accounts.filter(
              (item) =>
                item.type === 'ASSET' && item.isActive && item.isPostable,
            )"
            :key="a.id"
            :value="a.id"
            :label="`${a.code} - ${a.name}`"
          />
        </el-select>
      </el-form-item>
      <template v-if="form.type === 'BANK'">
        <el-form-item label="Bank Name">
          <el-input v-model="form.bankName" />
        </el-form-item>
        <el-form-item label="Account Number">
          <el-input v-model="form.accountNumber" />
        </el-form-item>
      </template>
      <el-form-item label="Opening Balance">
        <el-input-number
          v-model="form.openingBalance"
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
  row: { type: Object, default: null },
  accounts: { type: Array, default: () => [] },
});
const emit = defineEmits(["save"]);
const show = defineModel("show", { default: false });

const blank = () => ({
  id: null,
  name: "",
  type: "BANK",
  accountId: null,
  bankName: "",
  accountNumber: "",
  openingBalance: 0,
  currency: "IDR",
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
  if (!form.value.name) errors.value.name = "Name is required";
  if (!form.value.accountId) errors.value.accountId = "GL account is required";
  if (Object.keys(errors.value).length) return;
  emit("save", { ...form.value });
}
</script>
