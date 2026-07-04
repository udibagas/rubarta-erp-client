<template>
  <el-page-header
    @back="goBack"
    :content="`CRM / Interactions / ${interaction?.type || ''}`"
  >
    <template #extra>
      <div class="flex gap-2">
        <el-button :icon="ElIconRefresh" @click="refetch" v-if="interaction" />
        <el-dropdown v-if="interaction" trigger="click">
          <el-button type="primary" :icon="ElIconMore"> Actions </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="ElIconEdit" @click="openEditForm">
                Edit Interaction
              </el-dropdown-item>
              <el-dropdown-item :icon="ElIconDelete" @click="handleDelete">
                Delete Interaction
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </template>
  </el-page-header>

  <br />

  <el-descriptions
    v-if="interaction"
    :border="true"
    :column="2"
    direction="horizontal"
  >
    <el-descriptions-item label="Type">
      <StatusTag :status="interaction.type" effect="dark">
        <template #icon>
          <el-icon>
            <ElIconPhone v-if="interaction.type === 'Call'" />
            <ElIconMessage v-else-if="interaction.type === 'Email'" />
            <ElIconCalendar v-else-if="interaction.type === 'Meeting'" />
            <ElIconMonitor v-else-if="interaction.type === 'Demo'" />
            <ElIconLocation v-else-if="interaction.type === 'SiteVisit'" />
            <ElIconDocument v-else-if="interaction.type === 'Presentation'" />
            <ElIconRefresh v-else-if="interaction.type === 'FollowUp'" />
            <ElIconMore v-else />
          </el-icon>
        </template>
      </StatusTag>
    </el-descriptions-item>

    <el-descriptions-item label="User">
      <div style="display: flex; align-items: center; gap: 10px">
        <el-avatar
          :size="32"
          :style="{ backgroundColor: getAvatarColor(interaction.User?.name) }"
        >
          {{ interaction.User?.name?.charAt(0) }}
        </el-avatar>
        <span>{{ interaction.User?.name || "-" }}</span>
      </div>
    </el-descriptions-item>

    <el-descriptions-item label="Date">
      <div>
        <div class="font-semibold">{{ dayjs(interaction.date).fromNow() }}</div>
        <div class="text-xs text-gray-500">
          {{ formatDateLong(interaction.date) }}
        </div>
      </div>
    </el-descriptions-item>

    <el-descriptions-item label="Duration">
      {{ interaction.duration ? `${interaction.duration} minutes` : "-" }}
    </el-descriptions-item>

    <el-descriptions-item label="Lead" v-if="interaction.Lead">
      <a
        class="text-green-500 hover:underline cursor-pointer"
        @click="navigateTo(`/crm/leads/${interaction.leadId}`)"
      >
        {{ interaction.Lead.title || interaction.Lead.Customer?.name }}
      </a>
    </el-descriptions-item>

    <el-descriptions-item label="Opportunity" v-if="interaction.Opportunity">
      <a
        class="text-green-500 hover:underline cursor-pointer"
        @click="navigateTo(`/crm/opportunities/${interaction.opportunityId}`)"
      >
        {{ interaction.Opportunity.name }}
      </a>
    </el-descriptions-item>

    <el-descriptions-item label="Customer" v-if="interaction.Customer">
      <a
        class="text-green-500 hover:underline cursor-pointer"
        @click="navigateTo(`/crm/customers/${interaction.customerId}`)"
      >
        {{ interaction.Customer.name }}
      </a>
    </el-descriptions-item>

    <el-descriptions-item label="Notes" :span="2" v-if="interaction.notes">
      {{ interaction.notes }}
    </el-descriptions-item>

    <el-descriptions-item label="Outcome" :span="2" v-if="interaction.outcome">
      {{ interaction.outcome }}
    </el-descriptions-item>

    <el-descriptions-item label="Created At">
      <div>
        <div class="font-semibold">
          {{ dayjs(interaction.createdAt).fromNow() }}
        </div>
        <div class="text-xs text-gray-500">
          {{ formatDateLong(interaction.createdAt) }}
          {{ formatTime(interaction.createdAt) }}
        </div>
      </div>
    </el-descriptions-item>

    <el-descriptions-item label="Updated At">
      <div>
        <div class="font-semibold">
          {{ dayjs(interaction.updatedAt).fromNow() }}
        </div>
        <div class="text-xs text-gray-500">
          {{ formatDateLong(interaction.updatedAt) }}
          {{ formatTime(interaction.updatedAt) }}
        </div>
      </div>
    </el-descriptions-item>
  </el-descriptions>

  <InteractionForm />
</template>

<script setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getAvatarColor } from "~/utils/avatar";

dayjs.extend(relativeTime);

const route = useRoute();
const request = useRequest();
const queryClient = useQueryClient();
const interactionId = computed(() => route.params.id);

// Fetch interaction data
const {
  data: interaction,
  isPending: isLoading,
  refetch,
} = useQuery({
  queryKey: ["interaction", interactionId],
  queryFn: async () => {
    return await request(`/api/interactions/${interactionId.value}`);
  },
  enabled: computed(() => !!interactionId.value),
});

// Form handling
const { openForm } = useCrud({
  url: "/api/interactions",
  queryKey: "interactions",
});

const openEditForm = () => {
  if (interaction.value) {
    openForm(interaction.value);
  }
};

const goBack = () => {
  navigateTo("/crm/interactions");
};

// Delete interaction
const handleDelete = () => {
  ElMessageBox.confirm(
    "Are you sure you want to delete this interaction?",
    "Warning",
    {
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
      type: "warning",
    },
  )
    .then(() => {
      return request(`/api/interactions/${interactionId.value}`, {
        method: "DELETE",
      });
    })
    .then(() => {
      ElMessage.success("Interaction deleted successfully!");
      queryClient.invalidateQueries(["interactions"]);
      navigateTo("/crm/interactions");
    })
    .catch((error) => {
      if (error !== "cancel") {
        ElMessage.error("Failed to delete interaction");
      }
    });
};
</script>
