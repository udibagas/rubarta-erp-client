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
    </el-form>

    <template #footer>
      <el-button @click="emit('close')" :icon="CircleCloseFilled">
        CLOSE
      </el-button>
      <el-button type="success" @click="save" :icon="SuccessFilled">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { SuccessFilled, CircleCloseFilled } from "@element-plus/icons-vue";
const { user } = useSanctumAuth();
const { show } = defineProps(["show"]);
const emit = defineEmits(["close"]);
const request = useRequest();

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
</script>
