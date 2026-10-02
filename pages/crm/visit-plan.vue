<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="CRM / Visit Plan">
        <template #extra>
          <div class="flex gap-2">
            <el-radio-group
              v-model="viewMode"
              size="default"
              fill="rgb(149, 212, 117)"
              @change="
                (v) => {
                  filters = {
                    ...filters,
                    page: 1,
                    pageSize: v === 'calendar' ? 1_000_000 : 10,
                  };

                  refreshData();
                }
              "
            >
              <el-radio-button value="calendar">
                <el-icon><ElIconCalendar /></el-icon>
                Calendar
              </el-radio-button>
              <el-radio-button value="table">
                <el-icon><ElIconGrid /></el-icon>
                Table
              </el-radio-button>
            </el-radio-group>

            <template v-if="viewMode === 'table'">
              <el-input
                v-model="keyword"
                placeholder="Search"
                @change="refreshData()"
                clearable
                :prefix-icon="ElIconSearch"
                style="width: 180px"
              />
            </template>

            <el-button
              v-if="viewMode === 'table'"
              :icon="ElIconPrinter"
              @click="exportToPdf"
              :disabled="!data?.data?.length"
              type="info"
              plain
            >
              Export PDF
            </el-button>

            <el-button
              :icon="ElIconPlus"
              type="success"
              @click="visitPlanFormRef?.openForm()"
            />
          </div>
        </template>
      </el-page-header>
    </template>

    <!-- Table View -->
    <div v-if="viewMode === 'table'">
      <el-table
        stripe
        v-loading="isPending"
        :data="data?.data || []"
        @filter-change="filterChange"
        @sort-change="sortChange"
        height="calc(100vh - 195px)"
      >
        <el-table-column
          label="Scheduled Date"
          width="180"
          sortable="custom"
          prop="scheduledDate"
        >
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

        <el-table-column label="Title" min-width="200">
          <template #default="{ row }">
            <el-link
              class="font-semibold line-clamp-1"
              @click="openDetailDialog(row)"
              type="success"
            >
              {{ row.title }}
            </el-link>
            <div v-if="row.purpose" class="text-sm text-gray-500 line-clamp-2">
              {{ row.purpose }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="Assigned To"
          width="200"
          :filters="users.map((u) => ({ text: u.name, value: u.id }))"
          column-key="userId"
        >
          <template #default="{ row }">
            <div v-if="row.User" class="flex items-center gap-2">
              <el-avatar
                class="shrink-0"
                size="small"
                :style="{ backgroundColor: getAvatarColor(row.User.name) }"
              >
                {{ row.User.name?.charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="font-semibold text-sm line-clamp-1">
                {{ row.User.name }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="Customer"
          min-width="200"
          column-key="customerId"
          :filters="customers.map((c) => ({ text: c.name, value: c.id }))"
        >
          <template #default="{ row }">
            <el-link
              @click="navigateTo(`/crm/customers/${row.customerId}`)"
              type="success"
              class="font-semibold line-clamp-1"
            >
              {{ row.Customer?.name }}
            </el-link>
            <div v-if="row.contactPerson" class="flex flex-col">
              <div>
                <el-icon :size="12" class="mr-1">
                  <ElIconUser />
                </el-icon>
                <span class="font-semibold text-sm">
                  {{ row.contactPerson }}
                </span>
              </div>
              <div v-if="row.contactPhone">
                <el-icon :size="12" class="mr-1">
                  <ElIconPhone />
                </el-icon>
                <span v-if="row.contactPhone" class="text-xs text-gray-500">
                  {{ row.contactPhone }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="Status"
          width="140"
          align="center"
          column-key="status"
          :filters="
            ['Planned', 'Completed', 'Cancelled'].map((s) => ({
              text: s,
              value: s,
            }))
          "
        >
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

        <el-table-column
          label="Visit Type"
          width="120"
          align="center"
          column-key="visitType"
          :filters="['Online', 'Offline'].map((t) => ({ text: t, value: t }))"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.visitType === 'Online' ? 'success' : 'info'"
              size="small"
            >
              {{ row.visitType }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Location" min-width="180">
          <template #default="{ row }">
            <div v-if="row.visitType === 'Online'">
              <el-link
                v-if="row.meetingUrl"
                :href="row.meetingUrl"
                target="_blank"
                type="success"
                :icon="ElIconVideoCamera"
              >
                &nbsp; Join Meeting
              </el-link>
              <span v-else class="text-gray-400 text-sm">Online</span>
            </div>
            <div v-else class="text-sm whitespace-pre-line">
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
                    v-if="row.status == 'Planned'"
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

      <el-pagination
        class="p-2 bg-slate-100"
        v-if="data?.total"
        size="small"
        background
        layout="total, sizes, prev, pager, next"
        :page-size="pageSize"
        :page-sizes="[10, 25, 50, 100]"
        :current-page="page"
        :total="data?.total"
        @current-change="currentChange"
        @size-change="sizeChange"
      />
    </div>

    <!-- Calendar View -->
    <CrmVisitPlanCalendar
      v-else-if="viewMode === 'calendar'"
      v-model="calendarDate"
      :visits="data?.data || []"
      :loading="isPending"
      @add-event="openFormWithDate"
      @open-detail="openDetailDialog"
    />

    <!-- Visit Plan Detail Dialog -->
    <CrmVisitPlanDetailDialog
      v-model="showDetailDialog"
      :visit="selectedVisit"
      @edit="openEditFromDialog"
      @mark-completed="markAsCompletedFromDialog"
      @mark-cancelled="markAsCancelledFromDialog"
    />

    <!-- Complete Visit Dialog -->
    <el-dialog
      v-model="showCompleteDialog"
      title="Complete Visit Plan"
      width="500px"
    >
      <el-form :model="completeForm" label-position="top">
        <el-form-item label="Actual Visit Date & Time" required>
          <el-date-picker
            v-model="completeForm.actualVisitDate"
            type="datetime"
            placeholder="Select date and time"
            style="width: 100%"
            format="DD-MMM-YYYY HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
          />
        </el-form-item>

        <el-form-item label="Outcome" required>
          <el-input
            v-model="completeForm.outcome"
            type="textarea"
            :rows="4"
            placeholder="Enter visit outcome and notes"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCompleteDialog = false">Cancel</el-button>
        <el-button
          type="success"
          @click="submitComplete"
          :disabled="!completeForm.actualVisitDate || !completeForm.outcome"
        >
          Mark as Completed
        </el-button>
      </template>
    </el-dialog>

    <!-- Cancel Visit Dialog -->
    <el-dialog
      v-model="showCancelDialog"
      title="Cancel Visit Plan"
      width="500px"
    >
      <el-form :model="cancelForm" label-position="top">
        <el-form-item label="Cancellation Reason" required>
          <el-input
            v-model="cancelForm.cancelReason"
            type="textarea"
            :rows="4"
            placeholder="Enter reason for cancellation"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCancelDialog = false">Close</el-button>
        <el-button
          type="danger"
          @click="submitCancel"
          :disabled="!cancelForm.cancelReason"
        >
          Confirm Cancellation
        </el-button>
      </template>
    </el-dialog>

    <VisitPlanForm ref="visitPlanFormRef" />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

import { useQuery } from "@tanstack/vue-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const visitPlanFormRef = ref(null);
const config = useRuntimeConfig();
const request = useRequest();
const viewMode = ref("calendar");
const calendarDate = ref(new Date());
const showDetailDialog = ref(false);
const selectedVisit = ref(null);
const showCompleteDialog = ref(false);
const completeForm = ref({
  id: null,
  actualVisitDate: null,
  outcome: "",
});
const showCancelDialog = ref(false);
const cancelForm = ref({
  id: null,
  cancelReason: "",
});

const {
  removeMutation,
  fetchData,
  refreshData,
  handleRemove,
  keyword,
  page,
  pageSize,
  companyId,
  sizeChange,
  currentChange,
  filterChange,
  sortChange,
  filters,
} = useCrud({
  url: "/api/visit-plans",
  queryKey: "visit-plans",
  defaultQuery: {
    pageSize: 1_000_000,
  },
});

watch(companyId, () => {
  page.value = 1;
  refreshData();
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();

// Fetch users for filter dropdown
const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: () => request("/api/users"),
});

const { data: customers } = useQuery({
  queryKey: ["customers"],
  queryFn: () => request("/api/customers"),
});

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

useNewQuery(() => visitPlanFormRef.value?.openForm());

const openEditFromDialog = () => {
  showDetailDialog.value = false;
  visitPlanFormRef.value?.openForm(selectedVisit.value);
};

const markAsCompletedFromDialog = async (id) => {
  showDetailDialog.value = false;
  await markAsCompleted(id);
};

const markAsCancelledFromDialog = async (id) => {
  showDetailDialog.value = false;
  await markAsCancelled(id);
};

const markAsCompleted = async (id) => {
  completeForm.value = {
    id,
    actualVisitDate: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
    outcome: "",
  };
  showCompleteDialog.value = true;
};

const submitComplete = async () => {
  if (!completeForm.value.actualVisitDate || !completeForm.value.outcome) {
    ElMessage.warning("Please fill in all required fields");
    return;
  }

  try {
    await request(`/api/visit-plans/${completeForm.value.id}`, {
      method: "PATCH",
      body: {
        status: "Completed",
        actualVisitDate: completeForm.value.actualVisitDate,
        outcome: completeForm.value.outcome,
      },
    });
    ElMessage.success("Visit plan marked as completed");
    showCompleteDialog.value = false;
    refreshData();
  } catch (error) {
    ElMessage.error("Failed to update visit plan status");
  }
};

const markAsCancelled = async (id) => {
  cancelForm.value = {
    id,
    cancelReason: "",
  };
  showCancelDialog.value = true;
};

const submitCancel = async () => {
  if (!cancelForm.value.cancelReason) {
    ElMessage.warning("Please enter a cancellation reason");
    return;
  }

  try {
    await request(`/api/visit-plans/${cancelForm.value.id}`, {
      method: "PATCH",
      body: {
        status: "Cancelled",
        cancelReason: cancelForm.value.cancelReason,
      },
    });
    ElMessage.success("Visit plan cancelled");
    showCancelDialog.value = false;
    refreshData();
  } catch (error) {
    ElMessage.error("Failed to update visit plan status");
  }
};

// Export to PDF
const exportToPdf = () => {
  const params = {
    ...filters.value,
  };

  delete params.page;
  delete params.pageSize;

  const query = new URLSearchParams(params).toString();
  const downloadUrl = new URL(
    `${config.public.apiBase}/api/visit-plans/export/pdf?${query}`,
  );
  window.open(downloadUrl, "_blank");
};
</script>
