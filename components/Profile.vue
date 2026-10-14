<template>
  <el-dialog
    title="MY PROFILE"
    :model-value="show"
    width="500px"
    :before-close="(done) => emit('close')"
  >
    <el-form label-width="180px" label-position="left">
      <el-form-item label="Name" :error="formErrors.name">
        <el-input placeholder="Name" v-model="formModel.name"></el-input>
      </el-form-item>

      <el-form-item label="Email" :error="formErrors.email">
        <el-input placeholder="Email" v-model="formModel.email"></el-input>
      </el-form-item>

      <el-form-item label="Roles">
        <el-tag
          v-for="role in formModel.roles"
          :key="role"
          type="success"
          size="large"
          effect="plain"
          class="mr-1"
        >
          {{ role }}
        </el-tag>
      </el-form-item>

      <el-form-item label="Email 2FA">
        <el-switch
          v-model="twoFactorEnabled"
          :loading="isTwoFactorLoading"
          :disabled="isTwoFactorLoading"
          active-text="Enabled"
          inactive-text="Disabled"
          @change="changeTwoFactor"
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
          inline-prompt
        />
      </el-form-item>

      <el-form-item label="Password" :error="formErrors.password">
        <el-input
          type="password"
          placeholder="Password"
          v-model="formModel.password"
        ></el-input>
      </el-form-item>

      <el-form-item label="Department" :error="formErrors.departmentId">
        <el-select
          v-model="formModel.departmentId"
          placeholder="Department"
          style="width: 100%"
        >
          <el-option
            v-for="(el, i) in departments"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Bank" :error="formErrors.bankId">
        <el-select
          v-model="formModel.bankId"
          placeholder="Bank"
          style="width: 100%"
        >
          <el-option
            v-for="(el, i) in banks"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Bank Account" :error="formErrors.bankAccount">
        <el-input
          placeholder="Bank Account"
          v-model="formModel.bankAccount"
        ></el-input>
      </el-form-item>

      <el-form-item label="Currency" :error="errors.currency">
        <el-select
          v-model="form.currency"
          placeholder="Currency"
          style="width: 100%"
        >
          <el-option
            v-for="(c, i) in currencies"
            :value="c"
            :label="c"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="Signature Speciment"
        :error="formErrors.signatureSpeciment"
      >
        <img
          v-if="formModel.signatureSpeciment"
          :src="`${config.public.apiBase}/${formModel.signatureSpeciment.filePath}`"
          alt=""
          class="mb-4"
        />

        <el-upload
          :action="`${config.public.apiBase}/api/file`"
          :with-credentials="true"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
          :multiple="false"
          :show-file-list="false"
        >
          <el-button :icon="ElIconUploadFilled">
            {{ formModel.signatureSpeciment ? "Change" : "Upload" }}
          </el-button>
        </el-upload>
      </el-form-item>

      <el-form-item> </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('close')" :icon="ElIconCircleCloseFilled">
        CLOSE
      </el-button>
      <el-button type="success" @click="save" :icon="ElIconSuccessFilled">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { gql } from "@apollo/client";
import { currencies } from "~/constants/currencies";

const { user, refreshIdentity, setTwoFactorEnabled } = useAuth();
const { show } = defineProps(["show"]);
const emit = defineEmits(["close"]);
const request = useRequest();
const config = useRuntimeConfig();
const formModel = ref({ ...user.value });
const formErrors = ref({});
const twoFactorEnabled = ref(!!user.value?.twoFactorEnabled);
const isTwoFactorLoading = ref(false);

watch(
  () => user.value?.twoFactorEnabled,
  (enabled) => {
    twoFactorEnabled.value = !!enabled;
  },
);

const changeTwoFactor = async (enabled) => {
  isTwoFactorLoading.value = true;
  try {
    const { value: password } = await ElMessageBox.prompt(
      "Enter your current password to change this setting.",
      "Confirm password",
      {
        inputType: "password",
        inputValidator: (value) => !!value || "Password is required",
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
      },
    );

    twoFactorEnabled.value = await setTwoFactorEnabled(enabled, password);
    ElMessage.success(
      `Email two-factor authentication ${
        twoFactorEnabled.value ? "enabled" : "disabled"
      }`,
    );
  } catch (error) {
    twoFactorEnabled.value = !enabled;
    if (error === "cancel" || error === "close") return;

    const message =
      error?.data?.message ??
      error?.response?._data?.message ??
      error?.message ??
      "Could not update two-factor authentication";
    ElMessage.error(message);
  } finally {
    isTwoFactorLoading.value = false;
  }
};

const save = () => {
  const loadingInstance = ElLoading.service({ target: ".el-dialog" });

  request(`/api/users/${formModel.value.id}`, {
    method: "PATCH",
    body: formModel.value,
  })
    .then((_) => {
      ElMessage({
        message: "Data berhasil diupdate",
        type: "success",
        showClose: true,
      });
      refreshIdentity();
    })
    .catch((e) => (formErrors.value = parseError(e)))
    .finally(() => loadingInstance.close());
};

const {
  data: { departments, banks },
} = await useGraphqlQuery(gql`
  query {
    departments {
      id
      code
      name
    }
    banks {
      id
      code
      name
    }
  }
`);

function handleSuccess(file) {
  formModel.value.signatureSpeciment = file;
}

function handleRemove(file) {
  const path = file.response?.filePath ?? file.filePath;
  formModel.value.signatureSpeciment = null;
  request(`/api/file`, {
    method: "DELETE",
    params: { path },
  }).then((res) => {
    ElMessage({
      message: res.message,
      type: "success",
      showClose: true,
    });
  });
}
</script>
