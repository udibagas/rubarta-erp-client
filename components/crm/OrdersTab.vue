<template>
  <div class="mb-4 flex justify-between items-center">
    <el-input
      v-model="keyword"
      placeholder="Search orders..."
      style="width: 300px"
      :prefix-icon="ElIconSearch"
      :clearable="true"
    />
    <el-button type="success" :icon="ElIconPlus" @click="handleNewOrder">
      New Order
    </el-button>
  </div>

  <el-table :data="filteredData" stripe v-loading="isPending">
    <el-table-column type="index" label="#" width="60" />
    <el-table-column label="Order Number" prop="orderNumber" width="150" />
    <el-table-column label="Description" min-width="200">
      <template #default="{ row }">
        <div>
          <strong>{{ row.description }}</strong>
        </div>
        <div v-if="row.notes" class="text-sm text-gray-500">
          {{ row.notes }}
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Status" width="140" align="center">
      <template #default="{ row }">
        <StatusTag :status="row.status" effect="dark">
          <template #icon>
            <el-icon>
              <ElIconEdit v-if="row.status === 'Draft'" />
              <ElIconClock v-else-if="row.status === 'Pending'" />
              <ElIconCheck v-else-if="row.status === 'Confirmed'" />
              <ElIconTruck v-else-if="row.status === 'InProgress'" />
              <ElIconBox v-else-if="row.status === 'Shipped'" />
              <ElIconCircleCheck v-else-if="row.status === 'Delivered'" />
              <ElIconCircleClose v-else-if="row.status === 'Cancelled'" />
            </el-icon>
          </template>
        </StatusTag>
      </template>
    </el-table-column>
    <el-table-column label="Total Amount" width="150" align="right">
      <template #default="{ row }">
        <div class="font-mono font-semibold text-green-600">
          {{ toCurrency(row.totalAmount.toString()) }}
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Order Date" width="140">
      <template #default="{ row }">
        <div>
          <div class="font-semibold text-sm">
            {{ dayjs(row.orderDate).fromNow() }}
          </div>
          <div class="text-xs text-gray-500">
            {{ formatDate(row.orderDate) }}
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Delivery Date" width="140">
      <template #default="{ row }">
        <div v-if="row.deliveryDate">
          <div class="font-semibold text-sm">
            {{ dayjs(row.deliveryDate).fromNow() }}
          </div>
          <div class="text-xs text-gray-500">
            {{ formatDate(row.deliveryDate) }}
          </div>
        </div>
        <div v-else class="text-gray-400">-</div>
      </template>
    </el-table-column>
    <el-table-column label="User" prop="User.name" width="150" />
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
                @click="navigateTo(`/crm/orders?id=${row.id}`)"
              >
                View
              </el-dropdown-item>
              <el-dropdown-item
                :icon="ElIconEdit"
                @click="handleEditOrder(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                v-if="row.status === 'Pending'"
                :icon="ElIconCheck"
                @click="handleMarkAsConfirmed(row.id)"
              >
                Mark as Confirmed
              </el-dropdown-item>
              <el-dropdown-item
                v-if="row.status === 'Confirmed' || row.status === 'InProgress'"
                :icon="ElIconCircleCheck"
                @click="handleMarkAsDelivered(row.id)"
              >
                Mark as Delivered
              </el-dropdown-item>
              <el-dropdown-item
                :icon="ElIconDelete"
                @click="handleDeleteOrder(row.id)"
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
    :description="keyword ? 'No orders match your search' : 'No orders found'"
  />
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

const { data, isPending } = useQuery({
  queryKey: ["orders", props],
  queryFn: async () => {
    const params = new URLSearchParams();
    if (props.opportunityId) {
      params.append("opportunityId", props.opportunityId);
    }
    if (props.customerId) {
      params.append("customerId", props.customerId);
    }
    const url = `/api/orders?${params.toString()}`;
    return await request(url);
  },
});

const filteredData = computed(() => {
  if (!data.value) return [];
  if (!keyword.value) return data.value;

  const searchTerm = keyword.value.toLowerCase();
  return data.value.filter((item) => {
    return (
      item.orderNumber?.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.status?.toLowerCase().includes(searchTerm) ||
      item.User?.name?.toLowerCase().includes(searchTerm)
    );
  });
});

const handleNewOrder = () => {
  const queryParams = new URLSearchParams();
  if (props.opportunityId) {
    queryParams.append("opportunityId", props.opportunityId);
  }
  if (props.customerId) {
    queryParams.append("customerId", props.customerId);
  }
  navigateTo(`/crm/orders?${queryParams.toString()}`);
};

const handleEditOrder = (order) => {
  navigateTo(`/crm/orders?id=${order.id}`);
};

const { mutate: updateStatusMutation } = useMutation({
  mutationFn: ({ id, status }) => {
    return request(`/api/orders/${id}`, {
      method: "PATCH",
      body: { status },
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    ElMessage({
      message: "Order status updated successfully",
      type: "success",
      showClose: true,
    });
  },
  onError: (error) => {
    ElMessage({
      message: error.message || "Failed to update order status",
      type: "error",
      showClose: true,
    });
  },
});

const handleMarkAsConfirmed = (id) => {
  ElMessageBox.confirm("Mark this order as confirmed?", "Confirm", {
    type: "info",
  })
    .then(() => {
      updateStatusMutation({ id, status: "Confirmed" });
    })
    .catch(() => {});
};

const handleMarkAsDelivered = (id) => {
  ElMessageBox.confirm("Mark this order as delivered?", "Confirm", {
    type: "success",
  })
    .then(() => {
      updateStatusMutation({ id, status: "Delivered" });
    })
    .catch(() => {});
};

const { mutate: deleteOrderMutation } = useMutation({
  mutationFn: (id) => {
    return request(`/api/orders/${id}`, {
      method: "DELETE",
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    ElMessage({
      message: "Order deleted successfully",
      type: "success",
      showClose: true,
    });
  },
  onError: (error) => {
    ElMessage({
      message: error.message || "Failed to delete order",
      type: "error",
      showClose: true,
    });
  },
});

const handleDeleteOrder = (id) => {
  ElMessageBox.confirm(
    "Are you sure you want to delete this order?",
    "Warning",
    {
      type: "warning",
    },
  )
    .then(() => {
      deleteOrderMutation(id);
    })
    .catch(() => {});
};
</script>
