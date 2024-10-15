<template>
  <el-page-header @back="goBack" content="Employee Balance" />

  <br />

  <el-table :data="data" v-loading="isPending" stripe>
    <el-table-column label="Employee">
      <template #default="{ row }"> {{ row.user.name }} </template>
    </el-table-column>

    <el-table-column label="Balance">
      <template #default="{ row }"> {{ toRupiah(row.balance) }} </template>
    </el-table-column>

    <el-table-column label="Description" prop="description"></el-table-column>

    <el-table-column label="Last Update">
      <template #default="{ row }"> {{ formatDate(row.updatedAt) }} </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
const request = useRequest();
const { isPending, data } = useQuery({
  queryKey: ["user-balance"],
  queryFn: () => request("/api/users/balance"),
});
</script>
