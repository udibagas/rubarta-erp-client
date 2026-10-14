<template>
  <div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold mb-2">Forgot Password</h2>
      <p class="text-gray-500">
        Enter your email and we'll send you a link to reset your password.
      </p>
    </div>

    <div v-if="sent" class="text-center">
      <el-alert :title="message" type="success" :closable="false" show-icon />
      <el-link type="primary" class="mt-6" @click="navigateTo('/login')">
        Back to login
      </el-link>
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
      <el-form-item label="Email Address" prop="email">
        <el-input
          v-model="form.email"
          type="email"
          placeholder="Enter your email"
          :prefix-icon="ElIconUser"
          clearable
        />
      </el-form-item>

      <el-button
        type="success"
        native-type="submit"
        :loading="loading"
        class="w-full"
      >
        Send reset link
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

const request = useRequest();
const { csrfHeaders } = useCsrf();

const formRef = ref();
const form = reactive({ email: "" });
const loading = ref(false);
const sent = ref(false);
const message = ref("");

const rules = {
  email: [
    { required: true, message: "Please input your email", trigger: "blur" },
    { type: "email", message: "Please input a valid email", trigger: "blur" },
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
    const res = await request<{ message: string }>(
      "/api/auth/forgot-password",
      {
        method: "POST",
        body: { email: form.email },
        headers: await csrfHeaders(),
      },
    );
    message.value = res.message;
    sent.value = true;
  } catch (error: any) {
    ElMessage.error(
      error?.data?.message ?? "Unable to process request. Please try again.",
    );
  } finally {
    loading.value = false;
  }
}
</script>
