<template>
  <el-dialog
    v-model="show"
    width="600px"
    :title="!!form.id ? 'EDIT MATERIAL' : 'ADD MATERIAL'"
    :close-on-click-modal="false"
  >
    <el-form label-width="180px" label-position="left">
      <el-form-item label="Part Number" required :error="errors.partNumber">
        <el-input
          placeholder="Part Number"
          v-model="form.partNumber"
        ></el-input>
      </el-form-item>

      <el-form-item label="Material Name" required :error="errors.name">
        <el-input placeholder="Material Name" v-model="form.name"></el-input>
      </el-form-item>

      <el-form-item label="Model" :error="errors.model">
        <el-input placeholder="Model" v-model="form.model"></el-input>
      </el-form-item>

      <el-form-item label="Description" :error="errors.description">
        <el-input
          type="textarea"
          :rows="3"
          placeholder="Description"
          v-model="form.description"
        ></el-input>
      </el-form-item>

      <el-form-item label="Category" :error="errors.category">
        <el-select
          v-model="form.category"
          placeholder="Select Category"
          style="width: 100%"
          clearable
        >
          <el-option
            v-for="cat in categories"
            :key="cat"
            :value="cat"
            :label="cat"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Supplier" :error="errors.supplierId">
        <el-select
          v-model="form.supplierId"
          placeholder="Select Supplier"
          style="width: 100%"
          filterable
          clearable
        >
          <el-option
            v-for="supplier in suppliers"
            :key="supplier.id"
            :value="supplier.id"
            :label="supplier.name"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Unit" :error="errors.unit">
        <el-input placeholder="e.g., pcs, kg, meter" v-model="form.unit">
        </el-input>
      </el-form-item>

      <el-form-item label="Weight" :error="errors.weight">
        <el-input
          placeholder="0"
          v-model="form.weight"
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
          <template #append>
            <span>grams</span>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Purchase Price" :error="errors.purchasePrice">
        <el-input
          v-model="form.purchasePrice"
          placeholder="0"
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
          <template #prepend>
            <el-select
              v-model="form.purchaseCurrency"
              placeholder="Curr"
              style="width: 100px"
              clearable
            >
              <el-option label="USD" value="USD"></el-option>
              <el-option label="EUR" value="EUR"></el-option>
              <el-option label="IDR" value="IDR"></el-option>
            </el-select>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Selling Price" :error="errors.sellingPrice">
        <el-input
          v-model="form.sellingPrice"
          placeholder="0"
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
          <template #prepend>
            <el-select
              v-model="form.sellingCurrency"
              placeholder="Curr"
              style="width: 100px"
              clearable
            >
              <el-option label="USD" value="USD"></el-option>
              <el-option label="EUR" value="EUR"></el-option>
              <el-option label="IDR" value="IDR"></el-option>
            </el-select>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Current Stock" :error="errors.currentStock">
        <el-input-number
          v-model="form.currentStock"
          :min="0"
          :controls="false"
          style="width: 100%"
          placeholder="0"
        />
      </el-form-item>

      <el-form-item label="Min Stock" :error="errors.minStock">
        <el-input-number
          v-model="form.minStock"
          :min="0"
          :controls="false"
          style="width: 100%"
          placeholder="0"
        />
      </el-form-item>

      <el-form-item label="Lead Time (days)" :error="errors.leadTimeDays">
        <el-input-number
          v-model="form.leadTimeDays"
          :min="0"
          :controls="false"
          style="width: 100%"
          placeholder="0"
        />
      </el-form-item>

      <el-form-item label="Status" :error="errors.isActive">
        <el-switch
          v-model="form.isActive"
          active-text="Active"
          inactive-text="Inactive"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button
        :icon="ElIconCircleCloseFilled"
        @click="closeForm"
        type="info"
        plain
      >
        CANCEL
      </el-button>
      <el-button :icon="ElIconSuccessFilled" type="success" @click="save(form)">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";

const { errors, form, show, closeForm, saveMutation, request } = useCrud({
  url: "/api/materials",
  queryKey: "materials",
});

const { mutate: save } = saveMutation();

// Fetch suppliers
const { data: suppliers } = useQuery({
  queryKey: ["suppliers"],
  queryFn: () => request("/api/suppliers"),
});

// Material categories (same as in the page)
const categories = ref([
  "Raw Material",
  "Component",
  "Finished Product",
  "Packaging",
  "Consumable",
  "Other",
]);

// Set default values when form opens
watch(show, (newValue) => {
  if (newValue && !form.value.id) {
    // Set defaults for new material
    form.value.isActive = true;
    form.value.currentStock = 0;
    form.value.minStock = 0;
    form.value.unitPrice = 0;
    form.value.leadTimeDays = 0;
  }
});
</script>
