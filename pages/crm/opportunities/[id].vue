<template>
  <el-page-header
    @back="goBack"
    :content="`CRM / Opportunities / ${opportunity?.name || ''}`"
  >
    <template #extra>
      <div class="flex gap-2">
        <el-button :icon="ElIconRefresh" @click="refetch" v-if="opportunity" />
        <el-dropdown v-if="opportunity" trigger="click">
          <el-button type="primary" :icon="ElIconMore"> Actions </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="ElIconEdit" @click="openEditForm">
                Edit Opportunity
              </el-dropdown-item>
              <el-dropdown-item
                v-if="
                  opportunity.stage !== 'Closed_Won' &&
                  opportunity.stage !== 'Closed_Lost'
                "
                :icon="ElIconCheck"
                @click="updateStage('Proposal_Sent')"
              >
                Mark as Proposal Sent
              </el-dropdown-item>
              <el-dropdown-item
                v-if="
                  opportunity.stage !== 'Closed_Won' &&
                  opportunity.stage !== 'Closed_Lost'
                "
                :icon="ElIconCheck"
                @click="markAsWon"
              >
                Mark as Won
              </el-dropdown-item>
              <el-dropdown-item
                v-if="
                  opportunity.stage !== 'Closed_Won' &&
                  opportunity.stage !== 'Closed_Lost'
                "
                :icon="ElIconClose"
                @click="markAsLost"
              >
                Mark as Lost
              </el-dropdown-item>
              <el-dropdown-item
                v-if="
                  opportunity.stage !== 'Closed_Won' &&
                  opportunity.stage !== 'Closed_Lost'
                "
                :icon="ElIconDocument"
                @click="createQuotation"
              >
                Create Quotation
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </template>
  </el-page-header>

  <br />

  <el-descriptions
    v-if="opportunity"
    :border="true"
    :column="2"
    direction="horizontal"
  >
    <el-descriptions-item label="Name">
      <strong>{{ opportunity.name }}</strong>
    </el-descriptions-item>

    <el-descriptions-item label="Customer">
      <a
        class="text-green-500 hover:underline cursor-pointer"
        @click="navigateTo(`/crm/customers/${opportunity.customerId}`)"
      >
        <strong>{{ opportunity.Customer?.name }}</strong>
      </a>
    </el-descriptions-item>

    <el-descriptions-item label="Stage">
      <StatusTag :status="opportunity?.stage" effect="dark" />
    </el-descriptions-item>

    <el-descriptions-item label="Company">
      {{ opportunity.Company?.name || "-" }}
    </el-descriptions-item>

    <el-descriptions-item label="Amount">
      <span class="font-mono font-semibold text-lg">
        {{ toCurrency(opportunity.amount.toString()) }}
      </span>
    </el-descriptions-item>

    <el-descriptions-item label="Probability">
      <el-progress
        :percentage="opportunity.probability || 0"
        :color="
          opportunity.probability >= 75
            ? '#67c23a'
            : opportunity.probability >= 50
              ? '#e6a23c'
              : '#f56c6c'
        "
      />
    </el-descriptions-item>

    <el-descriptions-item label="Assigned User">
      {{ opportunity.User?.name || "-" }}
    </el-descriptions-item>

    <el-descriptions-item label="Expected Close Date">
      <strong>{{ formatDateLong(opportunity.expectedCloseDate) }}</strong>
    </el-descriptions-item>

    <el-descriptions-item
      label="Description"
      :span="2"
      v-if="opportunity.description"
    >
      {{ opportunity.description }}
    </el-descriptions-item>

    <el-descriptions-item label="Created At">
      {{ formatDateLong(opportunity.createdAt) }}
    </el-descriptions-item>

    <el-descriptions-item label="Updated At">
      {{ formatDateLong(opportunity.updatedAt) }}
    </el-descriptions-item>

    <el-descriptions-item
      label="Actual Close Date"
      :span="2"
      v-if="opportunity.actualCloseDate"
    >
      <strong>{{ formatDateLong(opportunity.actualCloseDate) }}</strong>
    </el-descriptions-item>

    <el-descriptions-item
      label="Lost Reason"
      :span="2"
      v-if="opportunity.lostReason"
    >
      <el-text type="danger">{{ opportunity.lostReason }}</el-text>
    </el-descriptions-item>
  </el-descriptions>

  <br />

  <el-tabs v-if="opportunity" v-loading="isLoading">
    <el-tab-pane label="INTERACTIONS">
      <InteractionsTab :opportunityId="opportunityId" />
    </el-tab-pane>

    <el-tab-pane label="TASKS">
      <TasksTab :opportunityId="opportunityId" />
    </el-tab-pane>

    <el-tab-pane label="QUOTATIONS">
      <QuotationsTab :opportunityId="opportunityId" />
    </el-tab-pane>

    <el-tab-pane label="ORDERS" v-if="opportunity.stage === 'Closed_Won'">
      <OrdersTab :opportunityId="opportunityId" />
    </el-tab-pane>
  </el-tabs>

  <OpportunityForm />
</template>

<script setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";

const route = useRoute();
const request = useRequest();
const queryClient = useQueryClient();
const opportunityId = computed(() => route.params.id);

// Fetch opportunity data
const {
  data: opportunity,
  isPending: isLoading,
  refetch,
} = useQuery({
  queryKey: ["opportunity", opportunityId],
  queryFn: async () => {
    return await request(`/api/opportunities/${opportunityId.value}`);
  },
  enabled: computed(() => !!opportunityId.value),
});

// Form handling
const { openForm } = useCrud({
  url: "/api/opportunities",
  queryKey: "opportunities",
});

const openEditForm = () => {
  if (opportunity.value) {
    openForm(opportunity.value);
  }
};

const goBack = () => {
  navigateTo("/crm/opportunities");
};

// Update stage
const updateStage = (stage) => {
  request(`/api/opportunities/${opportunityId.value}`, {
    method: "PATCH",
    body: { stage },
  })
    .then(() => {
      ElMessage.success(`Opportunity marked as ${stage.replace("_", " ")}`);
      refetch();
      queryClient.invalidateQueries(["opportunities"]);
    })
    .catch(() => {
      ElMessage.error("Failed to update opportunity stage");
    });
};

// Mark as won
const markAsWon = () => {
  ElMessageBox.confirm(
    "Are you sure you want to mark this opportunity as won?",
    "Confirm",
    {
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
      type: "success",
    },
  )
    .then(() => {
      return request(`/api/opportunities/${opportunityId.value}`, {
        method: "PATCH",
        body: {
          stage: "Closed_Won",
          actualCloseDate: new Date().toISOString(),
        },
      });
    })
    .then(() => {
      ElMessage.success("Opportunity marked as won!");
      refetch();
      queryClient.invalidateQueries(["opportunities"]);
    })
    .catch((error) => {
      if (error !== "cancel") {
        ElMessage.error("Failed to update opportunity");
      }
    });
};

// Mark as lost
const markAsLost = () => {
  ElMessageBox.prompt("Please enter the reason for losing", "Mark as Lost", {
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    inputPattern: /.+/,
    inputErrorMessage: "Reason is required",
  })
    .then(({ value }) => {
      return request(`/api/opportunities/${opportunityId.value}`, {
        method: "PATCH",
        body: {
          stage: "Closed_Lost",
          actualCloseDate: new Date().toISOString(),
          lostReason: value,
        },
      });
    })
    .then(() => {
      ElMessage.success("Opportunity marked as lost");
      refetch();
      queryClient.invalidateQueries(["opportunities"]);
    })
    .catch((error) => {
      if (error !== "cancel") {
        ElMessage.error("Failed to update opportunity");
      }
    });
};

// Create quotation
const createQuotation = () => {
  navigateTo(`/crm/quotations?opportunityId=${opportunityId.value}`);
};
</script>
