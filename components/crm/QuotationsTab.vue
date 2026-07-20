<template>
  <div class="mb-4 flex justify-between items-center">
    <el-input
      v-model="keyword"
      placeholder="Search quotations..."
      style="width: 300px"
      :prefix-icon="ElIconSearch"
      :clearable="true"
    />
    <el-button type="success" :icon="ElIconPlus" @click="handleNewQuotation">
      New Quotation
    </el-button>
  </div>

  <el-table :data="filteredData" stripe v-loading="isPending">
    <el-table-column type="index" label="#" width="60" />
    <el-table-column label="Number" prop="number" width="120" />
    <el-table-column label="Title" min-width="200">
      <template #default="{ row }">
        <div>
          <strong>{{ row.title }}</strong>
        </div>
        <div v-if="row.description" class="text-sm text-gray-500">
          {{ row.description }}
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Status" width="140" align="center">
      <template #default="{ row }">
        <StatusTag :status="row.status" effect="dark">
          <template #icon>
            <el-icon>
              <ElIconEdit v-if="row.status === 'Draft'" />
              <ElIconMessage v-else-if="row.status === 'Sent'" />
              <ElIconCircleCheck v-else-if="row.status === 'Accepted'" />
              <ElIconCircleClose v-else-if="row.status === 'Rejected'" />
              <ElIconClock v-else-if="row.status === 'Expired'" />
            </el-icon>
          </template>
        </StatusTag>
      </template>
    </el-table-column>
    <el-table-column label="Grand Total" width="150" align="right">
      <template #default="{ row }">
        <div class="font-mono font-semibold text-green-600">
          {{ toCurrency(row.grandTotal.toString()) }}
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Valid Until" width="140">
      <template #default="{ row }">
        <div>
          <div class="font-semibold text-sm">
            {{ dayjs(row.validUntil).fromNow() }}
          </div>
          <div class="text-xs text-gray-500">
            {{ formatDate(row.validUntil) }}
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="User" prop="User.name" width="150" />
    <el-table-column label="Created" width="140">
      <template #default="{ row }">
        <div>
          <div class="font-semibold text-sm">
            {{ dayjs(row.createdAt).fromNow() }}
          </div>
          <div class="text-xs text-gray-500">
            {{ formatDate(row.createdAt) }}
          </div>
        </div>
      </template>
    </el-table-column>
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
                :icon="ElIconView"
                @click="quotationFormRef?.openForm(row)"
              >
                View
              </el-dropdown-item>
              <el-dropdown-item
                :icon="ElIconEdit"
                @click="handleEditQuotation(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                v-if="row.status === 'Draft'"
                :icon="ElIconSent"
                @click="handleMarkAsSent(row.id)"
              >
                Mark as Sent
              </el-dropdown-item>
              <el-dropdown-item
                v-if="row.status === 'Sent'"
                :icon="ElIconCircleCheck"
                @click="handleMarkAsAccepted(row.id)"
              >
                Mark as Accepted
              </el-dropdown-item>
              <el-dropdown-item
                :icon="ElIconDelete"
                @click="handleDeleteQuotation(row.id)"
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
      keyword ? 'No quotations match your search' : 'No quotations found'
    "
  />

  <QuotationForm ref="quotationFormRef" />
</template>

<script setup>
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const props = defineProps({
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
const keyword = ref("");
const quotationFormRef = ref(null);

const { data, isPending } = useQuery({
  queryKey: ["quotations", props],
  queryFn: async () => {
    const params = new URLSearchParams();
    if (props.opportunityId) {
      params.append("opportunityId", props.opportunityId);
    }
    if (props.customerId) {
      params.append("customerId", props.customerId);
    }
    const url = `/api/quotations?${params.toString()}`;
    return await request(url);
  },
});

const filteredData = computed(() => {
  if (!data.value) return [];
  if (!keyword.value) return data.value;

  const searchTerm = keyword.value.toLowerCase();
  return data.value.filter((item) => {
    return (
      item.number?.toLowerCase().includes(searchTerm) ||
      item.title?.toLowerCase().includes(searchTerm) ||
      item.status?.toLowerCase().includes(searchTerm) ||
      item.User?.name?.toLowerCase().includes(searchTerm)
    );
  });
});

const handleNewQuotation = () => {
  const newQuotation = {};
  if (props.opportunityId) {
    newQuotation.opportunityId = +props.opportunityId;
  }
  if (props.customerId) {
    newQuotation.customerId = +props.customerId;
  }
  quotationFormRef.value?.openForm(newQuotation);
};

const handleEditQuotation = (quotation) => {
  quotationFormRef.value?.openForm(quotation);
};

const { mutate: updateStatusMutation } = useMutation({
  mutationFn: ({ id, status }) => {
    return request(`/api/quotations/${id}`, {
      method: "PATCH",
      body: { status },
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["quotations"] });
    ElMessage({
      message: "Quotation status updated successfully",
      type: "success",
      showClose: true,
    });
  },
  onError: (error) => {
    ElMessage({
      message: error.message || "Failed to update quotation status",
      type: "error",
      showClose: true,
    });
  },
});

const handleMarkAsSent = (id) => {
  ElMessageBox.confirm("Mark this quotation as sent?", "Confirm", {
    type: "info",
  })
    .then(() => {
      updateStatusMutation({ id, status: "Sent" });
    })
    .catch(() => {});
};

const handleMarkAsAccepted = (id) => {
  ElMessageBox.confirm("Mark this quotation as accepted?", "Confirm", {
    type: "success",
  })
    .then(() => {
      updateStatusMutation({ id, status: "Accepted" });
    })
    .catch(() => {});
};

const { mutate: deleteQuotationMutation } = useMutation({
  mutationFn: (id) => {
    return request(`/api/quotations/${id}`, {
      method: "DELETE",
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["quotations"] });
    ElMessage({
      message: "Quotation deleted successfully",
      type: "success",
      showClose: true,
    });
  },
  onError: (error) => {
    ElMessage({
      message: error.message || "Failed to delete quotation",
      type: "error",
      showClose: true,
    });
  },
});

const handleDeleteQuotation = (id) => {
  ElMessageBox.confirm(
    "Are you sure you want to delete this quotation?",
    "Warning",
    {
      type: "warning",
    },
  )
    .then(() => {
      deleteQuotationMutation(id);
    })
    .catch(() => {});
};
</script>
