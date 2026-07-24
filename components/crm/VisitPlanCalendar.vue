<template>
  <div v-loading="loading">
    <el-calendar v-model="calendarDate">
      <template #date-cell="{ data }">
        <div class="calendar-day">
          <div class="calendar-day-number">
            <span>{{ dayjs(data.date).format("D") }}</span>
            <el-button
              :icon="ElIconPlus"
              size="small"
              circle
              class="add-event-btn"
              @click.stop="$emit('add-event', data.date)"
            />
          </div>
          <div class="calendar-events">
            <div
              v-for="visit in getVisitsForDate(data.date)"
              :key="visit.id"
              class="calendar-event"
              :class="`calendar-event-${visit.status.toLowerCase()}`"
              @click="$emit('open-detail', visit)"
            >
              <div class="flex items-center gap-1">
                <el-icon :size="12">
                  <ElIconClock v-if="visit.status === 'Planned'" />
                  <ElIconCircleCheck v-else-if="visit.status === 'Completed'" />
                  <ElIconCircleClose v-else-if="visit.status === 'Cancelled'" />
                </el-icon>
                <el-icon v-if="visit.visitType === 'Online'" :size="12">
                  <ElIconVideoCamera />
                </el-icon>
                <span class="text-xs font-semibold truncate">{{
                  visit.title
                }}</span>
              </div>
              <div class="text-xs text-gray-600 truncate">
                {{ visit.Customer?.name }}
              </div>
              <div v-if="visit.scheduledTime" class="text-xs text-gray-500">
                {{ visit.scheduledTime }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-calendar>
  </div>
</template>

<script setup>
import dayjs from "dayjs";

const props = defineProps({
  visits: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: Date,
    default: () => new Date(),
  },
});

const emit = defineEmits(["add-event", "open-detail", "update:modelValue"]);

const calendarDate = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// Get visits for a specific date
const getVisitsForDate = (date) => {
  if (!props.visits?.length) return [];
  const targetDate = dayjs(date).format("YYYY-MM-DD");
  return props.visits.filter((visit) => {
    const visitDate = dayjs(visit.scheduledDate).format("YYYY-MM-DD");
    return visitDate === targetDate;
  });
};
</script>

<style scoped>
.calendar-day {
  min-height: 100px;
  padding: 4px;
}

.calendar-day-number {
  font-weight: 600;
  color: #606266;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-event-btn {
  opacity: 0;
  transition: opacity 0.2s;
  width: 20px;
  height: 20px;
  padding: 0;
}

.calendar-day:hover .add-event-btn {
  opacity: 1;
}

.calendar-events {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calendar-event {
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid;
}

.calendar-event:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.calendar-event-planned {
  background-color: #fef3e8;
  border-left-color: #e6a23c;
}

.calendar-event-completed {
  background-color: #f0f9ff;
  border-left-color: #67c23a;
}

.calendar-event-cancelled {
  background-color: #fef0f0;
  border-left-color: #f56c6c;
}

:deep(.el-calendar-table .el-calendar-day) {
  height: auto;
  min-height: 100px;
  padding: 0;
}

:deep(.el-calendar__header) {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}
</style>
