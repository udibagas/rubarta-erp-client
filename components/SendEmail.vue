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
          effect="plain"
          class="cursor-pointer"
          type="success"
          size="large"
          @click="onPreview"
        >
          <span class="flex items-center gap-1">
            <el-icon>
              <ElIconDocument />
            </el-icon>
            {{ number }}.pdf
          </span>
        </el-tag>
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
const { onPreview, type, subject, to, recipientName, fromName, cc, number } =
  defineProps({
    onPreview: {
      type: Function,
      required: true,
    },
    type: {
      type: String, // sales-order, purchase-order, quotation
      required: true,
    },
    subject: {
      type: String,
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
    number: {
      type: String,
      required: true,
    },
  });

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
  };

  sendForm.subject = `[${type.replace("-", " ").toUpperCase()}] #${number} - ${subject}`;
  sendForm.to = to;
  sendForm.cc = cc;
  sendForm.fromName = fromName;
  sendForm.body = bodies[type];
  show.value = true;
}

async function send() {
  if (!data) return;

  const trimmedSubject = sendForm.subject.trim();
  const trimmedBody = sendForm.body.trim();

  if (!trimmedSubject || !trimmedBody) {
    ElMessage.warning("Please fill in the email subject and body.");
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

    ElMessage.success(`${type.replace("-", " ")} email sent successfully`);
    show.value = false;
    resetSendForm();
  } catch (error) {
    console.error(`Send ${type.replace("-", " ")} error:`, error);
    ElMessage.error(`Failed to send ${type.replace("-", " ")} email`);
  } finally {
    isSendingEmail.value = false;
  }
}

defineExpose({ openDialog });
</script>
