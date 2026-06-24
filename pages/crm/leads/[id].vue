<template>
  <el-page-header
    @back="goBack"
    :content="`CRM / Leads / ${lead?.Customer?.name || ''}`"
  >
    <template #extra>
      <el-button
        :icon="ElIconEdit"
        type="success"
        @click="openEditForm"
        v-if="lead"
      >
        Edit
      </el-button>
      <el-button :icon="ElIconRefresh" @click="refetch" v-if="lead" />
    </template>
  </el-page-header>

  <br />

  <el-descriptions
    v-if="lead"
    :border="true"
    :column="2"
    direction="horizontal"
  >
    <el-descriptions-item label="Customer">
      <strong>
        <a
          class="text-green-500 hover:underline cursor-pointer"
          @click="navigateTo(`/crm/customers/${lead.customerId}`)"
        >
          {{ lead.Customer?.name }}
        </a>
      </strong>
    </el-descriptions-item>

    <el-descriptions-item label="Company">
      {{ lead.Company?.name || "-" }}
    </el-descriptions-item>

    <el-descriptions-item label="Status">
      <StatusTag :status="lead.status" effect="dark" />
    </el-descriptions-item>

    <el-descriptions-item label="Source">
      <el-tag>{{ lead.source }}</el-tag>
    </el-descriptions-item>

    <el-descriptions-item label="Assigned User">
      {{ lead.User?.name || "-" }}
    </el-descriptions-item>

    <el-descriptions-item label="Estimated Value">
      <span class="font-mono font-semibold">
        {{
          lead.estimatedValue ? toCurrency(lead.estimatedValue.toString()) : "-"
        }}
      </span>
    </el-descriptions-item>

    <el-descriptions-item label="Title" :span="2" v-if="lead.title">
      <strong>{{ lead.title }}</strong>
    </el-descriptions-item>

    <el-descriptions-item label="Notes" :span="2" v-if="lead.notes">
      {{ lead.notes }}
    </el-descriptions-item>

    <el-descriptions-item label="Created At">
      {{ formatDateLong(lead.createdAt) }}
    </el-descriptions-item>

    <el-descriptions-item label="Updated At">
      {{ formatDateLong(lead.updatedAt) }}
    </el-descriptions-item>

    <el-descriptions-item
      label="Converted Date"
      :span="2"
      v-if="lead.convertedDate"
    >
      {{ formatDateLong(lead.convertedDate) }}
    </el-descriptions-item>
  </el-descriptions>

  <br />

  <el-card v-if="lead.status !== 'Converted'">
    <template #header>
      <h3>Actions</h3>
    </template>
    <div class="flex gap-2">
      <el-button
        type="primary"
        :icon="ElIconCheck"
        @click="convertToOpportunity"
      >
        Convert to Opportunity
      </el-button>
      <el-button type="warning" :icon="ElIconClose" @click="markAsUnqualified">
        Mark as Unqualified
      </el-button>
    </div>
  </el-card>

  <br v-if="lead.status !== 'Converted'" />

  <el-tabs>
    <el-tab-pane label="INTERACTIONS">
      <el-table :data="lead.Interactions" stripe>
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
        v-if="!lead.Interactions || lead.Interactions.length === 0"
        description="No interactions found"
      />
    </el-tab-pane>

    <el-tab-pane label="TASKS">
      <el-table :data="lead.Tasks" stripe>
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
        v-if="!lead.Tasks || lead.Tasks.length === 0"
        description="No tasks found"
      />
    </el-tab-pane>

    <el-tab-pane label="OPPORTUNITIES" v-if="lead.status === 'Converted'">
      <el-table :data="lead.Opportunities" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="Name" prop="name" min-width="200" />
        <el-table-column label="Stage" width="150">
          <template #default="{ row }">
            <StatusTag :status="row.stage" />
          </template>
        </el-table-column>
        <el-table-column label="Amount" width="150" align="right">
          <template #default="{ row }">
            <strong>{{ toCurrency(row.amount.toString()) }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="Probability" width="100" align="center">
          <template #default="{ row }"> {{ row.probability }}% </template>
        </el-table-column>
        <el-table-column label="Expected Close" width="120">
          <template #default="{ row }">
            {{ formatDate(row.expectedCloseDate) }}
          </template>
        </el-table-column>
        <el-table-column width="80" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="navigateTo(`/crm/opportunities?id=${row.id}`)"
            >
              View
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="!lead.Opportunities || lead.Opportunities.length === 0"
        description="No opportunities found"
      />
    </el-tab-pane>
  </el-tabs>

  <LeadForm />
</template>

<script setup>
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";

const route = useRoute();
const request = useRequest();
const queryClient = useQueryClient();
const leadId = computed(() => route.params.id);

// Fetch lead data
const {
  data: lead,
  isPending: isLoading,
  refetch,
} = useQuery({
  queryKey: ["lead", leadId],
  queryFn: async () => {
    return await request(`/api/leads/${leadId.value}`);
  },
  enabled: computed(() => !!leadId.value),
});

// Form handling
const { openForm } = useCrud({
  url: "/api/leads",
  queryKey: "leads",
});

const openEditForm = () => {
  if (lead.value) {
    openForm(lead.value);
  }
};

const goBack = () => {
  navigateTo("/crm/leads");
};

// Convert to opportunity
const convertToOpportunity = () => {
  ElMessageBox.prompt("Enter opportunity name", "Convert to Opportunity", {
    confirmButtonText: "Convert",
    cancelButtonText: "Cancel",
    inputPattern: /.+/,
    inputErrorMessage: "Opportunity name is required",
  })
    .then(({ value }) => {
      return request(`/api/leads/${leadId.value}/convert`, {
        method: "POST",
        body: {
          name: value,
          amount: lead.value.estimatedValue || 0,
        },
      });
    })
    .then(() => {
      ElMessage.success("Lead converted to opportunity successfully!");
      refetch();
      queryClient.invalidateQueries(["leads"]);
    })
    .catch((error) => {
      if (error !== "cancel") {
        ElMessage.error("Failed to convert lead");
      }
    });
};

// Mark as unqualified
const markAsUnqualified = () => {
  ElMessageBox.confirm(
    "Are you sure you want to mark this lead as unqualified?",
    "Warning",
    {
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
      type: "warning",
    },
  )
    .then(() => {
      return request(`/api/leads/${leadId.value}`, {
        method: "PATCH",
        body: {
          status: "Unqualified",
        },
      });
    })
    .then(() => {
      ElMessage.success("Lead marked as unqualified");
      refetch();
      queryClient.invalidateQueries(["leads"]);
    })
    .catch((error) => {
      if (error !== "cancel") {
        ElMessage.error("Failed to update lead status");
      }
    });
};
</script>
