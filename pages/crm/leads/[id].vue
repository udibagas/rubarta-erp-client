<template>
  <el-page-header
    @back="goBack"
    :content="`CRM / Leads / ${lead?.Customer?.name || ''}`"
  >
    <template #extra>
      <div class="flex gap-2">
        <el-button :icon="ElIconRefresh" @click="refetch" v-if="lead" />
        <el-dropdown v-if="lead" trigger="click">
          <el-button type="primary" :icon="ElIconMore"> Actions </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="ElIconEdit" @click="openEditForm">
                Edit Lead
              </el-dropdown-item>
              <el-dropdown-item
                v-if="lead.status !== 'Converted'"
                :icon="ElIconCheck"
                @click="convertToOpportunity"
              >
                Convert to Opportunity
              </el-dropdown-item>
              <el-dropdown-item
                v-if="lead.status !== 'Converted'"
                :icon="ElIconClose"
                @click="markAsUnqualified"
              >
                Mark as Unqualified
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
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
      <StatusTag :status="lead?.status" effect="dark" />
    </el-descriptions-item>

    <el-descriptions-item label="Source">
      <el-tag>{{ lead.source }}</el-tag>
    </el-descriptions-item>

    <el-descriptions-item label="Assigned User">
      {{ lead.User?.name || "-" }}
    </el-descriptions-item>

    <el-descriptions-item label="Estimated Value">
      <span class="font-mono font-semibold text-green-500">
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
      <div>
        <div class="font-semibold">{{ dayjs(lead.createdAt).fromNow() }}</div>
        <div class="text-xs text-gray-500">
          {{ formatDateLong(lead.createdAt) }} {{ formatTime(lead.createdAt) }}
        </div>
      </div>
    </el-descriptions-item>

    <el-descriptions-item label="Updated At">
      <div>
        <div class="font-semibold">{{ dayjs(lead.updatedAt).fromNow() }}</div>
        <div class="text-xs text-gray-500">
          {{ formatDateLong(lead.updatedAt) }} {{ formatTime(lead.updatedAt) }}
        </div>
      </div>
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

  <el-tabs>
    <el-tab-pane label="INTERACTIONS">
      <CrmInteractionsTab :lead-id="leadId" :customer-id="lead.customerId" />
    </el-tab-pane>

    <el-tab-pane label="TASKS">
      <CrmTasksTab :lead-id="leadId" />
    </el-tab-pane>

    <el-tab-pane label="OPPORTUNITIES" v-if="lead?.status === 'Converted'">
      <CrmOpportunitiesTab :lead-id="leadId" />
    </el-tab-pane>
  </el-tabs>

  <LeadForm />
</template>

<script setup>
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

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
