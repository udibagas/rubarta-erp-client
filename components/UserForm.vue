<template>
  <el-dialog
    v-model="show"
    width="500px"
    :title="!!form.id ? 'EDIT EMPLOYEE' : 'ADD EMPLOYEE'"
    :close-on-click-modal="false"
  >
    <el-form label-width="160px" label-position="left">
      <el-form-item label="Name" :error="errors.name">
        <el-input placeholder="Name" v-model="form.name"></el-input>
      </el-form-item>

      <el-form-item label="Email" :error="errors.email">
        <el-input placeholder="Email" v-model="form.email"></el-input>
      </el-form-item>

      <el-form-item label="Password" :error="errors.password">
        <el-input
          type="password"
          placeholder="Password"
          v-model="form.password"
        ></el-input>
      </el-form-item>

      <el-form-item label="Roles" :error="errors.roles">
        <el-select
          v-model="form.roles"
          placeholder="Roles"
          style="width: 100%"
          multiple
        >
          <el-option
            v-for="(role, i) in roles"
            :value="role"
            :label="role"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Department" :error="errors.departmentId">
        <el-select
          v-model="form.departmentId"
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

      <el-form-item label="Bank" :error="errors.bankId">
        <el-select v-model="form.bankId" placeholder="Bank" style="width: 100%">
          <el-option
            v-for="(el, i) in banks"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Bank Account" :error="errors.bankAccount">
        <el-input
          placeholder="Bank Account"
          v-model="form.bankAccount"
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

      <el-form-item label="Status" :error="errors.active">
        <el-switch
          :active-value="true"
          :inactive-value="false"
          v-model="form.active"
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
        >
        </el-switch>
        <el-tag
          :type="form.active ? 'success' : 'danger'"
          size="small"
          style="margin-left: 10px"
          effect="dark"
        >
          {{ !!form.active ? "Aktif" : "Nonaktif" }}
        </el-tag>
      </el-form-item>

      <el-form-item
        label="Signature Speciment"
        :error="errors.signatureSpeciment"
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
            v-if="form.signatureSpeciment"
            :src="`${config.public.apiBase}/${form.signatureSpeciment.filePath}`"
            alt=""
            style="height: 100px"
          />
          <el-button v-else :icon="ElIconUploadFilled"> Upload </el-button>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :icon="ElIconCircleCloseFilled" @click="closeForm">
        CANCEL
      </el-button>
      <el-button :icon="ElIconSuccessFilled" type="success" @click="save(form)">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { roles } from "~/constants/roles";
import { currencies } from "~/constants/currencies";

const { errors, form, show, closeForm, saveMutation, request } = useCrud({
  url: "/api/users",
  queryKey: "users",
});
const { mutate: save } = saveMutation();

const { data: departments } = useQuery({
  queryKey: ["departments"],
  queryFn: () => request("/api/departments"),
});

const { data: banks } = useQuery({
  queryKey: ["banks"],
  queryFn: () => request("/api/banks"),
});

const config = useRuntimeConfig();

function handleSuccess(file) {
  form.value.signatureSpeciment = file;
}

function handleRemove(file) {
  const path = file.response?.filePath ?? file.filePath;
  form.value.signatureSpeciment = null;
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
