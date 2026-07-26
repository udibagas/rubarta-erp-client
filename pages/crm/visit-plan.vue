<template>
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

    <br />

    <!-- Table View -->
    <div v-if="viewMode === 'table'">
      <el-table
        stripe
        v-loading="isPending"
        :data="data?.data || []"
        @filter-change="filterChange"
        @sort-change="sortChange"
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
            <div v-if="row.purpose" class="text-sm text-gray-500 line-clamp-1">
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
                :size="28"
                :style="{ backgroundColor: getAvatarColor(row.User.name) }"
              >
                {{ row.User.name?.charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="font-semibold text-sm line-clamp-1">{{
                row.User.name
              }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="Customer"
          width="200"
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
              <div>
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

      <br />

      <el-pagination
        v-if="data?.total"
        size="small"
        background
        layout="total, sizes, prev, pager, next"
        :page-size="pageSize"
        :page-sizes="[10, 25, 50, 100]"
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
  </el-page-header>

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
  <el-dialog v-model="showCancelDialog" title="Cancel Visit Plan" width="500px">
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
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "jspdf-autotable";

dayjs.extend(relativeTime);

const visitPlanFormRef = ref(null);
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
  pageSize,
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
  if (!data.value?.data?.length) {
    ElMessage.warning("No data to export");
    return;
  }

  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text("Visit Plan Report", 14, 20);

  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${dayjs().format("YYYY-MM-DD HH:mm")}`, 14, 28);

  // Add filter information if any
  let yPos = 35;
  const activeFilters = [];
  if (filters.value.userId) {
    const user = users.value?.find((u) => u.id === filters.value.userId);
    if (user) activeFilters.push(`Assigned To: ${user.name}`);
  }
  if (filters.value.status)
    activeFilters.push(`Status: ${filters.value.status}`);
  if (filters.value.visitType)
    activeFilters.push(`Visit Type: ${filters.value.visitType}`);
  if (keyword.value) activeFilters.push(`Search: ${keyword.value}`);

  if (activeFilters.length > 0) {
    doc.setFontSize(9);
    doc.text(`Filters: ${activeFilters.join(", ")}`, 14, yPos);
    yPos += 8;
  }

  // Prepare table data
  const tableData = data.value.data.map((visit) => [
    [formatDate(visit.scheduledDate), visit.scheduledTime || "-"].join(" "),
    visit.title || "-",
    visit.Customer?.name || "-",
    visit.status || "-",
    visit.visitType || "-",
    visit.User?.name || "-",
    visit.visitType === "Online"
      ? visit.meetingUrl
        ? "Online Meeting"
        : "Online"
      : visit.address || "-",
  ]);

  // Add table
  autoTable(doc, {
    head: [
      [
        "Scheduled Date",
        "Title",
        "Assigned To",
        "Customer",
        "Status",
        "Visit Type",
        "Location",
      ],
    ],
    body: tableData,
    startY: yPos,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [67, 160, 71], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 35 },
      2: { cellWidth: 25 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 35 },
    },
  });

  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    );
  }

  // Save the PDF
  const fileName = `visit-plan-report-${dayjs().format("YYYY-MM-DD")}.pdf`;
  doc.save(fileName);
  ElMessage.success("PDF exported successfully");
};
</script>
