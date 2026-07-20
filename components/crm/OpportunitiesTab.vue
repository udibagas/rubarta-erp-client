<template>
  <div class="mb-4 flex justify-between items-center gap-4">
    <el-input
      v-model="searchQuery"
      placeholder="Search opportunities..."
      clearable
      style="max-width: 300px"
    >
      <template #prefix>
        <el-icon><ElIconSearch /></el-icon>
      </template>
    </el-input>

    <el-button type="success" :icon="ElIconPlus" @click="handleNewOpportunity">
      New Opportunity
    </el-button>
  </div>

  <el-table :data="filteredData" stripe v-loading="isPending">
    <el-table-column type="index" label="#" width="60" />
    <el-table-column label="Name" prop="name" min-width="200" />
    <el-table-column label="Stage" width="150" align="center">
      <template #default="{ row }">
        <StatusTag :status="row.stage" />
      </template>
    </el-table-column>
    <el-table-column label="Amount" width="150" align="right">
      <template #default="{ row }">
        <strong class="font-mono">
          {{ toCurrency(row.amount.toString()) }}
        </strong>
      </template>
    </el-table-column>
    <el-table-column label="Probability" width="200" align="center">
      <template #default="{ row }">
        <el-progress
          :percentage="row.probability"
          :status="row.probability === 100 ? 'success' : 'active'"
          :text-inside="true"
          :stroke-width="15"
        />
      </template>
    </el-table-column>
    <el-table-column label="Expected Close" width="150" align="center">
      <template #default="{ row }">
        {{ formatDate(row.expectedCloseDate) }}
      </template>
    </el-table-column>
    <el-table-column width="60" align="center" fixed="right">
      <template #default="{ row }">
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-icon>
              <ElIconMoreFilled />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                :icon="ElIconView"
                @click="navigateTo(`/crm/opportunities?id=${row.id}`)"
              >
                View
              </el-dropdown-item>
              <el-dropdown-item
                :icon="ElIconEdit"
                @click="handleEditOpportunity(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                :icon="ElIconDelete"
                @click="handleDeleteOpportunity(row.id)"
              >
                Delete
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-table-column>
  </el-table>
  <el-empty
    v-if="!filteredData || filteredData.length === 0"
    :description="
      searchQuery
        ? 'No opportunities match your search'
        : 'No opportunities found'
    "
  />

  <el-dialog
    v-model="showOpportunityForm"
    width="750px"
    :title="opportunityFormData.id ? 'EDIT OPPORTUNITY' : 'ADD OPPORTUNITY'"
    :close-on-click-modal="false"
    @close="opportunityFormData = {}"
  >
    <el-form label-width="160px" label-position="left">
      <el-form-item label="Name" required :error="errors.name">
        <el-input
          placeholder="Opportunity name"
          v-model="opportunityFormData.name"
        />
      </el-form-item>

      <el-form-item label="Customer" :error="errors.customerId">
        <el-select
          v-model="opportunityFormData.customerId"
          placeholder="Select customer"
          filterable
          clearable
        >
          <el-option
            v-for="customer in customers"
            :key="customer.id"
            :value="customer.id"
            :label="customer.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Stage" required :error="errors.stage">
        <el-select
          v-model="opportunityFormData.stage"
          placeholder="Select stage"
        >
          <el-option
            v-for="stage in opportunityStages"
            :key="stage"
            :value="stage"
            :label="stage"
          />
        </el-select>
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="Amount" required :error="errors.amount">
            <el-input-number
              v-model="opportunityFormData.amount"
              :min="0"
              :precision="2"
              placeholder="Amount"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item
            label="Probability (%)"
            required
            :error="errors.probability"
          >
            <el-input-number
              v-model="opportunityFormData.probability"
              :min="0"
              :max="100"
              placeholder="Probability"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item
        label="Expected Close Date"
        required
        :error="errors.expectedCloseDate"
      >
        <el-date-picker
          v-model="opportunityFormData.expectedCloseDate"
          type="date"
          placeholder="Expected close date"
          value-format="YYYY-MM-DD"
          format="DD-MMM-YYYY"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="Description" :error="errors.description">
        <el-input
          type="textarea"
          :rows="3"
          placeholder="Opportunity description"
          v-model="opportunityFormData.description"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="showOpportunityForm = false"> CANCEL </el-button>
      <el-button type="success" @click="saveOpportunity" :loading="isSaving">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { opportunityStages } from "~/constants/opportunityStages";

const props = defineProps({
  leadId: {
    type: [String, Number],
    required: false,
  },
  customerId: {
    type: [String, Number],
    required: false,
  },
});

const request = useRequest();
const queryClient = useQueryClient();

// Local state
const searchQuery = ref("");
const showOpportunityForm = ref(false);
const opportunityFormData = ref({});
const errors = ref({});
const isSaving = ref(false);

// Fetch opportunities
const { data, isPending } = useQuery({
  queryKey: ["opportunities", props],
  queryFn: async () => {
    const params = new URLSearchParams();
    params.append("page", "1");
    params.append("pageSize", "1000");
    if (props.leadId) params.append("leadId", props.leadId);
    if (props.customerId) params.append("customerId", props.customerId);
    const query = params.toString() ? `?${params.toString()}` : "";
    return await request(`/api/opportunities${query}`);
  },
  enabled: computed(() => !!(props.leadId || props.customerId)),
});

// Fetch customers for the select dropdown
const { data: customers } = useQuery({
  queryKey: ["customers"],
  queryFn: async () => {
    return await request("/api/customers");
  },
});

// Filter data based on search query
const filteredData = computed(() => {
  if (!data.value?.data || !Array.isArray(data.value.data)) return [];

  if (!searchQuery.value) return data.value.data;

  const query = searchQuery.value.toLowerCase();
  return data.value.data.filter((opportunity) => {
    return (
      opportunity.name?.toLowerCase().includes(query) ||
      opportunity.stage?.toLowerCase().includes(query) ||
      opportunity.description?.toLowerCase().includes(query)
    );
  });
});

// Handle new opportunity
const handleNewOpportunity = () => {
  const newOpportunity = {
    probability: 50,
    amount: 0,
  };

  if (props.leadId) {
    newOpportunity.leadId = +props.leadId;
  }

  if (props.customerId) {
    newOpportunity.customerId = +props.customerId;
  }

  opportunityFormData.value = newOpportunity;
  showOpportunityForm.value = true;
};

// Handle edit opportunity
const handleEditOpportunity = (opportunity) => {
  opportunityFormData.value = { ...opportunity };
  showOpportunityForm.value = true;
};

// Handle delete opportunity
const handleDeleteOpportunity = (id) => {
  ElMessageBox.confirm(
    "Are you sure you want to delete this opportunity?",
    "Warning",
    {
      type: "warning",
    },
  )
    .then(async () => {
      try {
        await request(`/api/opportunities/${id}`, { method: "DELETE" });
        queryClient.invalidateQueries({ queryKey: ["opportunities"] });
        ElMessage({
          message: "Opportunity deleted successfully",
          type: "success",
          showClose: true,
        });
      } catch (error) {
        ElMessage({
          message: error.message || "Failed to delete opportunity",
          type: "error",
          showClose: true,
        });
      }
    })
    .catch(() => {});
};

// Save opportunity
const saveOpportunity = async () => {
  try {
    isSaving.value = true;
    errors.value = {};
    const data = opportunityFormData.value;

    if (data.id) {
      await request(`/api/opportunities/${data.id}`, {
        method: "PATCH",
        body: data,
      });
    } else {
      await request("/api/opportunities", {
        method: "POST",
        body: data,
      });
    }

    showOpportunityForm.value = false;
    opportunityFormData.value = {};
    queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    ElMessage({
      message: "Opportunity saved successfully",
      type: "success",
      showClose: true,
    });
  } catch (error) {
    errors.value = parseError(error);
    console.error("Error saving opportunity:", errors.value);

    ElMessage({
      message: error.message || "Failed to save opportunity",
      type: "error",
      showClose: true,
    });
  } finally {
    isSaving.value = false;
  }
};
</script>
