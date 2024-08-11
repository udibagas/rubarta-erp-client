<template>
  <div
    style="
      display: flex;
      align-items: stretch;
      justify-content: space-evenly;
      text-align: center;
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 5px;
    "
  >
    <div v-for="approval in approvals" :key="approval.id">
      <strong>{{ actions[approval.approvalActionType] }}</strong>
      <div style="height: 60px; line-height: 60px">
        <el-button
          type="danger"
          :icon="ElIconStamp"
          @click="approve(requestId)"
          v-if="user.id == approval.userId && approval.approvalStatus === null"
        >
          APPROVE
        </el-button>

        <div v-else>
          <img
            v-if="approval.approvalStatus && approval.User.signatureSpeciment"
            :src="`${config.public.apiBase}/${approval.User.signatureSpeciment.filePath}`"
            alt=""
            style="height: 60px"
          />
          <el-tag
            v-else
            :type="approval.approvalStatus === null ? 'info' : 'success'"
            effect="dark"
          >
            {{ approval.approvalStatus === null ? "PENDING" : "APPROVED" }}
          </el-tag>
        </div>
      </div>

      <div class="strong">
        {{ approval.User?.name }}
      </div>
      <div>
        {{ approval.approvalStatus ? formatDateLong(approval.updatedAt) : "-" }}
      </div>

      <div class="mt-2" v-if="approval.note">Note: {{ approval.note }}</div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const queryClient = useQueryClient();
const { user } = useSanctumAuth();
const request = useRequest();
const emit = defineEmits(["reload"]);
const { approvals, queryKey, approveUrl, requestId } = defineProps([
  "approvals",
  "queryKey",
  "approveUrl",
  "requestId",
]);

const actions = {
  APPROVAL: "APPROVED BY",
  VERIFICATION: "VERIFIED BY",
  AUTHORIZATION: "AUTHORIZED BY",
};

async function approve(id) {
  try {
    await ElMessageBox.confirm(
      "Anda yakin akan melakukan persetujuan?",
      "PERHATIAN",
      {
        confirmButtonText: "YA",
        cancelButtonText: "TIDAK",
        center: true,
        draggable: true,
        showClose: false,
      }
    );

    await request(`${approveUrl}/${id}`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: [queryKey] });
    emit("reload");
  } catch (error) {
    ElMessage.info({
      type: "info",
      message: "Action cancelled",
    });
  }
}
</script>
