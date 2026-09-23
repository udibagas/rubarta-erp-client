<template>
  <el-dialog
    v-model="show"
    title="Send Email"
    width="700px"
    @closed="resetSendForm"
  >
    <el-form :model="sendForm" label-position="left" label-width="100px">
      <el-form-item label="Subject">
        <el-input
          v-model="sendForm.subject"
          placeholder="Sales order subject"
        />
      </el-form-item>

      <el-form-item label="To">
        <el-input v-model="sendForm.to" />
      </el-form-item>

      <el-form-item label="CC">
        <el-input v-model="sendForm.cc" placeholder="CC recipients" />
      </el-form-item>

      <el-form-item label="Attachment">
        <el-tag
          class="cursor-pointer"
          type="success"
          size="large"
          @click="onPreview"
        >
          <span class="flex items-center gap-1">
            <el-icon>
              <ElIconDocument />
            </el-icon>
            {{ data?.number }}.pdf
          </span>
        </el-tag>

        <div class="flex gap-2 ml-2" v-if="data?.attachments?.length">
          <el-tag
            v-for="(doc, i) in data?.attachments ?? []"
            :key="i"
            class="cursor-pointer"
            type="success"
            size="large"
            @click="openAttachment(doc.filePath)"
          >
            <span class="flex items-center gap-1">
              <el-icon>
                <ElIconDocument />
              </el-icon>
              {{ doc.fileName }}
            </span>
          </el-tag>
        </div>
      </el-form-item>
    </el-form>

    <el-input
      v-model="sendForm.body"
      type="textarea"
      :rows="10"
      placeholder="Write your email message here"
    />

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="show = false" plain type="info"> Cancel </el-button>
        <el-button type="success" :loading="isSendingEmail" @click="send">
          {{ isSendingEmail ? "Sending..." : "Send Email" }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
const emit = defineEmits(["sent"]);

const { onPreview, type, to, recipientName, fromName, cc, data } = defineProps({
  onPreview: {
    type: Function,
    required: true,
  },
  data: {
    type: Object,
    required: true,
    default: () => ({
      id: "",
      number: "",
      title: "",
    }),
  },
  type: {
    type: String, // sales-order, purchase-order, quotation
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  recipientName: {
    type: String,
    required: true,
  },
  fromName: {
    type: String,
    default: "",
  },
  cc: {
    type: String,
    default: "",
  },
});

const config = useRuntimeConfig();
const request = useRequest();
const show = ref(false);
const isSendingEmail = ref(false);

const sendForm = reactive({
  subject: "",
  body: "",
  to: "",
  cc: "",
  fromName: "",
});

function resetSendForm() {
  sendForm.subject = "";
  sendForm.body = "";
  sendForm.to = "";
  sendForm.cc = "";
  sendForm.fromName = "";
}

function openDialog() {
  const bodies = {
    quotation: `Dear ${recipientName},\n\nPlease find attached our quotation for your review.\n\nIf you have any questions or need adjustments, please let us know.\n\nBest regards,\n${fromName}`,
    "sales-order": `Dear ${recipientName},\n\nPlease find attached our sales order for your review.\n\nIf you have any questions or need adjustments, please let us know.\n\nBest regards,\n${fromName}`,
    "purchase-order": `Dear ${recipientName},\n\nPlease find attached our purchase order for your review.\n\nIf you have any questions or need adjustments, please let us know.\n\nBest regards,\n${fromName}`,
    invoice: `Dear ${recipientName},\n\nPlease find attached our invoice for your review.\n\nIf you have any questions or need adjustments, please let us know.\n\nBest regards,\n${fromName}`,
  };

  sendForm.subject = `[${type.replace("-", " ").toUpperCase()}] #${data.number} - ${data.title || data.referenceNumber}`;
  sendForm.to = to;
  sendForm.cc = cc;
  sendForm.fromName = fromName;
  sendForm.body = bodies[type];
  show.value = true;
}

async function send() {
  const trimmedSubject = sendForm.subject.trim();
  const trimmedBody = sendForm.body.trim();

  if (!trimmedSubject || !trimmedBody) {
    ElNotification.warning({
      title: "Warning",
      message: "Please fill in the email subject and body.",
    });

    return;
  }

  const ccRecipients = sendForm.cc
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  try {
    isSendingEmail.value = true;

    const url = `/api/${type}s/${data.id}/send`;

    await request(url, {
      method: "POST",
      body: {
        subject: trimmedSubject,
        to: sendForm.to,
        body: trimmedBody,
        cc: ccRecipients,
      },
    });

    ElNotification.success({
      title: "Success",
      message: `${type.replace("-", " ")} email sent successfully`,
    });

    emit("sent");
    show.value = false;
    resetSendForm();
  } catch (error) {
    ElNotification.error({
      title: "Error",
      message: `Failed to send ${type.replace("-", " ")} email`,
    });
  } finally {
    isSendingEmail.value = false;
  }
}

function openAttachment(filePath) {
  const url = `${config.public.apiBase}/${filePath}`;
  window.open(url, "_blank");
}

defineExpose({ openDialog });
</script>
