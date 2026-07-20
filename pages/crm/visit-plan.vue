<template>
  <el-page-header @back="goBack" content="CRM / Visit Plan">
    <template #extra>
      <div class="flex gap-2">
        <el-radio-group v-model="viewMode" size="default">
          <el-radio-button value="calendar">
            <el-icon><ElIconCalendar /></el-icon>
            Calendar
          </el-radio-button>
          <el-radio-button value="table">
            <el-icon><ElIconList /></el-icon>
            Table
          </el-radio-button>
        </el-radio-group>
        <el-input
          v-if="viewMode === 'table'"
          v-model="keyword"
          placeholder="Search"
          @change="refreshData()"
          clearable
          :prefix-icon="ElIconSearch"
          style="width: 200px"
        />
        <el-button
          :icon="ElIconPlus"
          type="success"
          @click="visitPlanFormRef?.openForm()"
        />
      </div>
    </template>
  </el-page-header>

  <br />

  <!-- Table View -->
  <el-table
    v-if="viewMode === 'table'"
    stripe
    v-loading="isPending"
    :data="data?.data || []"
  >
    <el-table-column type="index" label="#" width="60" />

    <el-table-column label="Title" min-width="200">
      <template #default="{ row }">
        <div>
          <strong>{{ row.title }}</strong>
        </div>
        <div v-if="row.purpose" class="text-sm text-gray-500">
          {{ row.purpose }}
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Scheduled Date" width="150">
      <template #default="{ row }">
        <div>
          <div class="font-semibold text-sm">
            {{ dayjs(row.scheduledDate).fromNow() }}
          </div>
          <div class="text-xs text-gray-500">
            {{ formatDate(row.scheduledDate) }}
            <span v-if="row.scheduledTime"> {{ row.scheduledTime }}</span>
          </div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Customer" width="180">
      <template #default="{ row }">
        <a
          class="text-green-500 hover:underline cursor-pointer font-semibold"
          @click="navigateTo(`/crm/customers/${row.customerId}`)"
        >
          {{ row.Customer?.name }}
        </a>
        <div v-if="row.contactPerson" class="flex flex-col">
          <span class="font-semibold text-sm">{{ row.contactPerson }}</span>
          <span v-if="row.contactPhone" class="text-xs text-gray-500">
            {{ row.contactPhone }}
          </span>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Status" width="140" align="center">
      <template #default="{ row }">
        <StatusTag :status="row.status" effect="dark">
          <template #icon>
            <el-icon>
              <ElIconClock v-if="row.status === 'Planned'" />
              <ElIconCircleCheck v-else-if="row.status === 'Completed'" />
              <ElIconCircleClose v-else-if="row.status === 'Cancelled'" />
            </el-icon>
          </template>
        </StatusTag>
      </template>
    </el-table-column>

    <el-table-column label="Visit Type" width="100" align="center">
      <template #default="{ row }">
        <el-tag
          :type="row.visitType === 'Online' ? 'success' : 'info'"
          size="small"
        >
          {{ row.visitType }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column label="Assigned To" width="180">
      <template #default="{ row }">
        <div v-if="row.User" class="flex items-center gap-2">
          <el-avatar
            class="shrink-0"
            :size="28"
            :style="{ backgroundColor: getAvatarColor(row.User.name) }"
          >
            {{ row.User.name?.charAt(0).toUpperCase() }}
          </el-avatar>
          <span class="font-semibold text-sm">{{ row.User.name }}</span>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Location" min-width="180">
      <template #default="{ row }">
        <div v-if="row.visitType === 'Online'">
          <a
            v-if="row.meetingUrl"
            :href="row.meetingUrl"
            target="_blank"
            class="text-green-500 hover:underline cursor-pointer text-sm"
          >
            <el-icon class="mr-1"><ElIconVideoCamera /></el-icon>
            Join Meeting
          </a>
          <span v-else class="text-gray-400 text-sm">Online</span>
        </div>
        <div v-else class="text-sm">
          {{ row.address || "-" }}
        </div>
      </template>
    </el-table-column>

    <el-table-column width="60" align="center" fixed="right">
      <template #header>
        <el-button link @click="refreshData()" :icon="ElIconRefresh" />
      </template>
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
                @click="visitPlanFormRef?.openForm(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                v-if="row.status === 'Planned'"
                :icon="ElIconCircleCheck"
                @click="markAsCompleted(row.id)"
              >
                Mark as Completed
              </el-dropdown-item>
              <el-dropdown-item
                v-if="row.status === 'Planned'"
                :icon="ElIconCircleClose"
                @click="markAsCancelled(row.id)"
              >
                Mark as Cancelled
              </el-dropdown-item>
              <el-dropdown-item
                :icon="ElIconDelete"
                @click="handleRemove(row.id, remove)"
              >
                Delete
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-table-column>
  </el-table>

  <!-- Calendar View -->
  <div v-else-if="viewMode === 'calendar'" v-loading="isPending">
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
              @click.stop="openFormWithDate(data.date)"
            />
          </div>
          <div class="calendar-events">
            <div
              v-for="visit in getVisitsForDate(data.date)"
              :key="visit.id"
              class="calendar-event"
              :class="`calendar-event-${visit.status.toLowerCase()}`"
              @click="openDetailDialog(visit)"
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

  <!-- Visit Plan Detail Dialog -->
  <el-dialog
    v-model="showDetailDialog"
    title="Visit Plan Details"
    width="700px"
  >
    <div v-if="selectedVisit" class="space-y-4">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Title" :span="2">
          <span class="font-semibold text-lg">{{ selectedVisit.title }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="Status" :span="1">
          <StatusTag :status="selectedVisit.status" effect="dark">
            <template #icon>
              <el-icon>
                <ElIconClock v-if="selectedVisit.status === 'Planned'" />
                <ElIconCircleCheck
                  v-else-if="selectedVisit.status === 'Completed'"
                />
                <ElIconCircleClose
                  v-else-if="selectedVisit.status === 'Cancelled'"
                />
              </el-icon>
            </template>
          </StatusTag>
        </el-descriptions-item>

        <el-descriptions-item label="Visit Type" :span="1">
          <el-tag
            :type="selectedVisit.visitType === 'Online' ? 'success' : 'info'"
          >
            {{ selectedVisit.visitType }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="Scheduled Date" :span="1">
          <div>
            <div class="font-semibold">
              {{ dayjs(selectedVisit.scheduledDate).fromNow() }}
            </div>
            <div class="text-sm text-gray-500">
              {{ formatDate(selectedVisit.scheduledDate) }}
              <span v-if="selectedVisit.scheduledTime">
                {{ selectedVisit.scheduledTime }}
              </span>
            </div>
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="Duration" :span="1">
          <span v-if="selectedVisit.estimatedDuration">
            {{ selectedVisit.estimatedDuration }} minutes
          </span>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item label="Customer" :span="2">
          <a
            v-if="selectedVisit.customerId"
            class="text-green-500 hover:underline cursor-pointer"
            @click="navigateTo(`/crm/customers/${selectedVisit.customerId}`)"
          >
            {{ selectedVisit.Customer?.name }}
          </a>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item label="Contact Person" :span="2">
          <div v-if="selectedVisit.contactPerson" class="flex flex-col">
            <span class="font-semibold">{{ selectedVisit.contactPerson }}</span>
            <span
              v-if="selectedVisit.contactPhone"
              class="text-sm text-gray-500"
            >
              {{ selectedVisit.contactPhone }}
            </span>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item label="Assigned To" :span="2">
          <div v-if="selectedVisit.User" class="flex items-center gap-2">
            <el-avatar
              :size="32"
              :style="{
                backgroundColor: getAvatarColor(selectedVisit.User.name),
              }"
            >
              {{ selectedVisit.User.name?.charAt(0).toUpperCase() }}
            </el-avatar>
            <span class="font-semibold">{{ selectedVisit.User.name }}</span>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item
          v-if="selectedVisit.visitType === 'Online'"
          label="Meeting URL"
          :span="2"
        >
          <a
            v-if="selectedVisit.meetingUrl"
            :href="selectedVisit.meetingUrl"
            target="_blank"
            class="text-green-500 hover:underline"
          >
            <el-icon class="mr-1"><ElIconVideoCamera /></el-icon>
            {{ selectedVisit.meetingUrl }}
          </a>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item
          v-if="selectedVisit.visitType === 'Offline'"
          label="Address"
          :span="2"
        >
          {{ selectedVisit.address || "-" }}
        </el-descriptions-item>

        <el-descriptions-item label="Purpose" :span="2">
          {{ selectedVisit.purpose || "-" }}
        </el-descriptions-item>

        <el-descriptions-item label="Notes" :span="2">
          <div class="whitespace-pre-wrap">
            {{ selectedVisit.notes || "-" }}
          </div>
        </el-descriptions-item>

        <el-descriptions-item
          v-if="selectedVisit.actualVisitDate"
          label="Actual Visit Date"
          :span="2"
        >
          <div>
            {{ formatDate(selectedVisit.actualVisitDate) }}
            {{ formatTime(selectedVisit.actualVisitDate) }}
          </div>
        </el-descriptions-item>

        <el-descriptions-item
          v-if="selectedVisit.outcome"
          label="Outcome"
          :span="2"
        >
          <div class="whitespace-pre-wrap">
            {{ selectedVisit.outcome }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <div class="flex justify-between">
        <div class="flex gap-2">
          <el-button
            v-if="selectedVisit?.status === 'Planned'"
            type="success"
            :icon="ElIconCircleCheck"
            @click="markAsCompletedFromDialog"
          >
            Mark as Completed
          </el-button>
          <el-button
            v-if="selectedVisit?.status === 'Planned'"
            type="danger"
            :icon="ElIconCircleClose"
            @click="markAsCancelledFromDialog"
          >
            Mark as Cancelled
          </el-button>
        </div>
        <div class="flex gap-2">
          <el-button
            type="primary"
            :icon="ElIconEdit"
            @click="openEditFromDialog"
          >
            Edit
          </el-button>
          <el-button @click="showDetailDialog = false">Close</el-button>
        </div>
      </div>
    </template>
  </el-dialog>

  <VisitPlanForm ref="visitPlanFormRef" />
</template>

<script setup>
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const visitPlanFormRef = ref(null);
const request = useRequest();
const viewMode = ref("calendar");
const calendarDate = ref(new Date());
const showDetailDialog = ref(false);
const selectedVisit = ref(null);

const { removeMutation, fetchData, refreshData, handleRemove, keyword } =
  useCrud({
    url: "/api/visit-plans",
    queryKey: "visit-plans",
  });

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();

// Get visits for a specific date
const getVisitsForDate = (date) => {
  if (!data.value?.data) return [];
  const targetDate = dayjs(date).format("YYYY-MM-DD");
  return data.value.data.filter((visit) => {
    const visitDate = dayjs(visit.scheduledDate).format("YYYY-MM-DD");
    return visitDate === targetDate;
  });
};

const goBack = () => {
  navigateTo("/crm/dashboard");
};

const openDetailDialog = (visit) => {
  selectedVisit.value = visit;
  showDetailDialog.value = true;
};

const openFormWithDate = (date) => {
  const formattedDate = dayjs(date).format("YYYY-MM-DDTHH:mm:ssZ");
  visitPlanFormRef.value?.openForm({ scheduledDate: formattedDate });
};

const openEditFromDialog = () => {
  showDetailDialog.value = false;
  visitPlanFormRef.value?.openForm(selectedVisit.value);
};

const markAsCompletedFromDialog = async () => {
  await markAsCompleted(selectedVisit.value.id);
  showDetailDialog.value = false;
};

const markAsCancelledFromDialog = async () => {
  showDetailDialog.value = false;
  await markAsCancelled(selectedVisit.value.id);
};

const markAsCompleted = async (id) => {
  try {
    await request(`/api/visit-plans/${id}`, {
      method: "PATCH",
      body: {
        status: "Completed",
      },
    });
    ElMessage.success("Visit plan marked as completed");
    refreshData();
  } catch (error) {
    ElMessage.error("Failed to update visit plan status");
  }
};

const markAsCancelled = async (id) => {
  ElMessageBox.confirm(
    "Are you sure you want to cancel this visit plan?",
    "Confirm",
    {
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      type: "warning",
    },
  )
    .then(async () => {
      try {
        await request(`/api/visit-plans/${id}`, {
          method: "PATCH",
          body: {
            status: "Cancelled",
          },
        });
        ElMessage.success("Visit plan cancelled");
        refreshData();
      } catch (error) {
        ElMessage.error("Failed to update visit plan status");
      }
    })
    .catch(() => {});
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
