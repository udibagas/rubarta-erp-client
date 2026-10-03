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
        <el-radio-group v-model="form.type" fill="rgb(149, 212, 117)">
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
          <el-select
            v-model="form.bankName"
            placeholder="Select Bank"
            style="width: 100%"
            filterable
            default-first-option
          >
            <el-option
              v-for="(el, i) in banks"
              :value="`${el.code} - ${el.name}`"
              :label="`${el.code} - ${el.name}`"
              :key="i"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Account Number">
          <el-input v-model="form.accountNumber" />
        </el-form-item>
        <el-form-item label="Account Holder">
          <el-input v-model="form.accountHolder" />
        </el-form-item>
      </template>

      <el-form-item label="Currency" :error="errors.currency">
        <el-radio-group v-model="form.currency" fill="rgb(149, 212, 117)">
          <el-radio-button
            v-for="(currency, i) in currencies"
            :value="currency"
            :label="currency"
            :key="i"
          />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Opening Balance">
        <el-input
          v-model="form.openingBalance"
          class="font-mono"
          :parser="(v) => Number(v.replace(/\./g, '').replace(',', '.'))"
          :formatter="
            (value) => {
              if (!value) return '';
              const parts = value.toString().split('.');
              parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
              return parts.join(',');
            }
          "
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
import { useQuery } from "@tanstack/vue-query";
import { currencies } from "~/constants/currencies";

const props = defineProps({
  row: { type: Object, default: null },
  accounts: { type: Array, default: () => [] },
});

const emit = defineEmits(["save"]);
const show = defineModel("show", { default: false });

const request = useRequest();

const { data: banks } = useQuery({
  queryKey: ["banks"],
  queryFn: () => request("/api/banks"),
});

const blank = () => ({
  id: null,
  name: "",
  type: "BANK",
  accountId: null,
  bankName: "",
  accountNumber: "",
  accountHolder: "",
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
