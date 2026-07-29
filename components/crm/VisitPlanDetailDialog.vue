<template>
  <el-dialog v-model="visible" title="Visit Plan Details" width="700px">
    <div v-if="visit" class="space-y-4">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Title" :span="2">
          <span class="font-semibold text-lg">{{ visit.title }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="Status" :span="1">
          <StatusTag :status="visit.status" effect="dark">
            <template #icon>
              <el-icon>
                <ElIconClock v-if="visit.status === 'Planned'" />
                <ElIconCircleCheck v-else-if="visit.status === 'Completed'" />
                <ElIconCircleClose v-else-if="visit.status === 'Cancelled'" />
              </el-icon>
            </template>
          </StatusTag>
        </el-descriptions-item>

        <el-descriptions-item label="Visit Type" :span="1">
          <el-tag :type="visit.visitType === 'Online' ? 'success' : 'info'">
            {{ visit.visitType }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="Scheduled Date" :span="1">
          <div>
            <div class="font-semibold">
              {{ dayjs(visit.scheduledDate).fromNow() }}
            </div>
            <div class="text-sm text-gray-500">
              {{ formatDate(visit.scheduledDate) }}
              <span v-if="visit.scheduledTime">
                {{ visit.scheduledTime }}
              </span>
            </div>
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="Duration" :span="1">
          <span v-if="visit.estimatedDuration">
            {{ visit.estimatedDuration }} minutes
          </span>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item label="Customer" :span="2">
          <a
            v-if="visit.customerId"
            class="text-green-500 hover:underline cursor-pointer"
            @click="handleNavigateToCustomer"
          >
            {{ visit.Customer?.name }}
          </a>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item label="Contact Person" :span="2">
          <div v-if="visit.contactPerson" class="flex flex-col">
            <span class="font-semibold">{{ visit.contactPerson }}</span>
            <span v-if="visit.contactPhone" class="text-sm text-gray-500">
              {{ visit.contactPhone }}
            </span>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item label="Assigned To" :span="2">
          <div v-if="visit.User" class="flex items-center gap-2">
            <el-avatar
              size="small"
              :style="{
                backgroundColor: getAvatarColor(visit.User.name),
              }"
            >
              {{ visit.User.name?.charAt(0).toUpperCase() }}
            </el-avatar>
            <span class="font-semibold">{{ visit.User.name }}</span>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item
          v-if="visit.visitType === 'Online'"
          label="Meeting URL"
          :span="2"
        >
          <el-link
            v-if="visit.meetingUrl"
            :href="visit.meetingUrl"
            target="_blank"
            type="success"
            :icon="ElIconVideoCamera"
          >
            &nbsp; {{ visit.meetingUrl }}
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item
          v-if="visit.visitType === 'Offline'"
          label="Address"
          :span="2"
        >
          {{ visit.address || "-" }}
        </el-descriptions-item>

        <el-descriptions-item label="Purpose" :span="2">
          {{ visit.purpose || "-" }}
        </el-descriptions-item>

        <el-descriptions-item label="Notes" :span="2">
          <div class="whitespace-pre-wrap">
            {{ visit.notes || "-" }}
          </div>
        </el-descriptions-item>

        <el-descriptions-item
          v-if="visit.actualVisitDate"
          label="Actual Visit Date"
          :span="2"
        >
          <div>
            {{ formatDate(visit.actualVisitDate) }}
            {{ formatTime(visit.actualVisitDate) }}
          </div>
        </el-descriptions-item>

        <el-descriptions-item v-if="visit.outcome" label="Outcome" :span="2">
          <div class="whitespace-pre-wrap">
            {{ visit.outcome }}
          </div>
        </el-descriptions-item>

        <el-descriptions-item
          v-if="visit.cancelReason"
          label="Cancellation Reason"
          :span="2"
        >
          <div class="whitespace-pre-wrap">
            {{ visit.cancelReason }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <div class="flex justify-between">
        <div class="flex gap-2">
          <el-button
            v-if="visit?.status === 'Planned'"
            type="success"
            :icon="ElIconCircleCheck"
            @click="$emit('mark-completed', visit.id)"
          >
            Mark as Completed
          </el-button>
          <el-button
            v-if="visit?.status === 'Planned'"
            type="danger"
            :icon="ElIconCircleClose"
            @click="$emit('mark-cancelled', visit.id)"
          >
            Mark as Cancelled
          </el-button>
        </div>
        <div class="flex gap-2">
          <el-button
            type="primary"
            :icon="ElIconEdit"
            @click="$emit('edit', visit)"
          >
            Edit
          </el-button>
          <el-button @click="visible = false" :icon="ElIconCircleClose">
            Close
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const props = defineProps({
  visit: {
    type: Object,
    default: null,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "edit",
  "mark-completed",
  "mark-cancelled",
]);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const handleNavigateToCustomer = () => {
  if (props.visit?.customerId) {
    navigateTo(`/crm/customers/${props.visit.customerId}`);
  }
};
</script>
