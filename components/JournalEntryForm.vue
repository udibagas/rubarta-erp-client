<template>
  <el-dialog
    v-model="show"
    title="JOURNAL ENTRY"
    width="900px"
    :close-on-click-modal="false"
  >
    <el-form label-width="120px" label-position="left">
      <div class="grid grid-cols-2 gap-x-4">
        <el-form-item label="Number">
          <el-input v-model="form.number" placeholder="Auto" disabled />
        </el-form-item>
        <el-form-item label="Date" :error="errors.date">
          <el-date-picker
            v-model="form.date"
            type="date"
            value-format="YYYY-MM-DD"
            class="w-full!"
          />
        </el-form-item>
        <el-form-item label="Fiscal Period" :error="errors.periodId">
          <el-select
            v-model="form.periodId"
            class="w-full"
            placeholder="Select period"
          >
            <el-option
              v-for="period in periods.filter((p) => p.status === 'OPEN')"
              :key="period.id"
              :value="period.id"
              :label="period.name"
            />
          </el-select>
        </el-form-item>
      </div>
      <el-form-item label="Description" :error="errors.description">
        <el-input v-model="form.description" placeholder="Description" />
      </el-form-item>
    </el-form>

    <el-table :data="form.lines" border size="small">
      <el-table-column label="Account" min-width="220">
        <template #default="{ row }">
          <el-select v-model="row.accountId" filterable placeholder="Account">
            <el-option
              v-for="a in accounts.filter(
                (item) => item.isActive && item.isPostable,
              )"
              :key="a.id"
              :value="a.id"
              :label="`${a.code} - ${a.name}`"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="Description" min-width="180">
        <template #default="{ row }">
          <el-input v-model="row.description" />
        </template>
      </el-table-column>
      <el-table-column label="Debit" width="160">
        <template #default="{ row }">
          <el-input-number
            v-model="row.debit"
            :min="0"
            :controls="false"
            class="w-full!"
          />
        </template>
      </el-table-column>
      <el-table-column label="Credit" width="160">
        <template #default="{ row }">
          <el-input-number
            v-model="row.credit"
            :min="0"
            :controls="false"
            class="w-full!"
          />
        </template>
      </el-table-column>
      <el-table-column width="50" align="center">
        <template #default="{ $index }">
          <el-button
            link
            type="danger"
            :icon="ElIconDelete"
            :disabled="form.lines.length <= 2"
            @click="form.lines.splice($index, 1)"
          />
        </template>
      </el-table-column>
    </el-table>

    <div class="flex items-center justify-between mt-2">
      <el-button :icon="ElIconPlus" @click="addLine">ADD LINE</el-button>
      <div class="flex items-center gap-6 text-sm">
        <span>Debit: {{ toCurrency(totals.debit) }}</span>
        <span>Credit: {{ toCurrency(totals.credit) }}</span>
        <el-tag :type="balanced ? 'success' : 'danger'">
          {{ balanced ? "Balanced" : "Not balanced" }}
        </el-tag>
      </div>
    </div>
    <div v-if="errors.lines" class="text-red-500 text-xs mt-1">
      {{ errors.lines }}
    </div>

    <template #footer>
      <el-button
        :icon="ElIconCircleCloseFilled"
        type="info"
        plain
        @click="show = false"
      >
        CANCEL
      </el-button>
      <el-button type="primary" plain @click="submit('DRAFT')">
        SAVE DRAFT
      </el-button>
      <el-button
        :icon="ElIconSuccessFilled"
        type="success"
        @click="submit('POSTED')"
      >
        POST
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  row: { type: Object, default: null },
  accounts: { type: Array, default: () => [] },
  periods: { type: Array, default: () => [] },
});
const emit = defineEmits(["save"]);
const show = defineModel("show", { default: false });

const blankLine = () => ({
  accountId: null,
  description: "",
  debit: 0,
  credit: 0,
});
const blank = () => ({
  id: null,
  number: "",
  date: new Date().toISOString().slice(0, 10),
  periodId: null,
  description: "",
  status: "DRAFT",
  lines: [blankLine(), blankLine()],
});
const form = ref(blank());
const errors = ref({});

const totals = computed(() => sumDebitCredit(form.value.lines));
const balanced = computed(
  () => totals.value.debit > 0 && totals.value.debit === totals.value.credit,
);

watch(show, (v) => {
  if (!v) return;
  errors.value = {};
  form.value = props.row
    ? {
        ...props.row,
        periodId: props.row.periodId ?? props.row.period?.id ?? null,
        lines: props.row.lines.map((l) => ({
          ...l,
          accountId: l.accountId ?? l.account?.id,
        })),
      }
    : blank();
});

const addLine = () => form.value.lines.push(blankLine());

function submit(status) {
  errors.value = {};
  if (!form.value.date) errors.value.date = "Date is required";
  if (!form.value.periodId) errors.value.periodId = "Period is required";
  if (!form.value.description)
    errors.value.description = "Description is required";
  if (form.value.lines.length < 2)
    errors.value.lines = "At least two lines are required";
  if (form.value.lines.some((line) => !line.accountId))
    errors.value.lines = "Select an account for every line";
  if (
    form.value.lines.some(
      (line) => Number(line.debit) > 0 === Number(line.credit) > 0,
    )
  )
    errors.value.lines = "Each line must have either a debit or a credit";
  if (!balanced.value)
    errors.value.lines = "Total debit must equal total credit";
  if (Object.keys(errors.value).length) return;
  emit("save", { ...form.value, status });
}
</script>
