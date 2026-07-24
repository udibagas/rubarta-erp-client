<template>
  <el-page-header @back="goBack" content="CRM / Visit Plan">
    <template #extra>
      <div class="flex gap-2">
        <el-radio-group
          v-model="viewMode"
          size="default"
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
          <el-select
            v-model="filters.userId"
            placeholder="Assigned To"
            style="width: 150px"
            clearable
            @change="applyFilters"
          >
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>

          <el-select
            v-model="filters.status"
            placeholder="Status"
            style="width: 130px"
            clearable
            @change="applyFilters"
          >
            <el-option label="Planned" value="Planned" />
            <el-option label="Completed" value="Completed" />
            <el-option label="Cancelled" value="Cancelled" />
          </el-select>

          <el-select
            v-model="filters.visitType"
            placeholder="Visit Type"
            style="width: 130px"
            clearable
            @change="applyFilters"
          >
            <el-option label="Online" value="Online" />
            <el-option label="Offline" value="Offline" />
          </el-select>

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

  <br />

  <!-- Table View -->
  <div v-if="viewMode === 'table'">
    <el-table stripe v-loading="isPending" :data="data?.data || []">
      <el-table-column type="index" label="#" width="60" />

      <el-table-column label="Title" min-width="200">
        <template #default="{ row }">
          <el-link class="font-semibold" @click="openDetailDialog(row)">
            {{ row.title }}
          </el-link>
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
          <el-link
            v-if="selectedVisit.meetingUrl"
            :href="selectedVisit.meetingUrl"
            target="_blank"
            type="success"
            :icon="ElIconVideoCamera"
          >
            &nbsp; {{ selectedVisit.meetingUrl }}
          </el-link>
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
        <div class="flex">
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
        <div class="flex">
          <el-button
            type="primary"
            :icon="ElIconEdit"
            @click="openEditFromDialog"
          >
            Edit
          </el-button>
          <el-button
            @click="showDetailDialog = false"
            :icon="ElIconCircleClose"
          >
            Close
          </el-button>
        </div>
      </div>
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

const {
  removeMutation,
  fetchData,
  refreshData,
  handleRemove,
  keyword,
  pageSize,
  sizeChange,
  currentChange,
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

// Apply filters
const applyFilters = () => {
  filters.value.page = 1;
  refreshData();
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
    visit.title || "-",
    formatDate(visit.scheduledDate),
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
        "Title",
        "Scheduled Date",
        "Customer",
        "Status",
        "Visit Type",
        "Assigned To",
        "Location",
      ],
    ],
    body: tableData,
    startY: yPos,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [67, 160, 71], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 25 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
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
