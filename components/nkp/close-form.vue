<template>
  <el-dialog
    title="CLOSE NKP"
    width="550"
    :model-value="prop.show"
    :before-close="() => close()"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Bank Ref No." :error="errors.bankRefNo">
        <el-input
          v-model="form.bankRefNo"
          placeholder="Bank Ref No."
        ></el-input>
      </el-form-item>
      <el-form-item label="Attachment" :error="errors.attachments">
        <el-upload
          v-model:file-list="fileList"
          :action="`${config.public.apiBase}/api/file`"
          :with-credentials="true"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
          :multiple="true"
          style="width: 100%"
        >
          <el-button type="success" plain :icon="ElIconUpload"
            >Upload</el-button
          >
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :icon="ElIconCircleCloseFilled" @click="close()">
        CLOSE
      </el-button>

      <el-button :icon="ElIconSuccessFilled" type="success" @click="submit()">
        SUBMIT
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const prop = defineProps(["show", "id"]);
const emit = defineEmits(["close", "refresh"]);
const request = useRequest();
const config = useRuntimeConfig();
const form = ref({});
const errors = ref({});
const fileList = ref([]);
const attachments = ref([]);

async function submit() {
  try {
    await ElMessageBox.confirm("Ada yakin akan menutup NKP ini?", "Perhatian", {
      center: true,
    });

    await request(`/api/nkp/close/${prop.id}`, {
      method: "POST",
      body: { bankRefNo: form.value.bankRefNo, attachments: attachments.value },
    });
    close();
    emit("refresh");
  } catch (error) {
    if (error.response?.status == 400) {
      errors.value = error.response._data.errors;
    }

    console.log(error);
  }
}

function handleSuccess(response, file, files) {
  attachments.value.push(response);
}

function handlePreview(file) {
  window.open(`${config.public.apiBase}/${file.filePath}`, "_blank");
}

function handleRemove(file) {
  const path = file.response?.filePath ?? file.filePath;
  const index = attachments.value.findIndex((el) => el.filePath == path);
  if (index !== -1) attachments.value.splice(index, 1);

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

function close() {
  form.value = {};
  errors.value = {};
  fileList.value = [];
  attachments.value = [];
  emit("close");
}
</script>
