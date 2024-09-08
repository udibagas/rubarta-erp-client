<template>
  <el-page-header @back="goBack" content="CRM / Leads">
    <template #extra>
      <form
        @submit.prevent="
          () => {
            page = 1;
            refreshData();
          }
        "
      >
        <el-button
          size="small"
          @click="openForm({ companyId })"
          type="success"
          :icon="ElIconPlus"
          class="mr-2"
        >
          NEW LEAD
        </el-button>

        <el-input
          size="small"
          v-model="keyword"
          placeholder="Cari"
          style="width: 180px"
          :prefix-icon="ElIconSearch"
          :clearable="true"
          @clear="
            () => {
              page = 1;
              refreshData();
            }
          "
        >
        </el-input>
      </form>
    </template>
  </el-page-header>

  <br />

  <el-table stripe v-loading="isPending" :data="data?.data">
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column
      label="Status"
      prop="status"
      width="150"
      align="center"
      header-align="center"
    >
      <template #default="{ row }">
        <StatusTag :status="row.status" style="width: 100%" effect="dark" />
      </template>
    </el-table-column>

    <el-table-column label="Date" width="120">
      <template #default="{ row }">
        {{ formatDate(row.createdAt) }}
      </template>
    </el-table-column>
    <el-table-column label="Customer" prop="Customer.name" />
    <el-table-column label="User" prop="User.name" />
    <el-table-column label="Source" prop="source" width="150" />
    <el-table-column label="Notes" prop="notes" />

    <el-table-column
      width="60px"
      align="center"
      header-align="center"
      fixed="right"
    >
      <template #header>
        <el-button link @click="refreshData()" :icon="ElIconRefresh">
        </el-button>
      </template>
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
                :icon="ElIconEdit"
                @click.native.prevent="openForm(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                :icon="ElIconDelete"
                @click.native.prevent="handleRemove(row.id, remove)"
              >
                Delete
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-table-column>
  </el-table>

  <br />

  <el-pagination
    v-if="data?.total"
    size="small"
    background
    layout="total, sizes, prev, pager, next"
    :page-size="pageSize"
    :page-sizes="[10, 25, 50, 100]"
    :total="data?.total"
    @current-change="currentChange"
    @size-change="sizeChange"
  ></el-pagination>

  <LeadForm />
</template>

<script setup>
const url = "/api/leads";
const queryKey = "leads";

const {
  page,
  pageSize,
  keyword,
  companyId,
  openForm,
  currentChange,
  sizeChange,
  refreshData,
  handleRemove,
  removeMutation,
  fetchData,
} = useCrud({ url, queryKey });

watch(companyId, () => {
  page.value = 1;
  refreshData();
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
