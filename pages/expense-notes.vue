<template>
  <el-page-header @back="goBack">
    <template #content>
      <span class="text-large font-600"> Expense Notes </span>
    </template>
    <template #extra>
      <el-button
        v-if="isSuccess && data.length"
        size="small"
        type="danger"
        :icon="ElIconChecked"
        @click="
          claim({
            cashAdvance: 0,
            totalAmount: totalAmount,
            companyId: companyId,
            userId: user.id,
            departmentId: user.departmentId,
            ExpenseClaimItem: data,
            status: 'SUBMITTED',
          })
        "
      >
        CLAIM
      </el-button>

      <el-button
        size="small"
        @click="openForm()"
        type="success"
        :icon="ElIconPlus"
      >
        NEW EXPENSE NOTES
      </el-button>
    </template>
  </el-page-header>

  <br />

  <el-table
    stripe
    :data="data"
    v-loading="isPending"
    @row-click="(row) => openDetail(row)"
  >
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column width="120" label="Date">
      <template #default="{ row }">
        {{ formatDate(row.date) }}
      </template>
    </el-table-column>

    <el-table-column width="150" label="Expense Type">
      <template #default="{ row }">
        {{ row.ExpenseType?.name }}
      </template>
    </el-table-column>

    <el-table-column
      min-width="100"
      label="Description"
      prop="description"
    ></el-table-column>

    <el-table-column
      width="150"
      label="Amount"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        <strong>{{ toCurrency(row.amount) }}</strong>
      </template>
    </el-table-column>

    <el-table-column
      fixed="right"
      width="60px"
      align="center"
      header-align="center"
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

  <ExpenseClaimSummary v-if="isSuccess && data.length" :items="data" />

  <table class="table" v-if="isSuccess && data.length">
    <tbody>
      <tr>
        <td>TOTAL</td>
        <td class="text-right">
          <strong>{{ toCurrency(totalAmount) }}</strong>
        </td>
      </tr>
    </tbody>
  </table>

  <ImageList
    v-if="isSuccess"
    :src-list="
      data
        .filter((d) => d.attachment)
        .map((el) => `${config.public.apiBase}/${el.attachment.filePath}`)
    "
  />

  <ExpenseNoteForm />
  <ExpenseNoteDetail />
  <ExpenseNoteClaim
    :data="claimForm"
    :show="showClaimForm"
    @close="showClaimForm = false"
  />
</template>

<script setup>
import { openDetail } from "~/stores/detail";

const { user } = useSanctumAuth();
const config = useRuntimeConfig();
const companyId = ref(useCookie("companyId"));
const claimForm = ref({});
const showClaimForm = ref(false);

const { openForm, removeMutation, fetchData, refreshData, handleRemove } =
  useCrud({
    url: "/api/expense-notes",
    queryKey: "expense-notes",
  });

const { isPending, data, isSuccess } = fetchData();
const { mutate: remove } = removeMutation();

const totalAmount = computed(() => {
  return (
    data.value?.reduce((total, current) => total + Number(current.amount), 0) ??
    0
  );
});

function claim(data) {
  claimForm.value = data;
  showClaimForm.value = true;
}
</script>
