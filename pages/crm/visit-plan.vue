<template>
  <el-page-header @back="goBack" content="CRM / Visit Plan">
    <template #extra>
      <div class="flex gap-2">
        <el-radio-group v-model="viewMode" size="default">
          <el-radio-button value="table">
            <el-icon><ElIconList /></el-icon>
            Table
          </el-radio-button>
          <el-radio-button value="calendar">
            <el-icon><ElIconCalendar /></el-icon>
            Calendar
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
    :data="data"
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

    <el-table-column label="Visit Date" width="150">
      <template #default="{ row }">
        <div>
          <div class="font-semibold text-sm">
            {{ dayjs(row.visitDate).fromNow() }}
          </div>
          <div class="text-xs text-gray-500">
            {{ formatDate(row.visitDate) }} {{ formatTime(row.visitDate) }}
          </div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Customer" width="180">
      <template #default="{ row }">
        <a
          class="text-green-500 hover:underline cursor-pointer"
          @click="navigateTo(`/crm/customers/${row.customerId}`)"
        >
          {{ row.Customer?.name }}
        </a>
      </template>
    </el-table-column>

    <el-table-column label="Contact" width="200">
      <template #default="{ row }">
        <div v-if="row.Contact" class="flex items-center gap-2">
          <el-avatar
            :size="28"
            :style="{ backgroundColor: getAvatarColor(row.Contact.name) }"
          >
            {{ row.Contact.name?.charAt(0).toUpperCase() }}
          </el-avatar>
          <div class="flex flex-col">
            <span class="font-semibold text-sm">{{ row.Contact.name }}</span>
            <span v-if="row.Contact.phone" class="text-xs text-gray-500">
              {{ row.Contact.phone }}
            </span>
          </div>
        </div>
        <span v-else class="text-gray-400">-</span>
      </template>
    </el-table-column>

    <el-table-column label="Status" width="120" align="center">
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

    <el-table-column label="Assigned To" width="180">
      <template #default="{ row }">
        <div v-if="row.User" class="flex items-center gap-2">
          <el-avatar
            :size="28"
            :style="{ backgroundColor: getAvatarColor(row.User.name) }"
          >
            {{ row.User.name?.charAt(0).toUpperCase() }}
          </el-avatar>
          <span class="font-semibold text-sm">{{ row.User.name }}</span>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Location" prop="location" min-width="150" />

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
            {{ dayjs(data.date).format("D") }}
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
                <span class="text-xs font-semibold truncate">{{
                  visit.title
                }}</span>
              </div>
              <div class="text-xs text-gray-600 truncate">
                {{ visit.Customer?.name }}
              </div>
              <div class="text-xs text-gray-500">
                {{ formatTime(visit.visitDate) }}
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

        <el-descriptions-item label="Visit Date" :span="1">
          <div>
            <div class="font-semibold">
              {{ dayjs(selectedVisit.visitDate).fromNow() }}
            </div>
            <div class="text-sm text-gray-500">
              {{ formatDate(selectedVisit.visitDate) }}
              {{ formatTime(selectedVisit.visitDate) }}
            </div>
          </div>
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

        <el-descriptions-item label="Contact" :span="2">
          <div v-if="selectedVisit.Contact" class="flex items-center gap-2">
            <el-avatar
              :size="32"
              :style="{
                backgroundColor: getAvatarColor(selectedVisit.Contact.name),
              }"
            >
              {{ selectedVisit.Contact.name?.charAt(0).toUpperCase() }}
            </el-avatar>
            <div class="flex flex-col">
              <span class="font-semibold">{{
                selectedVisit.Contact.name
              }}</span>
              <div class="text-sm text-gray-500">
                <div v-if="selectedVisit.Contact.email">
                  {{ selectedVisit.Contact.email }}
                </div>
                <div v-if="selectedVisit.Contact.phone">
                  {{ selectedVisit.Contact.phone }}
                </div>
              </div>
            </div>
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

        <el-descriptions-item label="Location" :span="2">
          {{ selectedVisit.location || "-" }}
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
import { getAvatarColor } from "~/utils/avatar";

dayjs.extend(relativeTime);

const visitPlanFormRef = ref(null);
const request = useRequest();
const viewMode = ref("table");
const calendarDate = ref(new Date());
const showDetailDialog = ref(false);
const selectedVisit = ref(null);

const { removeMutation, fetchData, refreshData, handleRemove, keyword } =
  useCrud({
    url: "/api/visit-plans",
    queryKey: "visit-plans",
  });

const { isPending, data: apiData } = fetchData();
const { mutate: remove } = removeMutation();

// Dummy data for calendar demonstration
const dummyVisits = ref([
  {
    id: 1001,
    title: "Product Demo - Manufacturing Solutions",
    customerId: 1,
    Customer: { name: "PT Maju Jaya" },
    contactId: 1,
    Contact: { name: "Budi Santoso", phone: "+62 812-3456-7890" },
    userId: 1,
    User: { name: "John Doe" },
    visitDate: "2026-07-07T10:00:00Z",
    status: "Planned",
    location: "Jakarta Office",
    purpose: "Product demonstration and requirements gathering",
    notes: "Bring product catalog and samples",
  },
  {
    id: 1002,
    title: "Contract Negotiation Meeting",
    customerId: 2,
    Customer: { name: "CV Sejahtera" },
    contactId: 2,
    Contact: { name: "Sarah Williams", phone: "+62 821-9876-5432" },
    userId: 2,
    User: { name: "Jane Smith" },
    visitDate: "2026-07-09T14:00:00Z",
    status: "Planned",
    location: "Customer Site - Surabaya",
    purpose: "Discuss contract terms and pricing",
    notes: "Prepare pricing proposal",
  },
  {
    id: 1003,
    title: "Quarterly Business Review",
    customerId: 3,
    Customer: { name: "PT Sukses Makmur" },
    contactId: 3,
    Contact: { name: "Ahmad Hidayat", phone: "+62 813-1111-2222" },
    userId: 1,
    User: { name: "John Doe" },
    visitDate: "2026-07-11T09:00:00Z",
    status: "Completed",
    location: "Bandung Office",
    purpose: "Review Q2 performance and discuss Q3 plans",
    notes: "Client very satisfied with service",
    outcome: "Secured additional order for Q3. Client committed to 20% growth.",
  },
  {
    id: 1004,
    title: "Technical Support Visit",
    customerId: 4,
    Customer: { name: "UD Berkah Jaya" },
    contactId: 4,
    Contact: { name: "Lisa Anderson", phone: "+62 856-7777-8888" },
    userId: 3,
    User: { name: "Mike Johnson" },
    visitDate: "2026-07-14T13:00:00Z",
    status: "Planned",
    location: "Semarang Warehouse",
    purpose: "Troubleshoot installation issues",
    notes: "Bring technical tools and spare parts",
  },
  {
    id: 1005,
    title: "New Customer Onboarding",
    customerId: 5,
    Customer: { name: "PT Mitra Sejati" },
    contactId: 5,
    Contact: { name: "David Lee", phone: "+62 822-3333-4444" },
    userId: 2,
    User: { name: "Jane Smith" },
    visitDate: "2026-07-16T10:30:00Z",
    status: "Planned",
    location: "Yogyakarta Office",
    purpose: "Complete onboarding process and training",
    notes: "First meeting with new customer",
  },
  {
    id: 1006,
    title: "Follow-up: Proposal Discussion",
    customerId: 1,
    Customer: { name: "PT Maju Jaya" },
    contactId: 1,
    Contact: { name: "Budi Santoso", phone: "+62 812-3456-7890" },
    userId: 1,
    User: { name: "John Doe" },
    visitDate: "2026-07-18T11:00:00Z",
    status: "Cancelled",
    location: "Jakarta Office",
    purpose: "Follow up on submitted proposal",
    notes: "Cancelled - Client requested reschedule to next month",
  },
  {
    id: 1007,
    title: "Site Survey - New Project",
    customerId: 6,
    Customer: { name: "CV Makmur Sentosa" },
    contactId: 6,
    Contact: { name: "Maria Garcia", phone: "+62 877-5555-6666" },
    userId: 3,
    User: { name: "Mike Johnson" },
    visitDate: "2026-07-21T08:00:00Z",
    status: "Planned",
    location: "Medan Factory",
    purpose: "Survey site for new installation project",
    notes: "Coordinate with client's facility manager",
  },
  {
    id: 1008,
    title: "Partnership Discussion",
    customerId: 7,
    Customer: { name: "PT Global Solutions" },
    contactId: 7,
    Contact: { name: "Robert Chen", phone: "+62 815-9999-0000" },
    userId: 2,
    User: { name: "Jane Smith" },
    visitDate: "2026-07-23T15:00:00Z",
    status: "Completed",
    location: "Bali - Conference Center",
    purpose: "Explore strategic partnership opportunities",
    notes: "Attended industry conference together",
    outcome: "Agreed to pilot partnership program starting August. Signed MOU.",
  },
  {
    id: 1009,
    title: "Training Session - Product Usage",
    customerId: 3,
    Customer: { name: "PT Sukses Makmur" },
    contactId: 3,
    Contact: { name: "Ahmad Hidayat", phone: "+62 813-1111-2222" },
    userId: 1,
    User: { name: "John Doe" },
    visitDate: "2026-07-25T09:30:00Z",
    status: "Planned",
    location: "Bandung Office",
    purpose: "Train customer team on new product features",
    notes: "Prepare training materials and demo setup",
  },
  {
    id: 1010,
    title: "Emergency Maintenance Visit",
    customerId: 8,
    Customer: { name: "UD Cahaya Abadi" },
    contactId: 8,
    Contact: { name: "Jennifer Wong", phone: "+62 838-2222-3333" },
    userId: 3,
    User: { name: "Mike Johnson" },
    visitDate: "2026-07-28T14:30:00Z",
    status: "Planned",
    location: "Palembang Site",
    purpose: "Emergency equipment maintenance",
    notes: "Priority visit - equipment malfunction reported",
  },
]);

// Merge API data with dummy data
const data = computed(() => {
  const apiRecords = apiData.value || [];
  return [...apiRecords, ...dummyVisits.value];
});

// Get visits for a specific date
const getVisitsForDate = (date) => {
  if (!data.value) return [];
  const targetDate = dayjs(date).format("YYYY-MM-DD");
  return data.value.filter((visit) => {
    const visitDate = dayjs(visit.visitDate).format("YYYY-MM-DD");
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
