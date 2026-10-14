<template>
  <div class="login-card">
    <div class="login-card-body">
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="login-title">
          {{ challengeId ? "Verify your email" : "Welcome Back" }}
        </h2>
        <p class="login-subtitle">
          {{
            challengeId
              ? "Enter the 6-digit code sent to your email. It is valid for 5 minutes."
              : "Please sign in to your account"
          }}
        </p>
      </div>

      <div v-if="!csrfReady" class="text-center">
        <p v-if="!csrfError">Preparing secure sign-in...</p>
        <template v-else>
          <el-alert :title="csrfError" type="error" :closable="false" />
          <el-button
            class="mt-4"
            type="primary"
            :loading="isCsrfLoading"
            @click="prepareLogin"
          >
            Retry
          </el-button>
        </template>
      </div>

      <!-- Login Form -->
      <el-form
        v-else-if="!challengeId"
        @submit.native.prevent="doLogin"
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        class="login-form"
        label-position="top"
        size="large"
      >
        <!-- Email Field -->
        <el-form-item label="Email Address" prop="email">
          <el-input
            v-model="loginForm.email"
            type="email"
            placeholder="Enter your email"
            :prefix-icon="ElIconUser"
            clearable
          />
        </el-form-item>

        <!-- Password Field -->
        <el-form-item label="Password" prop="password" class="mb-10!">
          <el-input
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter your password"
            :prefix-icon="ElIconLock"
            clearable
          >
            <template #suffix>
              <el-icon @click="togglePassword" class="password-toggle">
                <ElIconView v-if="!showPassword" />
                <ElIconHide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- Login Button -->
        <el-form-item class="mb-6">
          <el-button
            type="primary"
            size="large"
            native-type="submit"
            :loading="isLoading"
            class="w-full login-button"
          >
            {{ isLoading ? "Signing In..." : "Sign In" }}
          </el-button>
        </el-form-item>

        <!-- Forgot Password -->
        <div class="text-center">
          <el-link
            type="primary"
            @click="navigateTo('/forgot-password')"
            class="forgot-password-link"
          >
            Forgot your password?
          </el-link>
        </div>
      </el-form>

      <!-- Two-factor code form -->
      <el-form
        v-else
        @submit.native.prevent="doVerify"
        :model="verificationForm"
        :rules="verificationRules"
        ref="verificationFormRef"
        class="login-form"
        label-position="top"
        size="large"
      >
        <el-form-item label="Authentication code" prop="code">
          <el-input
            v-model="verificationForm.code"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            placeholder="Enter 6-digit code"
            :prefix-icon="ElIconLock"
            @input="sanitizeCode"
          />
        </el-form-item>

        <el-form-item class="mb-4">
          <el-button
            type="primary"
            size="large"
            native-type="submit"
            :loading="isLoading"
            class="w-full login-button"
          >
            {{ isLoading ? "Verifying..." : "Verify code" }}
          </el-button>
        </el-form-item>

        <div class="flex justify-between gap-3">
          <el-button
            native-type="button"
            :disabled="isLoading"
            @click="backToLogin"
          >
            Back to login
          </el-button>
          <el-button
            native-type="button"
            :loading="isLoading"
            @click="resendCode"
          >
            Resend code
          </el-button>
        </div>
      </el-form>

      <!-- Footer -->
      <el-divider class="my-8" />
      <div class="text-center text-sm login-footer">
        <p>&copy; {{ year }} Rubarta ERP System. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const { login, verifyTwoFactor } = useAuth();
const { fetchCsrfToken } = useCsrf();

definePageMeta({ layout: "login" });

// Form reference
const loginFormRef = ref();
const verificationFormRef = ref();

// Form data
const loginForm = reactive({
  email: "",
  password: "",
});
const verificationForm = reactive({ code: "" });

const showPassword = ref(false);
const isLoading = ref(false);
const isCsrfLoading = ref(false);
const csrfReady = ref(false);
const csrfError = ref("");
const challengeId = ref("");

// Form validation rules
const loginRules = reactive({
  email: [
    { required: true, message: "Please input your email", trigger: "blur" },
    { type: "email", message: "Please input a valid email", trigger: "blur" },
  ],
  password: [
    { required: true, message: "Please input your password", trigger: "blur" },
    {
      min: 6,
      message: "Password must be at least 6 characters",
      trigger: "blur",
    },
  ],
});
const verificationRules = reactive({
  code: [
    { required: true, message: "Please input the code", trigger: "blur" },
    {
      pattern: /^\d{6}$/,
      message: "Code must be 6 digits",
      trigger: "blur",
    },
  ],
});

// Current year for copyright
const year = new Date().getFullYear();

// Toggle password visibility
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// Handle login submission
const doLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    await loginFormRef.value.validate();
  } catch (error) {
    return;
  }

  isLoading.value = true;

  try {
    await submitLogin();
  } catch (error) {
    showRequestError(error);
  } finally {
    isLoading.value = false;
  }
};

const submitLogin = async () => {
  const response = await login({
    email: loginForm.email,
    password: loginForm.password,
  });

  if (response.twoFactorRequired) {
    challengeId.value = response.challengeId;
    verificationForm.code = "";
    await nextTick();
    document.querySelector('input[autocomplete="one-time-code"]')?.focus();
  }
};

const resendCode = async () => {
  isLoading.value = true;
  try {
    await submitLogin();
  } catch (error) {
    showRequestError(error);
  } finally {
    isLoading.value = false;
  }
};

const doVerify = async () => {
  if (!verificationFormRef.value) return;

  try {
    await verificationFormRef.value.validate();
  } catch (error) {
    return;
  }

  isLoading.value = true;
  try {
    await verifyTwoFactor(challengeId.value, verificationForm.code);
  } catch (error) {
    showRequestError(error, "Invalid or expired code");
  } finally {
    isLoading.value = false;
  }
};

const sanitizeCode = (value) => {
  verificationForm.code = value.replace(/\D/g, "").slice(0, 6);
};

const backToLogin = () => {
  challengeId.value = "";
  verificationForm.code = "";
};

const showRequestError = (error, fallback = "Unable to sign in") => {
  const message =
    error?.data?.message ??
    error?.response?._data?.message ??
    (error?.response ? fallback : error?.message) ??
    fallback;
  ElMessage.error(message);
};

const prepareLogin = async () => {
  isCsrfLoading.value = true;
  csrfError.value = "";
  try {
    await fetchCsrfToken();
    csrfReady.value = true;
  } catch (error) {
    csrfError.value =
      error?.data?.message ??
      error?.response?._data?.message ??
      "Could not prepare secure sign-in. Please try again.";
  } finally {
    isCsrfLoading.value = false;
  }
};

// Focus on email field when component mounts
onMounted(async () => {
  await prepareLogin();
  nextTick(() => {
    const emailInput = document.querySelector('.el-input__inner[type="email"]');
    if (emailInput) {
      emailInput.focus();
    }
  });
});
</script>

<style scoped>
/* Custom CSS Variables for Green Theme */
:root {
  --el-color-primary: #019932;
  --el-color-primary-light-3: #4db366;
  --el-color-primary-light-5: #7dc582;
  --el-color-primary-light-7: #acd79e;
  --el-color-primary-light-8: #c7e3ba;
  --el-color-primary-light-9: #e3f1d6;
  --el-color-primary-dark-2: #016928;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-card-body {
  padding: 3rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.login-form {
  margin-top: 2rem;
}

/* Element Plus Input Customization */
:deep(.el-input) {
  --el-input-border-color: #e5e7eb;
  --el-input-focus-border-color: #019932;
  --el-input-hover-border-color: #019932;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(1, 153, 50, 0.15);
}

:deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 2px rgba(1, 153, 50, 0.2);
}

/* Element Plus Button Customization */
.login-button {
  height: 48px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  background: #019932;
  border-color: #019932;
  transition: all 0.3s ease;
}

.login-button:hover {
  background: #016928;
  border-color: #016928;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(1, 153, 50, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

/* Element Plus Form Label Customization */
:deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

/* Element Plus Checkbox Customization */
:deep(.el-checkbox) {
  --el-checkbox-checked-bg-color: #019932;
  --el-checkbox-checked-border-color: #019932;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #019932;
  border-color: #019932;
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #019932;
}

/* Password Toggle Icon */
.password-toggle {
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.password-toggle:hover {
  color: #019932;
  transform: scale(1.1);
}

/* Forgot Password Link */
.forgot-password-link {
  font-size: 14px;
  transition: all 0.2s ease;
}

.forgot-password-link:hover {
  text-decoration: underline;
}

/* Footer */
.login-footer {
  color: #9ca3af;
}

/* Responsive Design */
@media (max-width: 640px) {
  .login-card-body {
    padding: 2rem;
  }

  .login-title {
    font-size: 1.75rem;
  }
}

/* Animation for form elements */
.login-form .el-form-item {
  animation: slideInUp 0.5s ease-out;
  animation-fill-mode: both;
}

.login-form .el-form-item:nth-child(1) {
  animation-delay: 0.1s;
}
.login-form .el-form-item:nth-child(2) {
  animation-delay: 0.2s;
}
.login-form .el-form-item:nth-child(3) {
  animation-delay: 0.3s;
}
.login-form .el-form-item:nth-child(4) {
  animation-delay: 0.4s;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
