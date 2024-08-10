<template>
  <el-dialog
    v-model="show"
    title="EXPENSE NOTES"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Date" :error="errors.date">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="Date"
          :disabled-date="disabledDate"
          format="DD-MMM-YYYY"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="Expense Type" :error="errors.expenseTypeId">
        <el-select v-model="form.expenseTypeId" placeholder="Expense Type">
          <el-option
            v-for="(el, i) in expenseTypes"
            :value="el.id"
            :label="el.name"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Description" :error="errors.description">
        <el-input
          type="textarea"
          v-model="form.description"
          placeholder="Description"
          :rows="1"
        />
      </el-form-item>

      <el-form-item label="Amount" :error="errors.amount">
        <div class="flex">
          <el-input
            type="number"
            v-model="form.amount"
            placeholder="Amount"
            class="mr-2"
            style="width: 215px"
          />
          <strong>{{ toRupiah(form.amount) }}</strong>
        </div>
      </el-form-item>

      <el-form-item label="Attachment" :error="errors.attachment">
        <el-upload
          v-model:file-list="fileList"
          :action="`${config.public.apiBase}/api/file`"
          :with-credentials="true"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
          :multiple="false"
          :limit="1"
          list-type="picture-card"
        >
          <el-icon class="el-icon--upload">
            <ElIconUploadFilled />
          </el-icon>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :icon="ElIconCircleCloseFilled" @click="closeForm">
        CANCEL
      </el-button>
      <el-button
        :icon="ElIconSuccessFilled"
        type="success"
        @click="submit(form)"
      >
        SAVE
      </el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="showPreview" center>
    <img :src="previewUrl" alt="" style="width: 100%" />

    <template #footer>
      <el-button
        :icon="ElIconCircleCloseFilled"
        @click="showPreview = false"
        type="success"
      >
        CLOSE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const { errors, form, show, closeForm, saveMutation, request } = useCrud({
  url: "/api/expense-notes",
  queryKey: "expense-notes",
});

const { mutate: save } = saveMutation();

const config = useRuntimeConfig();
const fileList = ref(form.value.attachment ? [form.value.attachment] : []);
const showPreview = ref(false);
const previewUrl = ref("");

watch(
  () => form.value.attachment,
  async (value, oldValue) => {
    if (!value) {
      return (fileList.value = []);
    }

    const { fileName: name, fileSize: size, filePath, fileType } = value;

    fileList.value = [
      {
        name,
        size,
        url: `${config.public.apiBase}/${filePath}`,
        filePath,
      },
    ];
  }
);

const { data: expenseTypes } = useQuery({
  queryKey: ["expenseTypes"],
  queryFn: () => request("/api/expense-types"),
});

function submit(data) {
  const { amount, ...payload } = data;
  save({ ...payload, amount: Number(amount) });
}

function disabledDate(time) {
  return time.getTime() > Date.now();
}

function handleSuccess(file) {
  form.value.attachment = file;
}

function handlePreview(file) {
  previewUrl.value = file.url;
  showPreview.value = true;
}

function handleRemove(file) {
  const path = file.response?.filePath ?? file.filePath;
  form.value.attachment = null;
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
