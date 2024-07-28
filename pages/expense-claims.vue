<template>
  <el-page-header @back="goBack">
    <template #content>
      <span class="text-large font-600"> EXPENSE CLAIM </span>
    </template>
    <template #extra>
      <form @submit.prevent="refreshData()">
        <el-button
          size="small"
          @click="
            openForm({
              cashAdvance: 0,
              companyId: companyId,
              departmentId: user.departmentId,
              ExpenseClaimItem: [
                {
                  date: undefined,
                  expenseTypeId: undefined,
                  description: undefined,
                  amount: 0,
                },
              ],
            })
          "
          type="success"
          :icon="Plus"
          class="mr-2"
        >
          NEW EXPENSE CLAIM
        </el-button>

        <el-input
          size="small"
          v-model="keyword"
          placeholder="Cari"
          style="width: 180px"
          :prefix-icon="Search"
          :clearable="true"
          @clear="refreshData()"
        >
        </el-input>
      </form>
    </template>
  </el-page-header>

  <br />

  <el-table
    stripe
    v-loading="isPending"
    :data="data?.data"
    @row-click="(row) => openDetail(row)"
  >
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column label="Date" width="150">
      <template #default="{ row }">
        {{ formatDate(row.date) }}
      </template>
    </el-table-column>

    <el-table-column label="Employee" min-width="150">
      <template #default="{ row }">
        <strong>{{ row.User?.name }}</strong>
      </template>
    </el-table-column>

    <el-table-column label="Department" min-width="150">
      <template #default="{ row }">
        {{ row.Department?.name }} <br />
        {{ row.Company?.name }}
      </template>
    </el-table-column>

    <el-table-column
      label="Cash Advance"
      min-width="150"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        {{ toRupiah(row.cashAdvance) }}
      </template>
    </el-table-column>

    <el-table-column
      label="Total Amount"
      min-width="150"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        {{ toRupiah(row.totalAmount) }}
      </template>
    </el-table-column>

    <el-table-column
      label="Claim Amount"
      min-width="150"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        <strong>{{ toRupiah(row.claim) }}</strong>
      </template>
    </el-table-column>

    <el-table-column
      label="Status"
      align="center"
      header-align="center"
      width="150"
      fixed="right"
    >
      <template #default="{ row }">
        <el-tag :type="colors[row.status]" effect="dark">
          {{ row.status }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column
      width="60px"
      align="center"
      header-align="center"
      fixed="right"
    >
      <template #header>
        <el-button link @click="refreshData()" :icon="Refresh"> </el-button>
      </template>
      <template #default="{ row }">
        <el-dropdown v-if="row.status == 'DRAFT'">
          <span class="el-dropdown-link">
            <el-icon>
              <MoreFilled />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                :icon="Edit"
                @click.native.prevent="openForm(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                :icon="Delete"
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

  <ExpenseClaimForm />
  <ExpenseClaimDetail />
</template>

<script setup>
import { colors } from "~/constants/colors";
import { openDetail } from "~/stores/detail";

import {
  Refresh,
  Plus,
  Edit,
  Delete,
  MoreFilled,
  Search,
} from "@element-plus/icons-vue";

const { user } = useSanctumAuth();
const companyId = ref(useCookie("companyId"));
const url = "/api/expense-claims";

const {
  openForm,
  removeMutation,
  refreshData,
  handleRemove,
  currentChange,
  sizeChange,
  request,
  page,
  pageSize,
  keyword,
} = useCrud({
  url,
  queryKey: "expense-claims",
});

const { mutate: remove } = removeMutation();
const { isPending, data } = useQuery({
  queryKey: ["expense-claims"],
  queryFn: () =>
    request(url, {
      params: {
        page: page.value,
        pageSize: pageSize.value,
        keyword: keyword.value,
        companyId: companyId.value,
      },
    }),
});

watch(companyId, () => {
  refreshData("expense-claims");
});
</script>
