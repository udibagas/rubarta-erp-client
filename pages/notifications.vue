<template>
  <el-page-header @back="goBack">
    <template #content>
      <span class="text-large font-600"> NOTIFICATIONS </span>
    </template>
    <template #extra>
      <form @submit.prevent="refresh()">
        <el-button
          v-if="selected.id"
          size="small"
          type="danger"
          @click="handleRemove(selected.id, remove)"
          :icon="Delete"
          class="mr-2"
        >
          Delete
        </el-button>

        <el-input
          size="small"
          v-model="keyword"
          placeholder="Cari"
          style="width: 180px; margin-right: 5px"
          :prefix-icon="Search"
          :clearable="true"
          @clear="refresh()"
        >
        </el-input>

        <el-button
          size="small"
          type="success"
          @click="refresh()"
          :icon="Refresh"
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
        :show-header="false"
        :highlight-current-row="true"
      >
        <el-table-column label="Messages" min-width="150">
          <template #default="{ row }">
            <div :class="!row.readAt ? 'strong' : ''">
              <small>{{ formatDateTime(row.date) }}</small>
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
        <div class="card-header">
          <h3 style="margin-bottom: 5px">{{ selected.title }}</h3>
          <small>{{ formatDateTime(selected.date) }}</small>
        </div>
      </template>

      <p>{{ selected.message }}</p>
    </el-card>
  </div>
</template>

<script setup>
import { Refresh, Delete, MoreFilled, Search } from "@element-plus/icons-vue";

const url = "/api/notifications";
const selected = ref({});

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

const { mutate: remove } = removeMutation();
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

async function read(row) {
  selected.value = row;
  row.reatAt = new Date();

  if (!row.readAt) {
    await request(`/api/notifications/${row.id}`, { method: "PATCH" });
  }
}

function refresh() {
  selected.value = {};
  refreshData();
}
</script>
