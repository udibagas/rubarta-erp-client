<template>
  <el-page-header @back="goBack" content="CRM / Leads">
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
        <el-button @click="handleNewLead" type="success" :icon="ElIconPlus" />
      </form>
    </template>
  </el-page-header>

  <br />

  <el-table
    stripe
    v-loading="isPending"
    :data="data?.data"
    @row-click="handleRowClick"
    style="cursor: pointer"
  >
    <el-table-column label="Date" width="110">
      <template #default="{ row }">
        {{ formatDate(row.createdAt) }}
      </template>
    </el-table-column>

    <el-table-column label="Title" prop="title" min-width="250">
      <template #default="{ row }">
        <span class="text-gray-900 font-semibold">{{ row.title }}</span>
      </template>
    </el-table-column>

    <el-table-column label="Customer" prop="Customer.name" min-width="200" />

    <el-table-column label="Status" prop="status" width="130" align="center">
      <template #default="{ row }">
        <StatusTag :status="row.status" size="small" effect="dark">
          <template #icon>
            <el-icon>
              <StarFilled v-if="row.status === 'New'" />
              <PhoneFilled v-else-if="row.status === 'Contacted'" />
              <CircleCheckFilled v-else-if="row.status === 'Qualified'" />
              <SuccessFilled v-else-if="row.status === 'Converted'" />
              <CircleCloseFilled v-else-if="row.status === 'Unqualified'" />
              <CloseBold v-else-if="row.status === 'Lost'" />
              <More v-else />
            </el-icon>
          </template>
        </StatusTag>
      </template>
    </el-table-column>

    <el-table-column label="Source" prop="source" width="150" align="center">
      <template #default="{ row }">
        <StatusTag :status="row.source" size="small">
          <template #icon>
            <el-icon>
              <Share v-if="row.source === 'Referral'" />
              <Promotion v-else-if="row.source === 'Advertisement'" />
              <ChatDotRound v-else-if="row.source === 'SocialMedia'" />
              <Link v-else-if="row.source === 'Website'" />
              <Phone v-else-if="row.source === 'ColdCall'" />
              <Calendar v-else-if="row.source === 'Event'" />
              <More v-else />
            </el-icon>
          </template>
        </StatusTag>
      </template>
    </el-table-column>

    <el-table-column label="Est. Value" width="150" align="right">
      <template #default="{ row }">
        <span
          v-if="row.estimatedValue"
          class="font-mono font-semibold text-green-600"
        >
          {{ toCurrency(row.estimatedValue.toString()) }}
        </span>
        <span v-else class="text-gray-400">-</span>
      </template>
    </el-table-column>

    <el-table-column label="Assigned To" prop="User.name" width="150" />

    <el-table-column label="Last Update" width="140">
      <template #default="{ row }">
        <div>
          <div class="font-semibold text-sm">
            {{ dayjs(row.updatedAt).fromNow() }}
          </div>
          <div class="text-xs text-gray-500">
            {{ formatDate(row.updatedAt) }}
          </div>
        </div>
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
        <el-dropdown @click.stop>
          <span class="el-dropdown-link">
            <el-icon>
              <ElIconMoreFilled />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                :icon="ElIconView"
                @click.native.prevent="navigateTo(`/crm/leads/${row.id}`)"
              >
                View Details
              </el-dropdown-item>
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
import {
  StarFilled,
  PhoneFilled,
  CircleCheckFilled,
  SuccessFilled,
  CircleCloseFilled,
  CloseBold,
  More,
  Share,
  Promotion,
  ChatDotRound,
  Link,
  Phone,
  Calendar,
} from "@element-plus/icons-vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const url = "/api/leads";
const queryKey = "leads";

const authStore = useAuthStore();
const currentUserId = computed(() => authStore.user?.id);

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

const handleNewLead = () => {
  openForm({
    companyId: companyId.value,
    userId: currentUserId.value,
  });
};

watch(companyId, () => {
  page.value = 1;
  refreshData();
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();

const handleRowClick = (row) => {
  navigateTo(`/crm/leads/${row.id}`);
};
</script>
