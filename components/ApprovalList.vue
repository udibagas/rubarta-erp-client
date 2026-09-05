<template>
  <el-card shadow="never" body-style="padding: 8px;">
    <template #header>
      <div class="flex justify-between">
        <div class="font-semibold">APPROVAL</div>
        <div class="flex gap-2">
          <status-tag
            v-if="data?.items?.length > 1"
            :status="data?.status ?? 'Pending'"
            size="small"
            effect="plain"
          />
          <el-button
            @click="() => refetch()"
            :icon="ElIconRefresh"
            link
            type="primary"
          />
        </div>
      </div>
    </template>

    <div class="flex flex-col gap-2">
      <div
        v-for="approval in data?.items ?? []"
        :key="approval.id"
        class="rounded-lg bg-gray-50 p-4"
      >
        <div class="font-semibold">
          {{ approval.user?.name }}
        </div>
        <div>
          <el-tag
            :type="approval.status === null ? 'info' : 'success'"
            effect="dark"
            round
            size="small"
          >
            {{ approval.status === null ? "PENDING" : "APPROVED" }}
          </el-tag>
          <span class="ml-2 text-xs text-gray-500" v-if="approval.status">
            {{ formatDate(approval.updatedAt) }}
            {{ formatTime(approval.updatedAt) }}
          </span>
        </div>

        <div class="mt-4">
          <el-button
            v-if="user.id == approval.userId && approval.status === null"
            type="primary"
            :icon="ElIconStamp"
            @click="approve()"
          >
            APPROVE
          </el-button>

          <div v-else>
            <div class="text-sm text-gray-600 mt-2">
              {{ approval.remarks }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";
import StatusTag from "./StatusTag.vue";

const { user } = useAuth();
const request = useRequest();
const emit = defineEmits(["update"]);

const { approvalType, moduleId } = defineProps(["approvalType", "moduleId"]);

const { data, refetch } = useQuery({
  queryKey: [`${approvalType}-${moduleId}`],
  queryFn: () => request(`/api/approvals/${approvalType}/${moduleId}`),
});

async function approve() {
  try {
    const result = await ElMessageBox.prompt(
      "Anda yakin akan melakukan persetujuan?",
      "PERHATIAN",
      {
        confirmButtonText: "YA",
        confirmButtonClass: "el-button--success",
        cancelButtonText: "TIDAK",
        center: true,
        draggable: true,
        showClose: false,
      },
    );

    await request(`/api/approvals/${approvalType}/${moduleId}/approve/`, {
      method: "POST",
      body: {
        remarks: result.value,
      },
    });

    await refetch();
    emit("update");
  } catch (error) {
    ElMessage.info({
      type: "info",
      message: "Action cancelled",
    });
  }
}
</script>
