<template>
  <el-dialog v-model="showDetail">
    <template #header="{ titleId, titleClass }">
      <div class="my-header">
        <div :id="titleId" :class="titleClass">EXPENSE NOTE DETAIL</div>
      </div>
    </template>

    <el-descriptions :border="true" :column="1" direction="horizontal">
      <el-descriptions-item label="Date">
        {{ formatDate(detail.date) }}
      </el-descriptions-item>

      <el-descriptions-item label="Expense Type">
        {{ detail.expenseType?.name }}
      </el-descriptions-item>

      <el-descriptions-item label="Description">
        {{ detail.description }}
      </el-descriptions-item>

      <el-descriptions-item label="Amount">
        {{ toRupiah(detail.amount) }}
      </el-descriptions-item>
    </el-descriptions>

    <br />

    <div v-if="detail.attachment">
      <el-image
        :src="attachment"
        :zoom-rate="1.2"
        :max-scale="7"
        :min-scale="0.2"
        :preview-src-list="[attachment]"
        fit="contain"
      />
    </div>

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="closeDetail">
        CLOSE
      </el-button>

      <el-button :icon="SuccessFilled" type="warning" @click="edit(detail)">
        EDIT
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { SuccessFilled, CircleCloseFilled } from "@element-plus/icons-vue";
import { showDetail, detail, closeDetail } from "~/stores/detail";
import { openForm } from "~/stores/form";

const config = useRuntimeConfig();
const attachment = computed(
  () => `${config.public.apiBase}/${detail.value.attachment?.filePath}`
);

function edit(data) {
  closeDetail();
  openForm(data);
}
</script>
