<template>
  <el-page-header @back="goBack">
    <template #content>
      <span class="text-large font-600"> NOTIFICATIONS </span>
    </template>
    <template #extra>
      <form @submit.prevent="refresh()">
        <el-button
          v-if="data?.data?.length"
          size="small"
          type="danger"
          @click="handleRemoveAll(removeAll)"
          :icon="ElIconDelete"
          class="mr-2"
        >
          Delete All
        </el-button>

        <el-input
          size="small"
          v-model="keyword"
          placeholder="Cari"
          style="width: 180px; margin-right: 5px"
          :prefix-icon="ElIconSearch"
          :clearable="true"
          @clear="refresh()"
        >
        </el-input>

        <el-button
          size="small"
          type="success"
          @click="refresh()"
          :icon="ElIconRefresh"
        >
        </el-button>
      </form>
    </template>
  </el-page-header>

  <br />

  <div class="flex">
    <div>
      <el-table
        v-loading="isPending"
        :data="data?.data"
        style="width: 300px; margin-right: 20px; height: calc(100vh - 200px)"
        @row-click="(row) => read(row)"
        :highlight-current-row="true"
        ref="notificationTable"
      >
        <el-table-column :label="`${unread} Unread Messages`" min-width="150">
          <template #default="{ row }">
            <div :class="!row.readAt ? 'strong' : ''">
              <small>
                {{ formatDateLong(row.date) }}
                {{ formatTime(row.date) }}
              </small>
              <br />
              <div>{{ row.title }}</div>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <br />
      <el-pagination
        v-if="data?.total"
        size="small"
        background
        layout="sizes, prev, next, total,"
        :page-size="pageSize"
        :page-sizes="[10, 25, 50, 100]"
        :total="data?.total"
        @current-change="currentChange"
        @size-change="sizeChange"
      ></el-pagination>
    </div>

    <el-card class="flex-grow" shadow="hover" v-if="selected.id">
      <template #header>
        <div class="card-header flex">
          <div class="flex-grow">
            <h3 style="margin-bottom: 5px">{{ selected.title }}</h3>
            <small>
              {{ formatDateLong(selected.date) }}
              {{ formatTime(selected.date) }}
            </small>
          </div>

          <el-button
            type="danger"
            @click="handleRemove(selected.id, remove)"
            :icon="ElIconDelete"
            circle
          >
          </el-button>
        </div>
      </template>

      <strong>Dear {{ selected.User?.name }},</strong>

      <br />

      <p>{{ selected.message }}</p>

      <p v-if="selected.redirectUrl">
        Silakan klik link di bawah ini untuk melihat detail:
        <br />
        <br />
        <a :href="selected.redirectUrl">LIHAT DETAIL</a>
      </p>

      <p>
        Regards,
        <br /><br />
        Rubarta ERP System
      </p>
    </el-card>

    <el-card class="flex-grow" shadow="hover" v-else>
      <el-empty description="No message" />
    </el-card>
  </div>
</template>

<script setup>
import { useQuery, useMutation } from "@tanstack/vue-query";
const url = "/api/notifications";
const selected = ref({});
const notificationTable = ref("");

const {
  removeMutation,
  refreshData,
  handleRemove,
  sizeChange,
  currentChange,
  request,
  page,
  pageSize,
  keyword,
} = useCrud({ url, queryKey: "notifications" });

const { isPending, data } = useQuery({
  queryKey: ["notifications"],
  queryFn: () =>
    request(url, {
      params: {
        page: page.value,
        pageSize: pageSize.value,
        keyword: keyword.value,
      },
    }),
});

const { data: unread } = useQuery({
  queryKey: ["unread-notifications"],
  queryFn: () => request(`${url}/unread`),
});

const { mutate: remove } = useMutation({
  mutationFn: (id) => request(`${url}/${id}`, { method: "DELETE" }),
  onSuccess: () => {
    refresh();
    ElMessage({
      message: "Data berhasil dihapus",
      type: "success",
      showClose: true,
    });
  },
});

const { mutate: removeAll } = useMutation({
  mutationFn: () => request(url, { method: "DELETE" }),
  onSuccess: () => {
    refresh();
    ElMessage({
      message: "Data berhasil dihapus",
      type: "success",
      showClose: true,
    });
  },
});

function handleRemoveAll(callback) {
  ElMessageBox.confirm(
    "Anda yakin akan menghapus semua notifikasi?",
    "Warning",
    {
      type: "warning",
    }
  )
    .then(() => callback())
    .catch(() => console.log(e));
}

async function read(row) {
  selected.value = row;

  if (!row.readAt) {
    await request(`/api/notifications/${row.id}`, { method: "PATCH" });
    refreshData();
    refreshData("unread-notifications");
  }
}

function refresh() {
  selected.value = {};
  refreshData();
  refreshData("unread-notifications");
}
</script>
