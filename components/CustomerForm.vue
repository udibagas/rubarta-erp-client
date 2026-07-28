<template>
  <el-dialog
    v-model="show"
    width="500px"
    :title="!!form.id ? 'EDIT CUSTOMER' : 'ADD CUSTOMER'"
    :close-on-click-modal="false"
  >
    <el-form label-width="160px" label-position="left">
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
          placeholder="Address"
          v-model="form.address"
        />
      </el-form-item>

      <el-form-item label="Email" :error="errors.email">
        <el-input
          placeholder="Email"
          v-model="form.email"
          :prefix-icon="ElIconMessage"
        />
      </el-form-item>

      <el-form-item label="Website" :error="errors.website">
        <el-input
          placeholder="https://www.domain.com"
          v-model="form.website"
          :prefix-icon="ElIconLink"
        />
      </el-form-item>

      <el-form-item label="Phone" :error="errors.phone">
        <el-input
          placeholder="Phone"
          v-model="form.phone"
          :prefix-icon="ElIconPhone"
        />
      </el-form-item>

      <el-form-item label="Industry" :error="errors.industry">
        <el-select
          v-model="form.industry"
          allow-create
          filterable
          default-first-option
          :reserve-keyword="false"
          placeholder="Industry"
          :options="
            [
              'Agriculture & Farming',
              'Construction & Heavy Civil',
              'Mining & Quarrying',
              'Oil, Gas & Energy',
              'Manufacturing',
              'Automotive & Aerospace',
            ].map((t) => ({ label: t, value: t }))
          "
        >
          <template #prefix>
            <el-icon><ElIconTools /></el-icon>
          </template>
        </el-select>
      </el-form-item>

      <el-form-item label="Revenue" :error="errors.revenue">
        <el-input
          placeholder="Revenue"
          v-model="form.revenue"
          :formatter="
            (value) => {
              if (!value) return '';
              const parts = value.toString().split('.');
              parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
              return parts.join(',');
            }
          "
          :parser="(v) => Number(v.replace(/\./g, '').replace(',', '.'))"
        >
          <template #prepend>Rp</template>
        </el-input>
      </el-form-item>

      <el-form-item label="Employee Count" :error="errors.employeeCount">
        <el-input
          placeholder="Employee Count"
          v-model="form.employeeCount"
          :prefix-icon="ElIconUser"
          :formatter="
            (value) => {
              if (!value) return '';
              const parts = value.toString().split('.');
              parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
              return parts.join(',');
            }
          "
          :parser="(v) => Number(v.replace(/\./g, '').replace(',', '.'))"
        />
      </el-form-item>

      <el-form-item label="Tags" :error="errors.tags">
        <el-select
          v-model="form.tags"
          multiple
          allow-create
          filterable
          default-first-option
          :reserve-keyword="false"
          placeholder="Input tags"
          :options="
            [
              'mining',
              'sme',
              'coal',
              'oil and gas',
              'plantation',
              'manufacturer',
            ].map((t) => ({ label: t, value: t }))
          "
        >
          <template #prefix>
            <el-icon><ElIconCollection /></el-icon>
          </template>
        </el-select>
      </el-form-item>

      <el-form-item label="Active" :error="errors.isActive">
        <el-switch
          v-model="form.isActive"
          inline-prompt
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
          active-text="Yes"
          inactive-text="No"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :icon="ElIconCircleCloseFilled" @click="closeForm" type="info">
        CANCEL
      </el-button>
      <el-button :icon="ElIconSuccessFilled" type="success" @click="save(form)">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const { errors, form, show, closeForm, saveMutation } = useCrud({
  url: "/api/customers",
  queryKey: "customers",
});
const { mutate: save } = saveMutation();
</script>
