<template>
  <div class="mb-4 flex justify-between items-center gap-4">
    <el-input
      v-model="searchQuery"
      placeholder="Search interactions..."
      clearable
      style="max-width: 300px"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

    <el-button type="success" :icon="ElIconPlus" @click="handleNewInteraction">
      New Interaction
    </el-button>
  </div>

  <el-table :data="filteredData" stripe v-loading="isPending">
    <el-table-column label="Subject" min-width="200">
      <template #default="{ row }">
        <div>
          <strong>{{ row.subject }}</strong>
        </div>
        <div v-if="row.notes" class="text-sm text-gray-500">
          {{ row.notes }}
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Date" width="150">
      <template #default="{ row }">
        <div>
          <div class="font-semibold">{{ dayjs(row.date).fromNow() }}</div>
          <div class="text-xs text-gray-500">
            {{ formatDate(row.date) }} {{ formatTime(row.date) }}
          </div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Type" width="150" align="center">
      <template #default="{ row }">
        <StatusTag :status="row.type" size="medium">
          <template #icon>
            <el-icon>
              <Phone v-if="row.type === 'Call'" />
              <Message v-else-if="row.type === 'Email'" />
              <Calendar v-else-if="row.type === 'Meeting'" />
              <Monitor v-else-if="row.type === 'Demo'" />
              <Location v-else-if="row.type === 'SiteVisit'" />
              <Document v-else-if="row.type === 'Presentation'" />
              <Refresh v-else-if="row.type === 'FollowUp'" />
              <More v-else />
            </el-icon>
          </template>
        </StatusTag>
      </template>
    </el-table-column>

    <el-table-column label="Duration" width="100" align="center">
      <template #default="{ row }">
        {{ row.duration ? `${row.duration} min` : "-" }}
      </template>
    </el-table-column>
    <el-table-column label="User" prop="User.name" width="150" />
    <el-table-column label="Outcome" prop="outcome" min-width="150" />
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
                :icon="ElIconEdit"
                @click="handleEditInteraction(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                :icon="ElIconDelete"
                @click="handleDeleteInteraction(row.id)"
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
        ? 'No interactions match your search'
        : 'No interactions found'
    "
  />

  <el-dialog
    v-model="showInteractionForm"
    width="750px"
    :title="interactionFormData.id ? 'EDIT INTERACTION' : 'ADD INTERACTION'"
    :close-on-click-modal="false"
    @close="interactionFormData = {}"
  >
    <el-form label-width="140px" label-position="left">
      <el-form-item label="Type" required :error="errors.type">
        <el-select
          v-model="interactionFormData.type"
          placeholder="Select interaction type"
        >
          <template #prefix>
            <el-icon>
              <Phone v-if="interactionFormData.type === 'Call'" />
              <Message v-else-if="interactionFormData.type === 'Email'" />
              <Calendar v-else-if="interactionFormData.type === 'Meeting'" />
              <Monitor v-else-if="interactionFormData.type === 'Demo'" />
              <Location v-else-if="interactionFormData.type === 'SiteVisit'" />
              <Document
                v-else-if="interactionFormData.type === 'Presentation'"
              />
              <Refresh v-else-if="interactionFormData.type === 'FollowUp'" />
              <More v-else />
            </el-icon>
          </template>
          <el-option
            v-for="type in interactionTypes"
            :key="type"
            :value="type"
            :label="type"
          >
            <div style="display: flex; align-items: center">
              <el-icon style="margin-right: 8px">
                <Phone v-if="type === 'Call'" />
                <Message v-else-if="type === 'Email'" />
                <Calendar v-else-if="type === 'Meeting'" />
                <Monitor v-else-if="type === 'Demo'" />
                <Location v-else-if="type === 'SiteVisit'" />
                <Document v-else-if="type === 'Presentation'" />
                <Refresh v-else-if="type === 'FollowUp'" />
                <More v-else />
              </el-icon>
              <span>{{ type }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="User" required :error="errors.userId">
        <el-select
          v-model="interactionFormData.userId"
          placeholder="Select user"
          filterable
        >
          <el-option
            v-for="user in users"
            :key="user.id"
            :value="user.id"
            :label="user.name"
          />
        </el-select>
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="Date" required :error="errors.date">
            <el-date-picker
              v-model="interactionFormData.date"
              type="datetime"
              placeholder="Interaction date"
              value-format="YYYY-MM-DDTHH:mm:ssZ"
              format="DD-MMM-YYYY HH:mm"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Duration (mins)">
            <el-input-number
              v-model="interactionFormData.duration"
              :min="0"
              placeholder="Duration in minutes"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Subject" required :error="errors.subject">
        <el-input
          placeholder="Interaction subject"
          v-model="interactionFormData.subject"
        />
      </el-form-item>

      <el-form-item label="Notes">
        <el-input
          type="textarea"
          :rows="3"
          placeholder="Detailed notes"
          v-model="interactionFormData.notes"
        />
      </el-form-item>

      <el-form-item label="Outcome">
        <el-input
          placeholder="Outcome of the interaction"
          v-model="interactionFormData.outcome"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="showInteractionForm = false"> CANCEL </el-button>
      <el-button type="success" @click="saveInteraction"> SAVE </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Phone,
  Message,
  Calendar,
  Monitor,
  Location,
  Document,
  Refresh,
  More,
  Search,
} from "@element-plus/icons-vue";
import { interactionTypes } from "~/constants/interactionTypes";

dayjs.extend(relativeTime);

const props = defineProps({
  leadId: {
    type: [String, Number],
    required: false,
  },
  opportunityId: {
    type: [String, Number],
    required: false,
  },
  customerId: {
    type: [String, Number],
    required: false,
  },
});

const errors = ref({});

const request = useRequest();
const queryClient = useQueryClient();

// Search functionality
const searchQuery = ref("");

// Local form state to avoid conflicts with global form store
const showInteractionForm = ref(false);
const interactionFormData = ref({});

const handleNewInteraction = () => {
  const newInteraction = {
    date: new Date().toISOString(),
  };

  if (props.leadId) {
    newInteraction.leadId = +props.leadId;
  }

  if (props.opportunityId) {
    newInteraction.opportunityId = +props.opportunityId;
  }

  interactionFormData.value = newInteraction;
  showInteractionForm.value = true;
};

const handleEditInteraction = (interaction) => {
  interactionFormData.value = { ...interaction };
  showInteractionForm.value = true;
};

const handleDeleteInteraction = (id) => {
  ElMessageBox.confirm(
    "Are you sure you want to delete this interaction?",
    "Warning",
    {
      type: "warning",
    },
  )
    .then(async () => {
      try {
        await request(`/api/interactions/${id}`, { method: "DELETE" });
        queryClient.invalidateQueries({ queryKey: ["interactions"] });
        ElMessage({
          message: "Interaction deleted successfully",
          type: "success",
          showClose: true,
        });
      } catch (error) {
        ElMessage({
          message: error.message || "Failed to delete interaction",
          type: "error",
          showClose: true,
        });
      }
    })
    .catch(() => {});
};

const isSaving = ref(false);

const saveInteraction = async () => {
  try {
    isSaving.value = true;
    const data = interactionFormData.value;

    if (data.id) {
      await request(`/api/interactions/${data.id}`, {
        method: "PATCH",
        body: data,
      });
    } else {
      await request("/api/interactions", {
        method: "POST",
        body: data,
      });
    }

    showInteractionForm.value = false;
    interactionFormData.value = {};
    queryClient.invalidateQueries({ queryKey: ["interactions"] });
    ElMessage({
      message: "Interaction saved successfully",
      type: "success",
      showClose: true,
    });
  } catch (error) {
    errors.value = parseError(error);
    console.error("Error saving interaction:", errors.value);

    ElMessage({
      message: error.message || "Failed to save interaction",
      type: "error",
      showClose: true,
    });
  } finally {
    isSaving.value = false;
  }
};

const { data, isPending } = useQuery({
  queryKey: ["interactions", props],
  queryFn: async () => {
    const params = new URLSearchParams();
    if (props.leadId) {
      params.append("leadId", props.leadId);
    }

    if (props.opportunityId) {
      params.append("opportunityId", props.opportunityId);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    return await request(`/api/interactions${query}`);
  },
  enabled: computed(() => !!(props.leadId || props.opportunityId)),
});

// Fetch users for the select dropdown
const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: async () => {
    return await request("/api/users");
  },
});

// Filter data based on search query
const filteredData = computed(() => {
  if (!data.value || !Array.isArray(data.value)) return [];

  if (!searchQuery.value) return data.value;

  const query = searchQuery.value.toLowerCase();
  return data.value.filter((interaction) => {
    return (
      interaction.subject?.toLowerCase().includes(query) ||
      interaction.notes?.toLowerCase().includes(query) ||
      interaction.outcome?.toLowerCase().includes(query) ||
      interaction.User?.name?.toLowerCase().includes(query) ||
      interaction.type?.toLowerCase().includes(query)
    );
  });
});
</script>
