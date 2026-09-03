<template>
  <el-card shadow="never">
    <template #header>
      <div class="flex justify-between">
        <div class="font-semibold">APPROVAL</div>
        <el-button
          @click="() => refetch()"
          :icon="ElIconRefresh"
          link
          type="primary"
        ></el-button>
      </div>
    </template>
    <div class="flex flex-col gap-4">
      <div v-for="approval in data?.items ?? []" :key="approval.id">
        <div class="flex items-center gap-2">
          <el-avatar
            :size="34"
            :style="{ backgroundColor: getAvatarColor(user?.name || '') }"
          >
            {{ approval.user?.name?.charAt(0).toUpperCase() }}
          </el-avatar>
          <div>
            <div class="font-semibold">
              {{ approval.user?.name }}
            </div>
            <div class="text-xs text-gray-500" v-if="approval.status">
              {{ formatDate(approval.updatedAt) }}
              {{ formatTime(approval.updatedAt) }}
            </div>
          </div>
        </div>

        <div class="mt-4">
          <el-button
            v-if="user.id == approval.userId && approval.status === null"
            type="success"
            :icon="ElIconStamp"
            @click="approve()"
          >
            APPROVE
          </el-button>

          <div class="mb-4" v-else>
            <el-tag
              :type="approval.status === null ? 'info' : 'success'"
              effect="dark"
            >
              {{ approval.status === null ? "PENDING" : "APPROVED" }}
            </el-tag>
            <div class="text-sm text-gray-500 mt-2">
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

const { user } = useAuth();
const request = useRequest();
const emit = defineEmits(["reload"]);

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
    emit("reload");
  } catch (error) {
    ElMessage.info({
      type: "info",
      message: "Action cancelled",
    });
  }
}
</script>
