<template>
  <el-page-header @back="goBack" content="CRM / Opportunities">
    <template #extra>
      <form
        class="flex gap-2"
        @submit.prevent="
          () => {
            page = 1;
            refreshData();
          }
        "
      >
        <el-input
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
        />
        <el-button
          :icon="ElIconPlus"
          type="success"
          @click="openForm({ companyId })"
        />
      </form>
    </template>
  </el-page-header>

  <br />

  <el-table stripe v-loading="isPending" :data="data?.data">
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column
      label="Stage"
      prop="status"
      width="150"
      align="center"
      header-align="center"
    >
      <template #default="{ row }">
        <StatusTag :status="row.stage" style="width: 100%" effect="dark" />
      </template>
    </el-table-column>

    <el-table-column label="Date" width="120">
      <template #default="{ row }">
        {{ formatDate(row.createdAt) }}
      </template>
    </el-table-column>

    <el-table-column label="Customer" prop="Customer.name" min-width="150px" />
    <el-table-column label="User" prop="User.name" min-width="150px" />
    <el-table-column label="Opportunity" prop="name" min-width="200px" />

    <el-table-column
      label="Amount"
      min-width="120"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        <div class="font-mono">{{ toDecimal(row.amount) }}</div>
      </template>
    </el-table-column>

    <el-table-column
      label="Exp Close Date"
      width="150"
      align="center"
      header-align="center"
    >
      <template #default="{ row }">
        {{ formatDate(row.expectedCloseDate) }}
      </template>
    </el-table-column>

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

  <OpportunityForm />
</template>

<script setup>
const {
  openForm,
  removeMutation,
  fetchData,
  refreshData,
  handleRemove,
  companyId,
  keyword,
} = useCrud({
  url: "/api/opportunities",
  queryKey: "opportunities",
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
