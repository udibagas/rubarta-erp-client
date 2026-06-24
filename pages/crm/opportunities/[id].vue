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
      <el-table :data="opportunity.Interactions" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="Type" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.type" />
          </template>
        </el-table-column>
        <el-table-column label="Date" width="120">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column label="Subject" prop="subject" min-width="200" />
        <el-table-column label="Duration" width="100" align="center">
          <template #default="{ row }">
            {{ row.duration ? `${row.duration} min` : "-" }}
          </template>
        </el-table-column>
        <el-table-column label="User" prop="User.name" width="150" />
        <el-table-column label="Outcome" prop="outcome" min-width="150" />
        <el-table-column width="80" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="navigateTo(`/crm/interactions?id=${row.id}`)"
            >
              View
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="
          !opportunity.Interactions || opportunity.Interactions.length === 0
        "
        description="No interactions found"
      />
    </el-tab-pane>

    <el-tab-pane label="TASKS">
      <el-table :data="opportunity.Tasks" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="Title" prop="title" min-width="200" />
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="Priority" width="100">
          <template #default="{ row }">
            <el-tag
              :type="
                row.priority === 'Urgent'
                  ? 'danger'
                  : row.priority === 'High'
                    ? 'warning'
                    : 'info'
              "
            >
              {{ row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Due Date" width="120">
          <template #default="{ row }">
            {{ formatDate(row.dueDate) }}
          </template>
        </el-table-column>
        <el-table-column label="Assigned To" prop="User.name" width="150" />
        <el-table-column width="80" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="navigateTo(`/crm/tasks?id=${row.id}`)"
            >
              View
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="!opportunity.Tasks || opportunity.Tasks.length === 0"
        description="No tasks found"
      />
    </el-tab-pane>

    <el-tab-pane label="QUOTATIONS">
      <el-table :data="opportunity.Quotations" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="Number" prop="number" width="120" />
        <el-table-column label="Title" prop="title" min-width="200" />
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="Grand Total" width="150" align="right">
          <template #default="{ row }">
            <strong>{{ toCurrency(row.grandTotal.toString()) }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="Valid Until" width="120">
          <template #default="{ row }">
            {{ formatDate(row.validUntil) }}
          </template>
        </el-table-column>
        <el-table-column label="User" prop="User.name" width="150" />
        <el-table-column width="80" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="navigateTo(`/crm/quotations?id=${row.id}`)"
            >
              View
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="!opportunity.Quotations || opportunity.Quotations.length === 0"
        description="No quotations found"
      />
    </el-tab-pane>

    <el-tab-pane label="ORDERS" v-if="opportunity.stage === 'Closed_Won'">
      <el-table :data="opportunity.Orders" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="Order Number" prop="orderNumber" width="150" />
        <el-table-column
          label="Description"
          prop="description"
          min-width="200"
        />
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="Total Amount" width="150" align="right">
          <template #default="{ row }">
            <strong>{{ toCurrency(row.totalAmount.toString()) }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="Order Date" width="120">
          <template #default="{ row }">
            {{ formatDate(row.orderDate) }}
          </template>
        </el-table-column>
        <el-table-column width="80" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="navigateTo(`/crm/orders?id=${row.id}`)"
            >
              View
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="!opportunity.Orders || opportunity.Orders.length === 0"
        description="No orders found"
      />
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
