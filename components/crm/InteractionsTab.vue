<template>
  <div class="mb-4 flex justify-end">
    <el-button type="success" :icon="ElIconPlus" @click="handleNewInteraction">
      New Interaction
    </el-button>
  </div>

  <el-table :data="data" stripe v-loading="isPending">
    <el-table-column type="index" label="#" width="50" />
    <el-table-column label="Type & Date" width="150">
      <template #default="{ row }">
        <div>
          <div>
            <StatusTag :status="row.type">
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
          </div>
          <div class="text-sm text-gray-500 mt-1">
            {{ formatDate(row.date) }}
          </div>
        </div>
      </template>
    </el-table-column>
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
    <el-table-column label="Duration" width="100" align="center">
      <template #default="{ row }">
        {{ row.duration ? `${row.duration} min` : "-" }}
      </template>
    </el-table-column>
    <el-table-column label="User" prop="User.name" width="150" />
    <el-table-column label="Outcome" prop="outcome" min-width="150" />
  </el-table>
  <el-empty
    v-if="!data || data.length === 0"
    description="No interactions found"
  />

  <el-dialog
    v-model="showInteractionForm"
    width="750px"
    title="ADD INTERACTION"
    :close-on-click-modal="false"
    @close="interactionFormData = {}"
  >
    <el-form label-width="140px" label-position="left">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="Type" required>
            <el-select
              v-model="interactionFormData.type"
              placeholder="Interaction type"
            >
              <el-option
                v-for="type in interactionTypes"
                :key="type"
                :value="type"
                :label="type"
              />
            </el-select>
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

      <el-form-item label="Date" required>
        <el-date-picker
          v-model="interactionFormData.date"
          type="datetime"
          placeholder="Interaction date"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="Subject" required>
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import {
  Phone,
  Message,
  Calendar,
  Monitor,
  Location,
  Document,
  Refresh,
  More,
} from "@element-plus/icons-vue";
import { interactionTypes } from "~/constants/interactionTypes";

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

const request = useRequest();
const queryClient = useQueryClient();

// Local form state to avoid conflicts with global form store
const showInteractionForm = ref(false);
const interactionFormData = ref({});

const handleNewInteraction = () => {
  const newInteraction = {
    date: new Date().toISOString().slice(0, 19).replace("T", " "),
  };

  if (props.leadId) {
    newInteraction.leadId = props.leadId;
  }

  if (props.opportunityId) {
    newInteraction.opportunityId = props.opportunityId;
  }

  if (props.customerId) {
    newInteraction.customerId = props.customerId;
  }

  interactionFormData.value = newInteraction;
  showInteractionForm.value = true;
};

const { mutate: saveInteractionMutation, isPending: isSaving } = useMutation({
  mutationFn: (data) => {
    return request("/api/interactions", { method: "POST", body: data });
  },
  onSuccess: () => {
    showInteractionForm.value = false;
    interactionFormData.value = {};
    queryClient.invalidateQueries({ queryKey: ["interactions"] });
    ElMessage({
      message: "Interaction saved successfully",
      type: "success",
      showClose: true,
    });
  },
  onError: (error) => {
    ElMessage({
      message: error.message || "Failed to save interaction",
      type: "error",
      showClose: true,
    });
  },
});

const saveInteraction = () => {
  saveInteractionMutation(interactionFormData.value);
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
</script>
