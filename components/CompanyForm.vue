<template>
  <el-dialog
    v-model="show"
    :title="form.id ? 'Edit Company' : 'New Company'"
    width="700px"
    :close-on-click-modal="false"
    :before-close="closeForm"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Code" :error="errors.code">
        <el-input
          placeholder="Code"
          v-model="form.code"
          :prefix-icon="SquareCode"
        />
      </el-form-item>
      <el-form-item label="Name" :error="errors.name">
        <el-input
          placeholder="Name"
          v-model="form.name"
          :prefix-icon="ElIconOfficeBuilding"
        />
      </el-form-item>

      <el-form-item label="Address" :error="errors.address">
        <el-input
          type="textarea"
          :rows="4"
          placeholder="Address"
          v-model="form.address"
        />
      </el-form-item>

      <el-form-item label="Phone" :error="errors.phone">
        <el-input
          placeholder="Phone"
          v-model="form.phone"
          :prefix-icon="ElIconPhone"
        />
      </el-form-item>

      <el-form-item label="Is Default" :error="errors.isDefault">
        <el-switch
          v-model="form.isDefault"
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
          inline-prompt
          active-text="Yes"
          inactive-text="No"
          size="large"
        ></el-switch>
      </el-form-item>
    </el-form>

    <el-table :data="form.banks" style="width: 100%">
      <el-table-column label="Bank Name/Branch">
        <template #default="{ row }">
          <el-input
            placeholder="Bank Name"
            v-model="row.name"
            :prefix-icon="ElIconOfficeBuilding"
            class="mb-1"
          />
          <el-input
            placeholder="Branch"
            v-model="row.branch"
            :prefix-icon="ElIconLocation"
          />
        </template>
      </el-table-column>

      <el-table-column label="Account Number/Holder">
        <template #default="{ row }">
          <el-input
            placeholder="Account Number"
            v-model="row.accountNumber"
            :prefix-icon="ElIconCreditCard"
            class="mb-1"
          />
          <el-input
            placeholder="Account Holder"
            v-model="row.accountName"
            :prefix-icon="ElIconUser"
          />
        </template>
      </el-table-column>

      <el-table-column
        label="Primary"
        prop="isPrimary"
        align="center"
        width="90"
      >
        <template #default="{ row }">
          <el-switch
            v-model="row.isPrimary"
            inline-prompt
            style="
              --el-switch-on-color: #13ce66;
              --el-switch-off-color: #ff4949;
            "
            active-text="Yes"
            inactive-text="No"
          />
        </template>
      </el-table-column>

      <el-table-column width="70" align="center">
        <template #header>
          <el-button
            type="success"
            :icon="ElIconPlus"
            link
            @click="
              form.banks.push({
                name: '',
                branch: '',
                accountNumber: '',
                accountName: '',
              })
            "
          />
        </template>
        <template #default="{ row, $index }">
          <el-button
            :icon="ElIconDelete"
            text
            type="danger"
            @click="form.banks.splice($index, 1)"
          />
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button
        :icon="ElIconCircleCloseFilled"
        @click="closeForm"
        type="info"
        plain
      >
        CANCEL
      </el-button>
      <el-button type="success" :icon="ElIconSuccessFilled" @click="save(form)">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { SquareCode } from "lucide-vue-next";

const { errors, form, show, closeForm, saveMutation } = useCrud({
  url: "/api/companies",
  queryKey: "companies",
});
const { mutate: save } = saveMutation();
</script>
