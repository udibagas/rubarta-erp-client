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
            <status-tag
              :status="goodsReceipt?.status || 'Draft'"
              effect="plain"
              size="large"
              :round="true"
            >
              <template #icon>
                <el-icon><Flag /></el-icon>
              </template>
            </status-tag>

            <el-dropdown>
              <el-button :icon="ElIconMore"></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="m in menus.filter((m) => m.visible)"
                    :key="m.name"
                    :icon="m.icon"
                    @click="m.action"
                    :class="m.class || ''"
                  >
                    {{ m.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-button :icon="ElIconRefresh" @click="refreshPage"> </el-button>
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
            <el-tab-pane label="GOODS RECEIPT DOCUMENT">
              <iframe
                :key="previewKey"
                :src="`${config.public.apiBase}/api/goods-receipts/${goodsReceipt.id}/preview`"
                width="100%"
                style="height: calc(100vh - 200px)"
                frameborder="0"
              ></iframe>
            </el-tab-pane>
          </el-tabs>
        </div>

        <GoodsReceiptSummary :goodsReceipt="goodsReceipt" />
      </div>
    </div>

    <GoodsReceiptForm
      ref="goodsReceiptFormRef"
      @saved="
        () => {
          refreshPage();
          queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
        }
      "
    />
  </nuxt-layout>
</template>

<script setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { Flag } from "lucide-vue-next";

definePageMeta({ layout: false });

const route = useRoute();
const config = useRuntimeConfig();
const request = useRequest();
const queryClient = useQueryClient();
const goodsReceiptFormRef = ref(null);
const previewKey = ref(0);

const grId = route.params.id;

const { data: goodsReceipt, refetch } = useQuery({
  queryKey: ["goodsReceipt", grId],
  queryFn: () => request(`/api/goods-receipts/${grId}`),
});

function refreshPage() {
  refetch();
  previewKey.value += 1;
}

const menus = computed(() => [
  {
    label: "Edit",
    action: editGoodsReceipt,
    icon: ElIconEdit,
    visible: goodsReceipt.value?.status === "Draft",
  },
  {
    label: "Delete",
    action: deleteGoodsReceipt,
    icon: ElIconDelete,
    class: "text-error!",
    visible: goodsReceipt.value?.status === "Draft",
  },
  {
    label: "Mark As Confirmed",
    action: markAsConfirmed,
    icon: ElIconCircleCheck,
    class: "text-success!",
    visible: goodsReceipt.value?.status === "Draft",
  },
  {
    label: "Print PDF",
    action: previewGoodsReceipt,
    icon: ElIconPrinter,
    visible: true,
  },
]);

function editGoodsReceipt() {
  const formData = {
    ...goodsReceipt.value,
    items: [...(goodsReceipt.value.GoodsReceiptItems || [])],
  };

  goodsReceiptFormRef.value?.openForm({ ...formData });
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

function previewGoodsReceipt() {
  const pdfUrl = `${config.public.apiBase}/api/goods-receipts/${grId}/preview`;
  window.open(pdfUrl, "_blank");
}

function markAsConfirmed() {
  ElMessageBox.confirm(
    `Make sure all details are correct before marking this goods receipt as Confirmed. All changes will be final.`,
    "Confirm",
    {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "success",
    },
  )
    .then(async () => {
      await request(`/api/goods-receipts/${grId}`, {
        method: "PATCH",
        body: { status: "Confirmed" },
      });
      ElMessage({
        type: "success",
        message: `Goods receipt status updated to Confirmed`,
      });
      refreshPage();
    })
    .catch((error) => {
      console.error("Update goods receipt status error:", error);
      ElMessage.info("Action Canceled");
    });
}
</script>
