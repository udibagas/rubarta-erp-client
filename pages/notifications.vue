<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack">
        <template #content>
          <span>Notifications</span>
        </template>
        <template #extra>
          <form @submit.prevent="refresh()">
            <el-button
              v-if="data?.data?.length"
              type="danger"
              @click="handleRemoveAll(removeAll)"
              :icon="ElIconDelete"
              class="mr-2"
            >
              Delete All
            </el-button>

            <el-input
              v-model="keyword"
              placeholder="Cari"
              style="width: 180px; margin-right: 5px"
              :prefix-icon="ElIconSearch"
              :clearable="true"
              @clear="refresh()"
            >
            </el-input>

            <el-button @click="refresh()" :icon="ElIconRefresh"> </el-button>
          </form>
        </template>
      </el-page-header>
    </template>

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
              <div class="cursor-pointer">
                <span class="text-xs! text-gray-400">
                  {{ formatDate(row.date) }}
                  {{ formatTime(row.date) }}
                </span>
                <div
                  :class="['line-clamp-1', !row.readAt ? 'font-semibold' : '']"
                >
                  {{ row.title }}
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-if="data?.total"
          size="small"
          background
          layout="sizes, prev, next, total"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 25, 50, 100]"
          :total="data?.total"
          @current-change="currentChange"
          @size-change="sizeChange"
          class="mt-2"
        />
      </div>

      <el-card class="grow" shadow="never" v-if="selected.id">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3>{{ selected.title }}</h3>
              <span class="text-xs! text-gray-400 font-normal!">
                {{ formatDateLong(selected.date) }}
                {{ formatTime(selected.date) }}
              </span>
            </div>

            <el-button
              type="danger"
              plain
              size="small"
              @click="handleRemove(selected.id, remove)"
              :icon="ElIconDelete"
            >
              Delete
            </el-button>
          </div>
        </template>

        <div class="flex flex-col gap-4">
          <div class="font-semibold">Dear {{ selected.User?.name }},</div>

          <p>{{ selected.message }}</p>

          <p v-if="selected.redirectUrl">
            Silakan klik link di bawah ini untuk melihat detail:
          </p>

          <a
            :href="selected.redirectUrl"
            class="btn btn-outline btn-primary btn-sm"
          >
            LIHAT DETAIL
          </a>

          <p>
            Regards,
            <br /><br />
            <span class="font-semibold"> Rubarta ERP System </span>
          </p>
        </div>
      </el-card>

      <el-card class="grow" shadow="hover" v-else>
        <el-empty description="No message" />
      </el-card>
    </div>
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });
import { useQuery, useMutation } from "@tanstack/vue-query";
const url = "/api/notifications";
const selected = ref({});

const {
  handleRemove,
  sizeChange,
  currentChange,
  fetchData,
  request,
  page,
  pageSize,
  keyword,
} = useCrud({ url, queryKey: "notifications" });

const { isPending, data, refetch } = fetchData();

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
    },
  )
    .then(() => callback())
    .catch(() => console.log(e));
}

async function read(row) {
  selected.value = row;

  if (!row.readAt) {
    await request(`/api/notifications/${row.id}`, { method: "PATCH" });
    refetch();
  }
}

function refresh() {
  selected.value = {};
  refetch();
}
</script>
