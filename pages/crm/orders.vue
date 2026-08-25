<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="CRM / Orders">
        <template #extra>
          <el-button :icon="ElIconPlus" type="success" @click="openForm()">
            CREATE NEW ORDER
          </el-button>
        </template>
      </el-page-header>
    </template>

    <el-table stripe v-loading="isPending" :data="data">
      <el-table-column type="index" label="#" width="60"></el-table-column>

      <el-table-column label="Order #" prop="number" width="150" />

      <el-table-column
        label="Status"
        prop="status"
        width="120"
        align="center"
        header-align="center"
      >
        <template #default="{ row }">
          <StatusTag :status="row.status" effect="dark" />
        </template>
      </el-table-column>

      <el-table-column label="Date" width="120">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="Customer" prop="Customer.name" min-width="200" />

      <el-table-column label="User" prop="User.name" width="150" />

      <el-table-column
        label="Total Amount"
        width="150"
        align="right"
        header-align="right"
      >
        <template #default="{ row }">
          {{ toDecimal(row.totalAmount) }}
        </template>
      </el-table-column>

      <el-table-column
        label="VAT"
        width="120"
        align="right"
        header-align="right"
      >
        <template #default="{ row }">
          {{ toDecimal(row.vatAmount) }}
        </template>
      </el-table-column>

      <el-table-column
        label="Grand Total"
        width="150"
        align="right"
        header-align="right"
      >
        <template #default="{ row }">
          <strong class="text-green-600">{{
            toDecimal(row.grandTotal)
          }}</strong>
        </template>
      </el-table-column>

      <el-table-column
        label="Delivery Date"
        width="130"
        align="center"
        header-align="center"
      >
        <template #default="{ row }">
          {{ row.deliveryDate ? formatDate(row.deliveryDate) : "-" }}
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
                  @click.native.prevent="edit(row.id)"
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

    <OrderForm />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({
  layout: false,
});

const { openForm, removeMutation, fetchData, refreshData, handleRemove, edit } =
  useCrud({
    url: "/api/orders",
    queryKey: "orders",
  });

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
