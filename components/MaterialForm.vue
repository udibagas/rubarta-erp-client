<template>
  <el-dialog
    v-model="show"
    width="700px"
    :title="!!form.id ? 'EDIT MATERIAL' : 'ADD MATERIAL'"
    :close-on-click-modal="false"
  >
    <el-card shadow="never">
      <template #header>
        <el-steps :active="activeStep" finish-status="success" align-center>
          <el-step
            v-for="(step, index) in steps"
            :key="index"
            :icon="step.icon"
            @click="activeStep = index"
          >
            <template #title>
              <span class="text-xs"> {{ step.title }} </span>
            </template>
          </el-step>
        </el-steps>
      </template>

      <el-form label-position="top" require-asterisk-position="right">
        <div
          v-if="activeStep === 0"
          class="grid grid-cols-1 gap-x-5 md:grid-cols-2"
        >
          <el-form-item label="Part Number" :error="errors.partNumber" required>
            <el-input placeholder="Part Number" v-model="form.partNumber" />
          </el-form-item>

          <el-form-item
            label="Interchange Part Number"
            :error="errors.interchangePartNumber"
          >
            <el-input
              placeholder="Interchange Part Number"
              v-model="form.interchangePartNumber"
            />
          </el-form-item>

          <el-form-item label="Material Name" :error="errors.name" required>
            <el-input placeholder="Material Name" v-model="form.name" />
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

          <el-form-item label="Model" :error="errors.model">
            <el-input placeholder="Model" v-model="form.model" />
          </el-form-item>

          <el-form-item label="Description" :error="errors.description">
            <el-input
              type="textarea"
              autosize
              placeholder="Description"
              v-model="form.description"
            />
          </el-form-item>
        </div>

        <div
          v-else-if="activeStep === 1"
          class="grid grid-cols-1 gap-x-5 md:grid-cols-2"
        >
          <el-form-item label="Supplier" :error="errors.supplierIds">
            <el-select
              v-model="form.supplierIds"
              placeholder="Select Supplier"
              style="width: 100%"
              filterable
              clearable
              multiple
              collapse-tags
              collapse-tags-tooltip
              @change="(v) => syncMaterialPrices(v)"
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
            <el-input placeholder="e.g., pcs, kg, meter" v-model="form.unit" />
          </el-form-item>

          <el-form-item label="Weight (kg)" :error="errors.weight">
            <el-input-number
              v-model="form.weight"
              placeholder="0"
              controls-position="right"
              style="width: 100%"
            >
            </el-input-number>
          </el-form-item>

          <el-form-item label="Lead Time (days)" :error="errors.leadTimeDays">
            <el-input-number
              v-model="form.leadTimeDays"
              :min="0"
              controls-position="right"
              style="width: 100%"
              placeholder="0"
            />
          </el-form-item>
        </div>

        <div v-else-if="activeStep === 2">
          <div class="grid grid-cols-1 gap-x-5 md:grid-cols-2">
            <el-form-item label="Selling Price" :error="errors.sellingPrice">
              <el-input
                v-model="form.sellingPrice"
                placeholder="0"
                :formatter="formatNumberInput"
                :parser="parseNumberInput"
              >
                <template #prepend>
                  <el-select
                    v-model="form.sellingCurrency"
                    placeholder="Curr"
                    style="width: 100px"
                    clearable
                  >
                    <el-option
                      :label="c"
                      :value="c"
                      v-for="c in currencies"
                      :key="c"
                    ></el-option>
                  </el-select>
                </template>
              </el-input>
            </el-form-item>
          </div>

          <el-table :data="form.materialPrices || []">
            <el-table-column label="Supplier">
              <template #default="{ row }">
                <el-select
                  v-model="row.supplierId"
                  placeholder="Select Supplier"
                  disabled
                >
                  <el-option
                    v-for="s in suppliers.filter((s) =>
                      form.supplierIds.includes(s.id),
                    )"
                    :label="s.name"
                    :value="s.id"
                    :key="s.id"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="Price">
              <template #default="{ row }">
                <el-input
                  v-model="row.purchasePrice"
                  placeholder="0"
                  :formatter="formatNumberInput"
                  :parser="parseNumberInput"
                >
                  <template #prepend>
                    <el-select
                      v-model="row.currency"
                      placeholder="Curr"
                      style="width: 100px"
                      clearable
                    >
                      <el-option
                        :label="c"
                        :value="c"
                        v-for="c in currencies"
                        :key="c"
                      />
                    </el-select>
                  </template>
                </el-input>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-else class="grid grid-cols-1 gap-x-5 md:grid-cols-2">
          <el-form-item label="Current Stock" :error="errors.currentStock">
            <el-input-number
              v-model="form.currentStock"
              :min="0"
              style="width: 100%"
              placeholder="0"
              controls-position="right"
            />
          </el-form-item>

          <el-form-item label="MOQ" :error="errors.moq">
            <el-input-number
              v-model="form.moq"
              :min="0"
              style="width: 100%"
              placeholder="0"
              controls-position="right"
            />
          </el-form-item>

          <el-form-item label="Min Stock" :error="errors.minStock">
            <el-input-number
              v-model="form.minStock"
              :min="0"
              controls-position="right"
              style="width: 100%"
              placeholder="0"
            />
          </el-form-item>

          <el-form-item label="Status" :error="errors.isActive">
            <el-switch
              v-model="form.isActive"
              inline-prompt
              active-text="Active"
              inactive-text="Inactive"
              size="large"
              style="
                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #ff4949;
              "
            />
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <template #footer>
      <el-button
        :icon="ElIconCircleCloseFilled"
        @click="closeForm"
        type="info"
        bg
        text
      >
        CANCEL
      </el-button>
      <el-button
        type="success"
        plain
        v-if="activeStep > 0"
        @click="activeStep--"
        :icon="ElIconBack"
      >
        PREVIOUS
      </el-button>
      <el-button type="success" v-if="activeStep < 3" @click="activeStep++">
        NEXT
        <el-icon class="ml-1.5">
          <ElIconRight />
        </el-icon>
      </el-button>
      <el-button
        v-else
        :icon="ElIconSuccessFilled"
        type="success"
        @click="saveMaterial"
      >
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";
import { currencies } from "@/constants";

const activeStep = ref(0);

const steps = [
  { title: "Material Information", icon: ElIconDocument },
  { title: "Sourcing & Specifications", icon: ElIconMemo },
  { title: "Pricing", icon: ElIconPriceTag },
  { title: "Inventory", icon: ElIconBox },
];

const saveMaterial = () => {
  const normalizePrice = (value) => {
    return typeof value === "string" ? Number(value) : value;
  };

  const { materialPrices, ...data } = form.value;

  save({
    ...data,
    purchasePrice: normalizePrice(form.value.purchasePrice),
    sellingPrice: normalizePrice(form.value.sellingPrice),
    weight: form.value.weight * 1000,
    materialPrices: materialPrices.map((mp) => ({
      supplierId: mp.supplierId,
      purchasePrice: normalizePrice(mp.purchasePrice),
      currency: mp.currency,
    })),
  });
};

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
  if (newValue) {
    activeStep.value = 0;

    if (!form.value.id) {
      // Set defaults for new material
      form.value.isActive = true;
      form.value.currentStock = 0;
      form.value.minStock = 0;
      form.value.unitPrice = 0;
      form.value.leadTimeDays = 0;
      form.value.materialPrices = [];
    }
  }
});

function syncMaterialPrices(newSupplierIds) {
  form.value.materialPrices = newSupplierIds.map((id) => {
    const existing = form.value.materialPrices.find(
      (mp) => mp.supplierId === id,
    );
    return (
      existing || { supplierId: id, purchasePrice: 0, currency: currencies[0] }
    );
  });
}
</script>
