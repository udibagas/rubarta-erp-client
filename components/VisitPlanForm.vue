<template>
  <el-dialog
    v-model="show"
    width="750px"
    :title="!!form.id ? 'EDIT VISIT PLAN' : 'ADD VISIT PLAN'"
    :close-on-click-modal="false"
    @close="resetForm"
  >
    <el-form label-width="160px" label-position="left">
      <el-form-item label="Title" required :error="errors.title">
        <el-input placeholder="Visit plan title" v-model="form.title" />
      </el-form-item>

      <el-form-item label="Customer" :error="errors.customerId" required>
        <el-select
          v-model="form.customerId"
          placeholder="Select customer"
          filterable
          @change="handleCustomerChange"
        >
          <el-option
            v-for="customer in customers"
            :key="customer.id"
            :value="customer.id"
            :label="customer.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Contact" :error="errors.contactId">
        <el-select
          v-model="form.contactId"
          placeholder="Select contact"
          filterable
          clearable
        >
          <el-option
            v-for="contact in filteredContacts"
            :key="contact.id"
            :value="contact.id"
            :label="contact.name"
          >
            <div class="flex items-center gap-2">
              <el-avatar
                :size="24"
                :style="{ backgroundColor: getAvatarColor(contact.name) }"
              >
                {{ contact.name?.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="flex flex-col">
                <span class="font-semibold text-sm">{{ contact.name }}</span>
                <div class="text-xs text-gray-500">
                  <span v-if="contact.email">{{ contact.email }}</span>
                  <span v-if="contact.phone"> • {{ contact.phone }}</span>
                </div>
              </div>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Assigned User" required :error="errors.userId">
        <el-select v-model="form.userId" placeholder="Select user" filterable>
          <el-option
            v-for="user in users"
            :key="user.id"
            :value="user.id"
            :label="user.name"
          />
        </el-select>
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="Visit Date" required :error="errors.visitDate">
            <el-date-picker
              v-model="form.visitDate"
              type="datetime"
              placeholder="Select date and time"
              value-format="YYYY-MM-DDTHH:mm:ssZ"
              format="DD-MMM-YYYY HH:mm"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Status" required :error="errors.status">
            <el-select
              v-model="form.status"
              placeholder="Select status"
              style="width: 100%"
            >
              <el-option value="Planned" label="Planned" />
              <el-option value="Completed" label="Completed" />
              <el-option value="Cancelled" label="Cancelled" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Location" :error="errors.location">
        <el-input
          placeholder="Visit location/address"
          v-model="form.location"
        />
      </el-form-item>

      <el-form-item label="Purpose" :error="errors.purpose">
        <el-input
          type="textarea"
          :rows="3"
          placeholder="Purpose of the visit"
          v-model="form.purpose"
        />
      </el-form-item>

      <el-form-item
        label="Notes"
        :error="errors.notes"
        v-if="form.status !== 'Completed'"
      >
        <el-input
          type="textarea"
          :rows="2"
          placeholder="Additional notes"
          v-model="form.notes"
        />
      </el-form-item>

      <el-form-item
        label="Outcome"
        :error="errors.outcome"
        v-if="form.status === 'Completed'"
      >
        <el-input
          type="textarea"
          :rows="3"
          placeholder="Visit outcome and results"
          v-model="form.outcome"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="closeForm">CANCEL</el-button>
      <el-button type="success" @click="save" :loading="isSaving">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { getAvatarColor } from "~/utils/avatar";

const request = useRequest();
const queryClient = useQueryClient();

// Local state
const show = ref(false);
const form = ref({
  title: "",
  customerId: null,
  contactId: null,
  userId: null,
  visitDate: "",
  status: "Planned",
  location: "",
  purpose: "",
  notes: "",
  outcome: "",
});
const errors = ref({});
const isSaving = ref(false);

// Fetch customers
const { data: customers } = useQuery({
  queryKey: ["customers"],
  queryFn: async () => {
    return await request("/api/customers");
  },
});

// Fetch contacts
const { data: contacts } = useQuery({
  queryKey: ["contacts"],
  queryFn: async () => {
    return await request("/api/contacts");
  },
});

// Filter contacts by selected customer
const filteredContacts = computed(() => {
  if (!contacts.value || !form.value.customerId) return [];
  return contacts.value.filter(
    (contact) => contact.customerId === form.value.customerId,
  );
});

// Fetch users
const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: async () => {
    return await request("/api/users");
  },
});

// Handle customer change to reset contact
const handleCustomerChange = () => {
  form.value.contactId = null;
};

// Open form method
const openForm = (data = {}) => {
  form.value = {
    title: data.title || "",
    customerId: data.customerId || null,
    contactId: data.contactId || null,
    userId: data.userId || null,
    visitDate: data.visitDate || "",
    status: data.status || "Planned",
    location: data.location || "",
    purpose: data.purpose || "",
    notes: data.notes || "",
    outcome: data.outcome || "",
    id: data.id || null,
  };
  errors.value = {};
  show.value = true;
};

// Reset form
const resetForm = () => {
  form.value = {
    title: "",
    customerId: null,
    contactId: null,
    userId: null,
    visitDate: "",
    status: "Planned",
    location: "",
    purpose: "",
    notes: "",
    outcome: "",
  };
  errors.value = {};
};

// Close form
const closeForm = () => {
  show.value = false;
  resetForm();
};

// Save visit plan
const save = async () => {
  try {
    isSaving.value = true;
    errors.value = {};

    if (form.value.id) {
      await request(`/api/visit-plans/${form.value.id}`, {
        method: "PATCH",
        body: form.value,
      });
    } else {
      await request("/api/visit-plans", {
        method: "POST",
        body: form.value,
      });
    }

    ElMessage.success("Visit plan saved successfully");
    closeForm();
    queryClient.invalidateQueries({ queryKey: ["visit-plans"] });
  } catch (error) {
    errors.value = parseError(error);
    ElMessage.error(error.message || "Failed to save visit plan");
  } finally {
    isSaving.value = false;
  }
};

defineExpose({ openForm });
</script>
