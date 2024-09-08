<template>
  <el-page-header @back="goBack" content="CRM / Opportunities">
    <template #extra>
      <el-button
        size="small"
        :icon="ElIconPlus"
        type="success"
        @click="openForm({ companyId })"
      >
        ADD NEW OPPORTUNITY
      </el-button>
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

    <el-table-column label="Customer" prop="Customer.name" />
    <el-table-column label="User" prop="User.name" />
    <el-table-column label="Opportunity" prop="name" />

    <el-table-column
      label="Amount"
      width="120"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        <strong>{{ toDecimal(row.amount) }}</strong>
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
} = useCrud({
  url: "/api/opportunities",
  queryKey: "opportunities",
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
