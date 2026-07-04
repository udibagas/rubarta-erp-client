<template>
  <el-dialog
    v-model="show"
    width="750px"
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

      <el-form-item label="Assigned User" :error="errors.userId">
        <el-select v-model="form.userId" placeholder="Select user" filterable>
          <el-option
            v-for="user in users"
            :key="user.id"
            :value="user.id"
            :label="user.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Opportunity" :error="errors.name">
        <el-input placeholder="Opportunity" v-model="form.name" />
      </el-form-item>

      <el-form-item label="Description" :error="errors.description">
        <el-input
          type="textarea"
          :rows="3"
          placeholder="Description"
          v-model="form.description"
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="Amount" :error="errors.amount">
            <el-input
              type="number"
              placeholder="Amount"
              v-model="form.amount"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Probability (%)" :error="errors.probability">
            <el-input-number
              v-model="form.probability"
              :min="0"
              :max="100"
              placeholder="0-100"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
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
        </el-col>

        <el-col :span="12">
          <el-form-item
            label="Expected Close Date"
            :error="errors.expectedCloseDate"
          >
            <el-date-picker
              type="date"
              v-model="form.expectedCloseDate"
              placeholder="Select Date"
              format="DD-MMM-YYYY"
              value-format="YYYY-MM-DDT00:00:00Z"
              style="width: 100%"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item
        v-if="
          form.id &&
          (form.stage === 'Closed_Won' || form.stage === 'Closed_Lost')
        "
        label="Actual Close Date"
        :error="errors.actualCloseDate"
      >
        <el-date-picker
          type="date"
          v-model="form.actualCloseDate"
          placeholder="Select Date"
          format="DD-MMM-YYYY"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        >
        </el-date-picker>
      </el-form-item>

      <el-form-item
        v-if="form.id && form.stage === 'Closed_Lost'"
        label="Lost Reason"
        :error="errors.lostReason"
      >
        <el-input
          type="textarea"
          :rows="3"
          placeholder="Reason for losing this opportunity"
          v-model="form.lostReason"
        />
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
            if (form.probability !== null && form.probability !== undefined) {
              form.probability = Number(form.probability);
            }
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
import { useQuery } from "@tanstack/vue-query";
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

const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: () => request("/api/users"),
});
</script>
