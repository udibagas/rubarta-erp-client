<template>
  <el-dialog
    v-model="show"
    width="1200px"
    :title="!!form.id ? 'Edit Customer' : 'Add New Customer'"
    :close-on-click-modal="false"
  >
    <el-form label-width="160px" label-position="left">
      <div class="flex gap-8">
        <div class="flex-1">
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
              :rows="4"
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
        </div>
        <div class="flex-1">
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

          <el-form-item
            label="Account Manager"
            :error="errors.accountManagerId"
          >
            <el-select
              v-model="form.accountManagerId"
              placeholder="Account Manager"
              filterable
              default-first-option
            >
              <el-option
                v-for="user in users"
                :key="user.id"
                :value="user.id"
                :label="user.name"
              />
              <template #prefix>
                <el-icon><ElIconUser /></el-icon>
              </template>
            </el-select>
          </el-form-item>

          <el-form-item label="Active" :error="errors.isActive">
            <el-switch
              v-model="form.isActive"
              inline-prompt
              style="
                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #ff4949;
              "
              active-text="Yes"
              inactive-text="No"
            />
          </el-form-item>
        </div>
      </div>
    </el-form>

    <el-card header="CONTACTS" shadow="never" body-class="p-0!">
      <el-table stripe v-loading="isPending" :data="form.Contacts || []">
        <template #empty>
          <el-empty description="No Items"> </el-empty>
        </template>

        <el-table-column label="Name">
          <template #default="{ row }">
            <el-input v-model="row.name" placeholder="Name" />
          </template>
        </el-table-column>

        <el-table-column label="Position">
          <template #default="{ row }">
            <el-input v-model="row.position" placeholder="Position" />
          </template>
        </el-table-column>

        <el-table-column label="Email">
          <template #default="{ row }">
            <el-input v-model="row.email" placeholder="Email" />
          </template>
        </el-table-column>

        <el-table-column label="Phone">
          <template #default="{ row }">
            <el-input v-model="row.phone" placeholder="Phone" />
          </template>
        </el-table-column>

        <el-table-column label="Notes">
          <template #default="{ row }">
            <el-input v-model="row.notes" placeholder="Notes" />
          </template>
        </el-table-column>

        <el-table-column label="Primary" prop="isPrimary" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isPrimary"
              inline-prompt
              style="
                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #ff4949;
              "
              active-text="Y"
              inactive-text="N"
            />
          </template>
        </el-table-column>

        <el-table-column
          width="60px"
          align="center"
          header-align="center"
          fixed="right"
        >
          <template #header>
            <el-button
              type="primary"
              link
              @click="() => addContact()"
              :icon="ElIconPlus"
            />
          </template>
          <template #default="{ row, $index }">
            <el-button
              type="danger"
              link
              @click="() => removeContact($index)"
              :icon="ElIconDelete"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <template #footer>
      <el-button
        :icon="ElIconCircleCloseFilled"
        @click="closeForm"
        type="info"
        plain
      >
        CANCEL
      </el-button>
      <el-button
        :icon="ElIconSuccessFilled"
        type="success"
        @click="save(form, { onSuccess: () => emit('saved') })"
      >
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";
const emit = defineEmits(["saved"]);

const { errors, form, show, closeForm, saveMutation } = useCrud({
  url: "/api/customers",
  queryKey: "customers",
});

const { mutate: save } = saveMutation();

const request = useRequest();

const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: () => request("/api/users"),
});

function addContact() {
  if (!form.value.Contacts) {
    form.value.Contacts = [];
  }

  form.value.Contacts.push({
    name: "",
    position: "",
    email: "",
    phone: "",
    notes: "",
    isPrimary: false,
  });
}

function removeContact(index) {
  form.value.Contacts.splice(index, 1);
}
</script>
