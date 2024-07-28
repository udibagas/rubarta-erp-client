<template>
  <el-page-header @back="goBack">
    <template #content>
      <span class="text-large font-600"> PAYMENT AUTHORIZATION </span>
    </template>
    <template #extra>
      <form @submit.prevent="refreshData()">
        <el-button
          size="small"
          @click="
            openForm({
              companyId: companyId,
              deduction: 0,
              PaymentAuthorizationItem: [
                { date: undefined, description: undefined, amount: 0 },
              ],
            })
          "
          type="success"
          :icon="Plus"
          class="mr-2"
        >
          NEW PAYMENT AUTHORIZATION
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

    <el-table-column label="Number" width="220">
      <template #default="{ row }">
        <strong>{{ row.number }}</strong>
        <br />
        {{ formatDate(row.date) }}
      </template>
    </el-table-column>

    <el-table-column label="Requester" min-width="150">
      <template #default="{ row }">
        {{ row.Requester?.name }}
      </template>
    </el-table-column>

    <el-table-column label="Employee" min-width="150">
      <template #default="{ row }">
        <strong>{{ row.Employee?.name }}</strong
        ><br />
        {{ row.Bank?.code }} - {{ row.bankAccount }}
      </template>
    </el-table-column>

    <el-table-column
      label="Gross Amount"
      width="150"
      align="right"
      hader-align="right"
    >
      <template #default="{ row }">
        {{ toRupiah(row.grossAmount) }}
      </template>
    </el-table-column>

    <el-table-column
      label="Deduction"
      width="150"
      align="right"
      hader-align="right"
    >
      <template #default="{ row }">
        {{ toRupiah(row.deduction) }}
      </template>
    </el-table-column>

    <el-table-column
      label="Net Amount"
      width="150"
      align="right"
      hader-align="right"
    >
      <template #default="{ row }">
        <strong>{{ toRupiah(row.netAmount) }}</strong>
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

  <PaymentAuthorizationForm />
  <PaymentAuthorizationDetail />
</template>

<script setup>
import { colors } from "~/constants/colors";
import { paymentStatuses } from "~/constants/paymentStatuses";
import { openDetail } from "~/stores/detail";
import {
  Refresh,
  Plus,
  Edit,
  Delete,
  MoreFilled,
  Search,
} from "@element-plus/icons-vue";

const companyId = ref(useCookie("companyId"));
const url = "/api/payment-authorizations";
const [
  DRAFT,
  SUBMITTED,
  PARTIIALLY_APPROVED,
  FULLY_APPROVED,
  REJECTED,
  VERIFIED,
  AUTHORIZED,
  PAID,
] = paymentStatuses;

const {
  openForm,
  removeMutation,
  refreshData,
  handleRemove,
  sizeChange,
  currentChange,
  request,
  page,
  pageSize,
  keyword,
} = useCrud({ url, queryKey: "payment-authorizations" });

const { mutate: remove } = removeMutation();
const { isPending, data } = useQuery({
  queryKey: ["payment-authorizations"],
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
  refreshData("payment-authorizations");
});
</script>
