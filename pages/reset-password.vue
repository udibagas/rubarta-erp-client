<template>
  <div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold mb-2">Reset Password</h2>
      <p class="text-gray-500">Choose a new password for your account.</p>
    </div>

    <div v-if="invalid" class="text-center">
      <el-alert
        :title="
          token
            ? 'This reset link is invalid, expired, or already used.'
            : 'Reset link is missing.'
        "
        type="error"
        :closable="false"
        show-icon
      />
      <el-button
        type="primary"
        class="mt-6"
        @click="navigateTo('/forgot-password')"
      >
        Request a new link
      </el-button>
    </div>

    <el-form
      v-else
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      size="large"
      @submit.prevent="submit"
    >
      <el-form-item label="New Password" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          show-password
          placeholder="At least 8 characters"
          :prefix-icon="ElIconLock"
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item label="Confirm Password" prop="confirm">
        <el-input
          v-model="form.confirm"
          type="password"
          show-password
          placeholder="Repeat new password"
          :prefix-icon="ElIconLock"
          autocomplete="new-password"
        />
      </el-form-item>

      <el-button
        type="success"
        native-type="submit"
        :loading="loading"
        class="w-full"
      >
        Reset password
      </el-button>

      <div class="text-center mt-6">
        <el-link type="primary" @click="navigateTo('/login')">
          Back to login
        </el-link>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "login" });

const route = useRoute();
const request = useRequest();
const { csrfHeaders } = useCsrf();

const token = computed(() => {
  const t = route.query.token;
  return typeof t === "string" ? t : "";
});

const formRef = ref();
const form = reactive({ password: "", confirm: "" });
const loading = ref(false);
const invalid = ref(!token.value);

const rules = {
  password: [
    { required: true, message: "Please input a new password", trigger: "blur" },
    {
      min: 8,
      message: "Password must be at least 8 characters",
      trigger: "blur",
    },
  ],
  confirm: [
    {
      validator: (_: unknown, value: string, cb: (e?: Error) => void) =>
        value === form.password
          ? cb()
          : cb(new Error("Passwords do not match")),
      trigger: "blur",
    },
  ],
};

async function submit() {
  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  loading.value = true;
  try {
    const res = await request<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: { token: token.value, password: form.password },
      headers: await csrfHeaders(),
    });
    ElMessage.success(res.message);
    await navigateTo("/login");
  } catch (error: any) {
    if (error?.response?.status === 400) {
      // Password length is validated client-side, so a 400 means a bad link
      invalid.value = true;
    } else if (!error?.response) {
      ElMessage.error("Unable to reset password. Please try again.");
    }
  } finally {
    loading.value = false;
  }
}
</script>
