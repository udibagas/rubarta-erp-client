<template>
  <el-dialog
    v-model="show"
    width="500px"
    :title="
      !!form?.id ? 'EDIT INVOICE SUBMISSION' : 'CREATE NEW INVOICE SUBMISSION'
    "
    :close-on-click-modal="false"
    top="5vh"
  >
    <el-form label-width="140px" label-position="left">
      <el-form-item label="Date" :error="errors.date">
        <el-date-picker
          v-model="form.date"
          type="date"
          value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
          format="DD-MMM-YYYY"
          class="w-full!"
        />
      </el-form-item>

      <el-form-item label="Customer" :error="errors.customerId">
        <el-select
          v-model="form.customerId"
          placeholder="Select customer"
          filterable
          default-first-option
        >
          <el-option
            v-for="customer in customers"
            :key="customer.id"
            :value="customer.id"
            :label="customer.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Invoices" :error="errors.invoiceIds">
        <el-select
          v-model="form.invoiceIds"
          placeholder="Select invoices"
          multiple
          filterable
          :disabled="!form.customerId"
        >
          <el-option
            v-for="invoice in filteredInvoices"
            :key="invoice.id"
            :value="invoice.id"
            :label="`${invoice.number} - ${invoice.referenceNumber}`"
          >
            <span>
              {{ invoice.number }} -
              <span class="text-gray-400 text-sm">{{
                invoice.referenceNumber
              }}</span>
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Description" :error="errors.description">
        <el-input v-model="form.description" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button
        :icon="ElIconCircleCloseFilled"
        @click="closeForm"
        type="info"
        plain
      >
        CANCEL
      </el-button>
      <el-button
        :icon="ElIconSuccessFilled"
        type="success"
        @click="save"
        :loading="isSaving"
      >
        SAVE SUBMISSION
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import dayjs from "dayjs";
import { gql } from "@apollo/client";

const emit = defineEmits(["saved"]);
const request = useRequest();

const defaultValue = () => ({
  number: "",
  date: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
  amount: 0,
  description: "",
  customerId: null,
  invoiceIds: [],
});

const show = ref(false);
const form = ref(defaultValue());
const errors = ref({});
const isSaving = ref(false);
const customers = ref([]);
const invoices = ref([]);
const filteredInvoices = computed(() => {
  if (!form.value.customerId) return [];
  return invoices.value.filter(
    (invoice) => invoice.customerId === form.value.customerId,
  );
});

async function fetchCustomers() {
  try {
    const { data } = await useGraphqlQuery(
      gql`
        query ($status: [InvoiceStatus!]) {
          customers {
            id
            name
          }
          invoices(status: $status) {
            id
            number
            referenceNumber
            customerId
          }
        }
      `,
      {
        variables: { status: ["Confirmed"] },
      },
    );
    customers.value = data.customers;
    invoices.value = data.invoices;
  } catch (e) {
    console.error("Failed to fetch customers:", e);
  }
}

const openForm = async (data = {}) => {
  errors.value = {};
  form.value = {
    ...defaultValue(),
    ...data,
    amount: data.amount !== undefined ? Number(data.amount) : 0,
    invoiceIds:
      data.invoiceIds ??
      data.invoiceSubmissionItems?.map((i) => i.invoiceId) ??
      [],
  };
  show.value = true;

  if (!customers.value.length) await fetchCustomers();
};

const closeForm = () => {
  form.value = defaultValue();
  errors.value = {};
  show.value = false;
};

const save = async () => {
  try {
    isSaving.value = true;
    errors.value = {};

    const { number, date, amount, description, customerId, invoiceIds } =
      form.value;
    const body = { number, date, amount, customerId, invoiceIds };
    if (description) body.description = description;

    const res = await request(
      form.value.id
        ? `/api/invoice-submissions/${form.value.id}`
        : "/api/invoice-submissions",
      { method: form.value.id ? "PATCH" : "POST", body },
    );

    ElNotification.success({
      title: "Success",
      message: "Invoice submission saved successfully",
    });
    emit("saved", res);
    closeForm();
  } catch (error) {
    errors.value = parseError(error);
  } finally {
    isSaving.value = false;
  }
};

defineExpose({ openForm });
</script>
