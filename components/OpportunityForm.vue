<template>
  <el-dialog
    v-model="show"
    width="600px"
    :title="!!form.id ? 'EDIT OPPORTUNITY' : 'ADD OPPORTUNITY'"
    :close-on-click-modal="false"
  >
    <el-form label-width="160px" label-position="left">
      <el-form-item label="Company" :error="errors.companyId">
        <el-select v-model="form.companyId" placeholder="Company" disabled>
          <el-option
            v-for="(el, i) in companies"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Customer" :error="errors.customerId">
        <el-select
          v-model="form.customerId"
          placeholder="Customer"
          filterable
          default-first-option
        >
          <el-option
            v-for="(el, i) in customers"
            :value="el.id"
            :label="el.name"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Opportunity" :error="errors.name">
        <el-input placeholder="Opportunity" v-model="form.name" />
      </el-form-item>

      <el-form-item label="Amount" :error="errors.amount">
        <el-input type="number" placeholder="Amount" v-model="form.amount" />
      </el-form-item>

      <el-form-item label="Expected Close Date" :error="errors.amount">
        <el-date-picker
          type="date"
          v-model="form.expectedCloseDate"
          placeholder="Select Date"
          format="DD-MMM-YYYY"
          style="width: 100%"
        >
        </el-date-picker>
      </el-form-item>

      <el-form-item label="Stage" :error="errors.stage">
        <el-select v-model="form.stage" placeholder="Stage">
          <el-option
            v-for="(el, i) in opportunityStages"
            :value="el"
            :label="el.replaceAll('_', ' ')"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :icon="ElIconCircleCloseFilled" @click="closeForm">
        CANCEL
      </el-button>
      <el-button
        :icon="ElIconSuccessFilled"
        type="success"
        @click="
          () => {
            form.amount = Number(form.amount);
            save(form);
          }
        "
      >
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { opportunityStages } from "~/constants/opportunityStages";

const { errors, form, show, closeForm, saveMutation, request } = useCrud({
  url: "/api/opportunities",
  queryKey: "opportunities",
});

const { mutate: save } = saveMutation();

const { data: customers } = useQuery({
  queryKey: ["customers"],
  queryFn: () => request("/api/customers"),
});

const { data: companies } = useQuery({
  queryKey: ["companies"],
  queryFn: () => request("/api/companies"),
});
</script>
