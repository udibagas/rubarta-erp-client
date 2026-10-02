<template>
  <el-dialog
    v-model="show"
    title="ACCOUNT"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Code" :error="errors.code">
        <el-input v-model="form.code" placeholder="e.g. 1-1000" />
      </el-form-item>
      <el-form-item label="Name" :error="errors.name">
        <el-input v-model="form.name" placeholder="Account name" />
      </el-form-item>
      <el-form-item label="Type" :error="errors.type">
        <el-select v-model="form.type" placeholder="Type" class="w-full">
          <el-option
            v-for="t in ACCOUNT_TYPES"
            :key="t.value"
            :value="t.value"
            :label="t.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Parent Account">
        <el-select
          v-model="form.parentId"
          placeholder="None"
          clearable
          filterable
          class="w-full"
        >
          <el-option
            v-for="a in parents"
            :key="a.id"
            :value="a.id"
            :label="`${a.code} - ${a.name}`"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Postable">
        <el-switch v-model="form.isPostable" />
      </el-form-item>
      <el-form-item label="Description">
        <el-input v-model="form.description" type="textarea" />
      </el-form-item>
      <el-form-item label="Active">
        <el-switch v-model="form.isActive" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button
        :icon="ElIconCircleCloseFilled"
        type="info"
        plain
        @click="show = false"
      >
        CANCEL
      </el-button>
      <el-button :icon="ElIconSuccessFilled" type="success" @click="submit">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  row: { type: Object, default: null },
  parents: { type: Array, default: () => [] },
});
const emit = defineEmits(["save"]);
const show = defineModel("show", { default: false });

const blank = () => ({
  id: null,
  code: "",
  name: "",
  type: "ASSET",
  parentId: null,
  isActive: true,
  isPostable: true,
  description: "",
});
const form = ref(blank());
const errors = ref({});

watch(show, (v) => {
  if (!v) return;
  errors.value = {};
  form.value = props.row
    ? { ...props.row, parentId: props.row.parentId ?? null }
    : blank();
});

function submit() {
  errors.value = {};
  if (!form.value.code) errors.value.code = "Code is required";
  if (!form.value.name) errors.value.name = "Name is required";
  if (Object.keys(errors.value).length) return;
  emit("save", { ...form.value, parentId: form.value.parentId || null });
}
</script>
