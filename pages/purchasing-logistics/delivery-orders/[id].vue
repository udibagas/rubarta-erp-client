<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack">
        <template #content>
          <span class="font-medium mr-2"> #{{ deliveryOrder?.number }} </span>
          <span class="text-sm text-gray-500">
            {{ deliveryOrder?.SalesOrder?.number }}
          </span>
        </template>
        <template #extra>
          <div class="flex gap-2 items-center">
            <el-dropdown>
              <el-button :icon="ElIconMore"></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    :icon="ElIconEdit"
                    @click="editDeliveryOrder"
                  >
                    Edit
                  </el-dropdown-item>
                  <el-dropdown-item
                    :icon="ElIconDelete"
                    class="text-error!"
                    @click="deleteDeliveryOrder"
                  >
                    Delete
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-button :icon="ElIconRefresh" @click="refetch"> </el-button>
          </div>
        </template>
      </el-page-header>
    </template>

    <div v-if="deliveryOrder">
      <div class="flex gap-2">
        <div class="grow overflow-auto">
          <el-tabs type="card">
            <el-tab-pane label="DELIVERY ORDER INFORMATION">
              <DeliveryOrderDetail :deliveryOrder="deliveryOrder" />
            </el-tab-pane>
            <el-tab-pane label="DELIVERY ORDER ITEMS">
              <DeliveryOrderItems :deliveryOrder="deliveryOrder" />
            </el-tab-pane>
          </el-tabs>
        </div>

        <DeliveryOrderSummary :deliveryOrder="deliveryOrder" />
      </div>
    </div>

    <DeliveryOrderForm ref="deliveryOrderFormRef" @saved="() => refetch()" />
  </nuxt-layout>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";

definePageMeta({ layout: false });

const route = useRoute();
const request = useRequest();
const deliveryOrderFormRef = ref(null);

const doId = route.params.id;

const { data: deliveryOrder, refetch } = useQuery({
  queryKey: ["deliveryOrder", doId],
  queryFn: () => request(`/api/delivery-orders/${doId}`),
});

function editDeliveryOrder() {
  const formData = {
    ...deliveryOrder.value,
    items: deliveryOrder.value.DeliveryOrderItems || [],
  };

  deliveryOrderFormRef.value?.openForm(formData);
}

function deleteDeliveryOrder() {
  ElMessageBox.confirm(
    "Are you sure you want to delete this delivery order?",
    "Confirm",
    {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning",
    },
  )
    .then(async () => {
      try {
        await request(`/api/delivery-orders/${doId}`, {
          method: "DELETE",
        });

        ElMessage({
          type: "success",
          message: "Delivery order deleted successfully",
        });

        navigateTo("/purchasing-logistics/delivery-orders");
      } catch (error) {
        console.error("Delete delivery order error:", error);
        ElMessage.error("Failed to delete delivery order");
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Delivery order deletion canceled",
      });
    });
}
</script>
