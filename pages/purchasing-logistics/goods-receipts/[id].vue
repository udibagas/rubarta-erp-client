<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack">
        <template #content>
          <span class="font-medium mr-2"> #{{ goodsReceipt?.number }} </span>
          <span class="text-sm text-gray-500">
            {{ goodsReceipt?.PurchaseOrder?.number }}
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
                    @click="editGoodsReceipt"
                  >
                    Edit
                  </el-dropdown-item>
                  <el-dropdown-item
                    :icon="ElIconDelete"
                    class="text-error!"
                    @click="deleteGoodsReceipt"
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

    <div v-if="goodsReceipt">
      <div class="flex gap-2">
        <div class="grow overflow-auto">
          <el-tabs type="card">
            <el-tab-pane label="GOODS RECEIPT INFORMATION">
              <GoodsReceiptDetail :goodsReceipt="goodsReceipt" />
            </el-tab-pane>
            <el-tab-pane label="GOODS RECEIPT ITEMS">
              <GoodsReceiptItems :goodsReceipt="goodsReceipt" />
            </el-tab-pane>
          </el-tabs>
        </div>

        <GoodsReceiptSummary :goodsReceipt="goodsReceipt" />
      </div>
    </div>

    <GoodsReceiptForm ref="goodsReceiptFormRef" @saved="() => refetch()" />
  </nuxt-layout>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";

definePageMeta({ layout: false });

const route = useRoute();
const request = useRequest();
const goodsReceiptFormRef = ref(null);

const grId = route.params.id;

const { data: goodsReceipt, refetch } = useQuery({
  queryKey: ["goodsReceipt", grId],
  queryFn: () => request(`/api/goods-receipts/${grId}`),
});

function editGoodsReceipt() {
  const formData = {
    ...goodsReceipt.value,
    items: goodsReceipt.value.GoodsReceiptItems || [],
  };

  goodsReceiptFormRef.value?.openForm(formData);
}

function deleteGoodsReceipt() {
  ElMessageBox.confirm(
    "Are you sure you want to delete this goods receipt?",
    "Confirm",
    {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning",
    },
  )
    .then(async () => {
      try {
        await request(`/api/goods-receipts/${grId}`, {
          method: "DELETE",
        });

        ElMessage({
          type: "success",
          message: "Goods receipt deleted successfully",
        });

        navigateTo("/purchasing-logistics/goods-receipts");
      } catch (error) {
        console.error("Delete goods receipt error:", error);
        ElMessage.error("Failed to delete goods receipt");
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Goods receipt deletion canceled",
      });
    });
}
</script>
