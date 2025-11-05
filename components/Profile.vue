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
          type="info"
          size="small"
          effect="dark"
          class="mr-1"
        >
          {{ role }}
        </el-tag>
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
        <el-upload
          :action="`${config.public.apiBase}/api/file`"
          :with-credentials="true"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
          :multiple="false"
          :show-file-list="false"
        >
          <img
            v-if="formModel.signatureSpeciment"
            :src="`${config.public.apiBase}/${formModel.signatureSpeciment.filePath}`"
            alt=""
            style="height: 100px"
          />
          <el-button v-else :icon="ElIconUploadFilled"> Upload </el-button>
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
import { useQuery } from "@tanstack/vue-query";
import { currencies } from "~/constants/currencies";

const { user, refreshIdentity } = useAuth();
const { show } = defineProps(["show"]);
const emit = defineEmits(["close"]);
const request = useRequest();
const config = useRuntimeConfig();
const formModel = ref({ ...user.value });
const formErrors = ref({});

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

const { data: departments } = useQuery({
  queryKey: ["departments"],
  queryFn: () => request("/api/departments"),
});

const { data: banks } = useQuery({
  queryKey: ["banks"],
  queryFn: () => request("/api/banks"),
});

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
