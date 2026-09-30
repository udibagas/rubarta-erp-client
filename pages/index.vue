<template>
  <nuxt-layout name="default">
    <template #header>
      <div class="flex justify-between items-center">
        <div>
          <p
            class="text-sm font-medium uppercase tracking-widest text-green-700"
          >
            Workspace overview
          </p>
          <h1 class="mt-1 text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p class="mt-1 text-sm text-gray-500">
            Keep track of today's visits, approvals, and tasks.
          </p>
        </div>
        <div>
          <div class="text-sm text-gray-500">{{ formatDate(new Date()) }}</div>
        </div>
      </div>
    </template>

    <div class="grid gap-4 grid-cols-1 md:grid-cols-2 p-2">
      <el-card shadow="never" body-class="p-2!">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="font-semibold text-gray-900">Pending approval</h2>
              <p class="text-sm text-gray-500">Documents waiting for review</p>
            </div>
            <el-tag type="warning" effect="plain">
              {{ pendingApprovals.length }} pending
            </el-tag>
          </div>
        </template>

        <el-table :data="pendingApprovals" v-loading="approvalsPending" stripe>
          <template #empty>
            <el-empty description="No pending approvals"></el-empty>
          </template>
          <el-table-column prop="document" label="Document">
            <template #default="{ row }">
              <nuxt-link
                class="line-clamp-1 font-semibold font-mono hover:underline cursor-pointer"
                :to="row.link"
              >
                {{ row.document }}
              </nuxt-link>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="Type" width="120" align="center">
            <template #default="{ row }">
              <el-tag effect="plain" type="success">
                {{ row.type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="submitted" label="Submitted" width="115" />
        </el-table>
      </el-card>

      <el-card shadow="never" body-class="p-2!">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="font-semibold text-gray-900">Draft documents</h2>
              <p class="text-sm text-gray-500">Documents not yet finalized</p>
            </div>
            <el-tag type="info" effect="plain">
              {{ draftDocuments.length }} drafts
            </el-tag>
          </div>
        </template>

        <el-table
          :data="draftDocuments"
          v-loading="draftDocumentsPending"
          stripe
        >
          <template #empty>
            <el-empty description="No draft documents"></el-empty>
          </template>
          <el-table-column prop="documentType" label="Type" width="130">
            <template #default="{ row }">
              <el-tag effect="plain" type="warning">
                {{ row.documentType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="number" label="Number" width="140">
            <template #default="{ row }">
              <nuxt-link
                class="line-clamp-1 font-semibold font-mono hover:underline cursor-pointer"
                :to="row.link"
              >
                {{ row.number }}
              </nuxt-link>
            </template>
          </el-table-column>
          <el-table-column prop="party" label="Party" min-width="150">
            <template #default="{ row }">
              <div class="line-clamp-1">
                {{ row.party }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="pic" label="PIC" width="140">
            <template #default="{ row }">
              <div class="line-clamp-1">
                {{ row.pic }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="date" label="Date" width="115" />
        </el-table>
      </el-card>

      <el-card shadow="never" body-class="p-2!">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="font-semibold text-gray-900">Pending tasks</h2>
              <p class="text-sm text-gray-500">Work that needs attention</p>
            </div>
            <el-tag type="danger" effect="plain">
              {{ pendingTasks.length }} open
            </el-tag>
          </div>
        </template>

        <el-table :data="pendingTasks" v-loading="tasksPending" stripe>
          <template #empty>
            <el-empty description="No pending tasks"></el-empty>
          </template>
          <el-table-column prop="task" label="Task" min-width="190" />
          <el-table-column prop="assignee" label="Assignee" min-width="120">
            <template #default="{ row }">
              <div class="line-clamp-1">
                {{ row.assignee }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="dueDate" label="Due date" width="115" />
          <el-table-column label="Priority" width="105" align="center">
            <template #default="{ row }">
              <el-tag
                :type="priorityType[row.priority]"
                effect="plain"
                size="small"
              >
                {{ row.priority }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="Status"
            width="120"
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <el-tag
                :type="taskStatusType[row.status]"
                effect="plain"
                size="small"
              >
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card shadow="never" body-class="p-2!">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="font-semibold text-gray-900">Visit plan</h2>
              <p class="text-sm text-gray-500">Upcoming customer visits</p>
            </div>
            <el-tag type="success" effect="plain"
              >{{ visitPlans.length }} visits</el-tag
            >
          </div>
        </template>

        <el-table :data="visitPlans" v-loading="visitPlansPending" stripe>
          <template #empty>
            <el-empty description="No upcoming visits"></el-empty>
          </template>
          <el-table-column prop="date" label="Date" width="125" />
          <el-table-column prop="time" label="Time" width="110" />
          <el-table-column prop="customer" label="Customer" width="180">
            <template #default="{ row }">
              <div class="font-semibold line-clamp-1">
                {{ row.customer }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="owner" label="User" width="180">
            <template #default="{ row }">
              <div class="line-clamp-1">
                {{ row.owner }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="purpose" label="Purpose" min-width="190">
            <template #default="{ row }">
              <div class="line-clamp-1">
                {{ row.purpose }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </nuxt-layout>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";

definePageMeta({ layout: false });

const request = useRequest();

const rowsFrom = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return response?.items ?? [];
};

const { data: visitPlanResponse, isPending: visitPlansPending } = useQuery({
  queryKey: ["dashboard-visit-plans"],
  queryFn: () =>
    request("/api/visit-plans", {
      params: { page: 1, pageSize: 5, status: ["Planned"] },
    }),
});

const { data: approvalResponse, isPending: approvalsPending } = useQuery({
  queryKey: ["dashboard-pending-approvals"],
  queryFn: () => request("/api/approvals"),
});

const { data: taskResponse, isPending: tasksPending } = useQuery({
  queryKey: ["dashboard-pending-tasks"],
  queryFn: () =>
    request("/api/tasks", {
      params: {
        page: 1,
        pageSize: 20,
        status: ["Todo", "InProgress", "OnHold"],
      },
    }),
});

const { data: draftDocumentResponse, isPending: draftDocumentsPending } =
  useQuery({
    queryKey: ["dashboard-draft-documents"],
    queryFn: () => request("/api/tasks/draft-documents"),
  });

const visitPlans = computed(() =>
  rowsFrom(visitPlanResponse.value).map((visit) => ({
    date: formatDate(visit.scheduledDate),
    time: visit.scheduledTime || formatTime(visit.scheduledDate),
    customer: visit.Customer?.name || "-",
    purpose: visit.purpose || visit.title || "-",
    owner: visit.User?.name || "-",
    status: visit.status || "-",
  })),
);

const pendingApprovals = computed(() =>
  rowsFrom(approvalResponse.value).map((approval) => ({
    document: approval.documentNumber || "-",
    type: approval.approvalType?.replaceAll("_", " ") || "-",
    submitted: formatDate(approval.createdAt),
    link: getApprovalLink(approval),
  })),
);

function getApprovalLink(approval) {
  const { approvalType, moduleId, documentNumber } = approval;
  switch (approvalType) {
    case "NKP":
      return `/nkp?number=${documentNumber}`;
    case "QUOTATION":
      return `/sales/quotations/${moduleId}`;
    case "SALES_ORDER":
      return `/sales/orders/${moduleId}`;
    case "INVOICE":
      return `/sales/invoices/${moduleId}`;
    default:
      return "/";
  }
}

function getDraftLink(document) {
  const { documentType, id, number } = document;

  switch (documentType) {
    case "NKP":
      return `/nkp?number=${number}`;
    case "Quotation":
      return `/sales/quotations/${id}`;
    case "Sales Order":
      return `/sales/orders/${id}`;
    case "Invoice":
      return `/sales/invoices/${id}`;
    case "Purchase Order":
      return `/purchasing-logistics/purchases-orders/${id}`;
    case "Delivery Order":
      return `/purchasing-logistics/delivery-orders/${id}`;
    case "Goods Receipt":
      return `/purchasing-logistics/goods-receipts/${id}`;
    default:
      return "/";
  }
}

const pendingTasks = computed(() =>
  rowsFrom(taskResponse.value)
    .filter((task) => ["Todo", "InProgress", "OnHold"].includes(task.status))
    .slice(0, 5)
    .map((task) => ({
      task: task.title || "-",
      assignee: task.User?.name || "-",
      dueDate: formatDate(task.dueDate),
      priority: task.priority || "Normal",
      status:
        task.status === "InProgress"
          ? "In progress"
          : task.status === "OnHold"
            ? "On hold"
            : "To do",
    })),
);

const draftDocuments = computed(() =>
  rowsFrom(draftDocumentResponse.value).map((doc) => ({
    documentType: doc.documentType || "-",
    date: formatDate(doc.date),
    number: doc.number || "-",
    title: doc.title || "-",
    party: doc.party || "-",
    pic: doc.pic || "-",
    link: getDraftLink(doc),
  })),
);

const priorityType = {
  High: "danger",
  Normal: "warning",
  Low: "info",
};

const taskStatusType = {
  "In progress": "primary",
  "To do": "warning",
  "On hold": "info",
};
</script>
