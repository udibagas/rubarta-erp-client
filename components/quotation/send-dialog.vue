<template>
  <el-dialog
    v-model="show"
    title="Send quotation"
    width="700px"
    @closed="resetSendForm"
  >
    <el-form :model="sendForm" label-position="left" label-width="100px">
      <el-form-item label="Subject">
        <el-input v-model="sendForm.subject" placeholder="Quotation subject" />
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
            {{ quotation?.number }}.pdf
          </span>
        </el-tag>
      </el-form-item>
    </el-form>

    <el-input
      type="textarea"
      v-model="sendForm.body"
      :rows="10"
      placeholder="Email body"
    />

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="show = false" plain type="info"> Cancel </el-button>
        <el-button
          type="success"
          :loading="isSendingEmail"
          @click="submitSendQuotation"
        >
          {{ isSendingEmail ? "Sending..." : "Send Email" }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
const { quotation, onPreview } = defineProps({
  quotation: {
    type: Object,
    default: null,
  },
  onPreview: {
    type: Function,
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
});

function resetSendForm() {
  sendForm.subject = "";
  sendForm.body = "";
  sendForm.to = "";
  sendForm.cc = "";
}

function openSendDialog() {
  if (!quotation) return;

  const customerName = quotation.Customer?.name || "Customer";
  const subject = `Quotation ${quotation.number}${
    quotation.title ? ` - ${quotation.title}` : ""
  }`;

  sendForm.subject = subject;
  sendForm.to = quotation.contactEmail || "";
  sendForm.body = `Dear ${customerName},\n\nPlease find attached our quotation for your review.\n\nIf you have any questions or need adjustments, please let us know.\n\nBest regards,\n${
    quotation.User?.name || "Sales Team"
  }`;
  show.value = true;
}

async function submitSendQuotation() {
  if (!quotation) return;

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

    await request(`/api/quotations/${quotation.id}/send`, {
      method: "POST",
      body: {
        subject: trimmedSubject,
        to: quotation.contactEmail,
        body: trimmedBody,
        cc: ccRecipients,
      },
    });

    ElMessage.success("Quotation email sent successfully");
    show.value = false;
    resetSendForm();
  } catch (error) {
    console.error("Send quotation error:", error);
    ElMessage.error("Failed to send quotation email");
  } finally {
    isSendingEmail.value = false;
  }
}

defineExpose({
  openSendDialog,
});
</script>
