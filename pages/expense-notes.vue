<template>
  <el-page-header @back="goBack">
    <template #content>
      <span class="text-large font-600"> EXPENSE NOTES </span>
    </template>
    <template #extra>
      <el-button
        size="small"
        type="danger"
        :icon="Checked"
        @click="
          openForm({
            cashAdvance: 0,
            companyId: companyId,
            departmentId: user.departmentId,
            ExpenseClaimItem: { ...data },
          })
        "
      >
        CLAIM
      </el-button>

      <el-button size="small" @click="openForm()" type="success" :icon="Plus">
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
        <strong>{{ toRupiah(row.amount) }}</strong>
      </template>
    </el-table-column>

    <el-table-column
      fixed="right"
      width="60px"
      align="center"
      header-align="center"
    >
      <template #header>
        <el-button link @click="refreshData()" :icon="Refresh"> </el-button>
      </template>
      <template #default="{ row }">
        <el-dropdown>
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

  <ExpenseClaimSummary v-if="isSuccess" :items="data" />

  <table class="table">
    <tbody>
      <tr>
        <td>TOTAL</td>
        <td class="text-right">
          <strong>
            {{
              toRupiah(
                data?.reduce(
                  (total, current) => total + Number(current.amount),
                  0
                )
              )
            }}
          </strong>
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
</template>

<script setup>
import {
  Refresh,
  Plus,
  Edit,
  Delete,
  MoreFilled,
  Checked,
} from "@element-plus/icons-vue";

import { openDetail } from "~/stores/detail";

const { user } = useSanctumAuth();
const config = useRuntimeConfig();
const companyId = ref(useCookie("companyId"));

const { openForm, removeMutation, fetchData, refreshData, handleRemove } =
  useCrud({
    url: "/api/expense-notes",
    queryKey: "expense-notes",
  });

const { isPending, data, isSuccess } = fetchData();
const { mutate: remove } = removeMutation();
</script>
