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
          @change="onCustomerChange"
        >
          <el-option
            v-for="customer in customers"
            :key="customer.id"
            :value="customer.id"
            :label="customer.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Contact Person" :error="errors.contactPerson">
        <div class="flex w-full gap-2">
          <el-select
            v-model="form.contactId"
            placeholder="Select from contacts"
            filterable
            clearable
            :disabled="!form.customerId"
            :loading="isFetchingContacts"
            @change="onContactChange"
            style="flex: 1"
          >
            <el-option
              v-for="contact in contacts"
              :key="contact.id"
              :value="contact.id"
              :label="contact.name"
            >
              <div class="flex flex-col">
                <span>{{ contact.name }}</span>
                <span v-if="contact.phone" class="text-xs text-gray-400">
                  {{ contact.phone }}
                </span>
              </div>
            </el-option>
          </el-select>
          <el-input
            v-if="!form.contactId"
            v-model="form.contactPerson"
            placeholder="Or type manually"
            style="flex: 1"
          />
        </div>
      </el-form-item>

      <el-form-item label="Contact Phone" :error="errors.contactPhone">
        <el-input
          placeholder="Contact phone number"
          v-model="form.contactPhone"
        />
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
          <el-form-item
            label="Scheduled Date"
            required
            :error="errors.scheduledDate"
          >
            <el-date-picker
              v-model="form.scheduledDate"
              type="date"
              placeholder="Select date"
              value-format="YYYY-MM-DDTHH:mm:ssZ"
              format="DD-MMM-YYYY"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Scheduled Time" :error="errors.scheduledTime">
            <el-time-select
              v-model="form.scheduledTime"
              start="06:00"
              step="00:15"
              end="22:00"
              placeholder="Select time"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
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

        <el-col :span="12">
          <el-form-item
            label="Duration (minutes)"
            :error="errors.estimatedDuration"
          >
            <el-input-number
              v-model="form.estimatedDuration"
              :min="15"
              :max="480"
              :step="15"
              placeholder="Duration"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Visit Type" required :error="errors.visitType">
        <el-radio-group v-model="form.visitType">
          <el-radio value="Offline">Offline</el-radio>
          <el-radio value="Online">Online</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="form.visitType === 'Online'"
        label="Meeting URL"
        :error="errors.meetingUrl"
      >
        <el-input
          placeholder="https://..."
          v-model="form.meetingUrl"
          type="url"
        />
      </el-form-item>

      <el-form-item
        v-if="form.visitType === 'Offline'"
        label="Address"
        :error="errors.address"
      >
        <el-input
          type="textarea"
          :rows="2"
          placeholder="Visit address"
          v-model="form.address"
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
        label="Actual Visit Date"
        :error="errors.actualVisitDate"
        v-if="form.status === 'Completed'"
      >
        <el-date-picker
          v-model="form.actualVisitDate"
          type="datetime"
          placeholder="Actual visit date/time"
          value-format="YYYY-MM-DDTHH:mm:ssZ"
          format="DD-MMM-YYYY HH:mm"
          style="width: 100%"
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
      <el-button @click="closeForm" :icon="ElIconCircleClose">CANCEL</el-button>
      <el-button
        type="success"
        @click="save"
        :loading="isSaving"
        :icon="ElIconCircleCheckFilled"
      >
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";

const request = useRequest();
const queryClient = useQueryClient();
const shared = useSharedStore();
const auth = useAuthStore();
const { companyId } = storeToRefs(shared);

// Local state
const show = ref(false);
const form = ref({
  title: "",
  customerId: null,
  contactId: null,
  contactPerson: "",
  contactPhone: "",
  userId: null,
  scheduledDate: undefined,
  scheduledTime: "",
  estimatedDuration: null,
  status: "Planned",
  actualVisitDate: undefined,
  address: "",
  purpose: "",
  notes: "",
  outcome: "",
  visitType: "Offline",
  meetingUrl: "",
});
const errors = ref({});
const isSaving = ref(false);
const contacts = ref([]);
const isFetchingContacts = ref(false);

// Fetch customers
const { data: customers } = useQuery({
  queryKey: ["customers"],
  queryFn: async () => {
    return await request("/api/customers");
  },
});

// Fetch users
const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: async () => {
    return await request("/api/users");
  },
});

// Fetch contacts for selected customer
const fetchContacts = async (customerId) => {
  if (!customerId) {
    contacts.value = [];
    return;
  }

  try {
    isFetchingContacts.value = true;
    const response = await request(`/api/contacts?customerId=${customerId}`);
    contacts.value = response?.data || response || [];
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    contacts.value = [];
  } finally {
    isFetchingContacts.value = false;
  }
};

// Handle customer change
const onCustomerChange = (customerId) => {
  form.value.contactId = null;
  form.value.contactPerson = "";
  form.value.contactPhone = "";
  fetchContacts(customerId);
};

// Handle contact change
const onContactChange = (contactId) => {
  if (!contactId) {
    // When cleared, allow manual input but don't clear existing values
    return;
  }

  const selectedContact = contacts.value.find((c) => c.id === contactId);
  if (selectedContact) {
    form.value.contactPerson = selectedContact.name;
    form.value.contactPhone = selectedContact.phone || "";
  }
};

// Open form method
const openForm = (data = {}) => {
  form.value = {
    title: data.title || "",
    customerId: data.customerId || null,
    contactId: data.contactId || null,
    contactPerson: data.contactPerson || "",
    contactPhone: data.contactPhone || "",
    userId: data.userId || auth.user?.id || null,
    scheduledDate: data.scheduledDate,
    scheduledTime: data.scheduledTime || "",
    estimatedDuration: data.estimatedDuration || 90,
    status: data.status || "Planned",
    actualVisitDate: data.actualVisitDate,
    address: data.address || "",
    purpose: data.purpose || "",
    notes: data.notes || "",
    outcome: data.outcome || "",
    visitType: data.visitType || "Offline",
    meetingUrl: data.meetingUrl || "",
    id: data.id || null,
  };
  errors.value = {};

  // Fetch contacts if customer is selected
  if (data.customerId) {
    fetchContacts(data.customerId);
  } else {
    contacts.value = [];
  }

  show.value = true;
};

// Reset form
const resetForm = () => {
  form.value = {
    title: "",
    customerId: null,
    contactId: null,
    contactPerson: "",
    contactPhone: "",
    userId: null,
    scheduledDate: undefined,
    scheduledTime: "",
    estimatedDuration: 90,
    status: "Planned",
    actualVisitDate: undefined,
    address: "",
    purpose: "",
    notes: "",
    outcome: "",
    visitType: "Offline",
    meetingUrl: "",
  };
  errors.value = {};
  contacts.value = [];
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
    const body = { ...form.value, companyId: companyId.value };

    const url = form.value.id
      ? `/api/visit-plans/${form.value.id}`
      : "/api/visit-plans";

    await request(url, {
      method: form.value.id ? "PATCH" : "POST",
      body,
    });

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
