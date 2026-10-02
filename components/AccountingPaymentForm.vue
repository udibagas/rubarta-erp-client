<template>
  <el-dialog
    v-model="show"
    :title="form.direction === 'IN' ? 'RECEIVE PAYMENT' : 'MAKE PAYMENT'"
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
      <el-form-item
        :label="form.direction === 'IN' ? 'Customer' : 'Vendor'"
        :error="errors.partyId"
      >
        <el-select v-model="form.partyId" filterable class="w-full">
          <el-option
            v-for="party in parties"
            :key="party.id"
            :value="party.id"
            :label="party.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Apply to document">
        <el-select
          v-model="form.documentId"
          clearable
          filterable
          class="w-full"
        >
          <el-option
            v-for="document in documents"
            :key="document.id"
            :value="document.id"
            :label="`${document.number} - ${document.party ?? document.supplier?.name ?? document.Customer?.name ?? ''}`"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Reference">
        <el-input v-model="form.reference" placeholder="Invoice / bill no." />
      </el-form-item>
      <el-form-item label="Method">
        <el-select v-model="form.method" class="w-full">
          <el-option
            v-for="m in PAYMENT_METHODS"
            :key="m"
            :value="m"
            :label="m"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Cash / Bank" :error="errors.account">
        <el-select v-model="form.cashBankAccountId" class="w-full">
          <el-option
            v-for="a in cashBanks"
            :key="a.id"
            :value="a.id"
            :label="a.name"
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
  direction: { type: String, default: "IN" },
  cashBanks: { type: Array, default: () => [] },
  customers: { type: Array, default: () => [] },
  suppliers: { type: Array, default: () => [] },
  documents: { type: Array, default: () => [] },
});
const emit = defineEmits(["save"]);
const show = defineModel("show", { default: false });

const blank = () => ({
  id: null,
  number: "",
  direction: props.direction,
  date: new Date().toISOString().slice(0, 10),
  partyId: null,
  documentId: null,
  method: "TRANSFER",
  cashBankAccountId: null,
  reference: "",
  amount: 0,
  status: "DRAFT",
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
  if (!form.value.date) errors.value.date = "Date is required";
  if (!form.value.partyId) errors.value.partyId = "Required";
  if (!form.value.cashBankAccountId)
    errors.value.account = "Cash/bank account is required";
  if (!form.value.amount) errors.value.amount = "Amount is required";
  if (Object.keys(errors.value).length) return;
  const numberPrefix = form.value.direction === "IN" ? "RCV" : "PAY";
  const document = props.documents.find(
    (item) => item.id === form.value.documentId,
  );
  emit("save", {
    number: form.value.number || `${numberPrefix}-${Date.now()}`,
    direction: form.value.direction,
    date: form.value.date,
    method: form.value.method,
    ...(form.value.direction === "IN"
      ? { customerId: form.value.partyId }
      : { supplierId: form.value.partyId }),
    cashBankAccountId: form.value.cashBankAccountId,
    amount: Number(form.value.amount),
    currency: "IDR",
    reference: form.value.reference || undefined,
    allocations: document
      ? [
          {
            ...(form.value.direction === "IN"
              ? { invoiceId: document.id }
              : { vendorBillId: document.id }),
            amount: Number(form.value.amount),
          },
        ]
      : [],
  });
}
</script>
