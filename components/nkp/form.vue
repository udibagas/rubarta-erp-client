<template>
  <el-dialog
    v-model="show"
    width="900"
    title="NOTA KUASA PEMBAYARAN"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="top">
      <el-form-item label="Parent" v-if="form.parentId">
        <strong>{{ form.Parent.number }}</strong>
      </el-form-item>

      <el-form-item label="Company" :error="errors.companyId">
        <el-select v-model="form.companyId" placeholder="Company" disabled>
          <el-option
            v-for="(el, i) in companies"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <div class="flex gap-4">
        <el-form-item
          label="Payment Target"
          :error="errors.paymentType"
          class="flex-1"
        >
          <el-radio-group
            v-model="form.paymentType"
            @change="resetBank"
            fill="rgb(149, 212, 117)"
          >
            <el-radio-button
              value="EMPLOYEE"
              label="EMPLOYEE"
              :disabled="!!form.parentId"
            />
            <el-radio-button
              value="VENDOR"
              label="VENDOR"
              :disabled="!!form.parentId"
            />
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="form.paymentType"
          label="NKP Type"
          :error="errors.nkpType"
          class="flex-1"
        >
          <el-select
            v-model="form.nkpType"
            placeholder="NKP Type"
            @change="resetBank"
            :disabled="!!form.parentId"
          >
            <el-option
              v-if="form.paymentType == 'EMPLOYEE'"
              value="CASH_ADVANCE"
              label="CASH ADVANCE"
            />

            <el-option
              v-if="form.paymentType == 'EMPLOYEE'"
              value="DECLARATION"
              label="DECLARATION"
            />

            <el-option
              v-if="form.paymentType == 'EMPLOYEE'"
              value="SALARY"
              label="SALARY"
            />

            <el-option
              v-if="form.paymentType == 'VENDOR'"
              value="DOWN_PAYMENT"
              label="DOWN PAYMENT"
            />

            <el-option
              v-if="form.paymentType == 'VENDOR'"
              value="SETTLEMENT"
              label="SETTLEMENT"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="form.paymentType == 'EMPLOYEE'"
          label="Employee"
          :error="errors.employeeId"
          class="flex-1"
        >
          <el-select
            v-model="form.employeeId"
            placeholder="Employee"
            @change="updateBank"
            @clear="resetBank"
            default-first-option
            fit-input-width
            filterable
            clearable
            :disabled="!!form.parentId"
          >
            <el-option
              v-for="(el, i) in users"
              :value="el.id"
              :label="el.name"
              :key="i"
            />

            <template #prefix>
              <el-icon>
                <el-icon-user />
              </el-icon>
            </template>
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="form.paymentType == 'VENDOR'"
          label="Vendor"
          :error="errors.supplierId"
          class="flex-1"
        >
          <el-select
            v-model="form.supplierId"
            placeholder="Vendor"
            @clear="resetBank"
            default-first-option
            fit-input-width
            filterable
            clearable
            @change="
              (v) => {
                updateBank(v);
                handleSupplierChange(v);
              }
            "
          >
            <el-option
              v-for="(el, i) in suppliers"
              :value="el.id"
              :label="el.name"
              :key="i"
            />
            <template #prefix>
              <el-icon>
                <el-icon-shop />
              </el-icon>
            </template>
          </el-select>
        </el-form-item>
      </div>

      <div class="flex gap-4">
        <el-form-item
          v-if="form.paymentType"
          label="Bank"
          :error="errors.bankId"
          class="flex-1"
        >
          <el-select
            v-model="form.bankId"
            placeholder="Bank"
            default-first-option
            filterable
            :disabled="!!form.parentId"
          >
            <el-option
              v-for="(el, i) in banks"
              :value="el.id"
              :label="`${el.code} - ${el.name}`"
              :key="i"
            />

            <template #prefix>
              <el-icon>
                <el-icon-school />
              </el-icon>
            </template>
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="form.paymentType"
          label="Bank Account"
          :error="errors.bankAccount"
          class="flex-1"
        >
          <el-input
            v-model="form.bankAccount"
            placeholder="Bank Account"
            :disabled="!!form.parentId"
            :prefix-icon="ElIconCreditCard"
          />
        </el-form-item>

        <el-form-item
          v-if="form.paymentType"
          label="Currency"
          :error="errors.currency"
          class="flex-1"
        >
          <el-radio-group v-model="form.currency" fill="rgb(149, 212, 117)">
            <el-radio-button
              v-for="(currency, i) in [...currencies]"
              :value="currency"
              :label="currency"
              :key="i"
              :disabled="!!form.parentId"
            />
          </el-radio-group>
        </el-form-item>
      </div>

      <div class="flex gap-4" v-if="form.paymentType == 'VENDOR'">
        <el-form-item label="PO Number" class="flex-1">
          <el-select
            v-model="form.purchaseOrderId"
            placeholder="Select purchase order"
            filterable
            default-first-option
            @change="(v) => handlePurchaseOrderChange(v)"
            clearable
          >
            <el-option
              v-for="purchaseOrder in purchaseOrders"
              :key="purchaseOrder.id"
              :value="purchaseOrder.id"
              :label="purchaseOrder.number"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="GR Number" class="flex-1">
          <el-select
            v-model="form.goodsReceiptId"
            placeholder="Select goods receipt"
            filterable
            default-first-option
            @change="(v) => handleGoodsReceiptChange(v)"
            clearable
          >
            <el-option
              v-for="gr in goodsReceipts"
              :key="gr.id"
              :value="gr.id"
              :label="gr.number"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          label="Invoice Number"
          :error="errors.invoiceNumber"
          class="flex-1"
        >
          <el-input v-model="form.invoiceNumber" placeholder="Invoice Number" />
        </el-form-item>
      </div>

      <div class="flex gap-4">
        <el-form-item
          v-if="form.paymentType == 'VENDOR'"
          label="Total Amount"
          :error="errors.totalAmount"
        >
          <el-input
            v-model="form.totalAmount"
            placeholder="Total Amount"
            class="w-70! font-semibold font-mono"
            :prefix-icon="ElIconMoney"
            :formatter="formatNumberInput"
            :parser="parseNumberInput"
          />
        </el-form-item>

        <el-form-item
          label="Description"
          :error="errors.description"
          class="flex-1"
        >
          <el-input
            type="textarea"
            autosize
            v-model="form.description"
            placeholder="Description"
          />
        </el-form-item>
      </div>
    </el-form>

    <el-table :data="form.NkpItem" table-layout="auto">
      <el-table-column type="index" label="#"></el-table-column>

      <el-table-column label="DATE" width="170">
        <template #default="{ row }">
          <el-date-picker
            v-model="row.date"
            type="date"
            placeholder="Date"
            format="DD-MMM-YYYY"
            value-format="YYYY-MM-DD"
            style="width: 150px"
          />
        </template>
      </el-table-column>

      <el-table-column label="DESCRIPTION">
        <template #default="{ row }">
          <el-input
            type="textarea"
            v-model="row.description"
            placeholder="Description"
            :rows="1"
            clearable
          />
        </template>
      </el-table-column>

      <el-table-column label="AMOUNT" width="170">
        <template #default="{ row, $index }">
          <el-input
            v-model="row.amount"
            placeholder="Amount"
            @keydown.tab="(e) => handleTab(e, $index)"
            :formatter="formatNumberInput"
            :parser="parseNumberInput"
            class="font-mono"
          >
          </el-input>
        </template>
      </el-table-column>

      <!-- <el-table-column align="right">
        <template #default="{ row }">
          <span class="font-mono font-semibold">
            {{ toCurrency(row.amount, form.currency) }}
          </span>
        </template>
      </el-table-column> -->

      <!-- <el-table-column
        label="CURR"
        width="70"
        align="center"
        header-align="center"
      >
        <template #default="{ row }">
          {{ form.currency }}
        </template>
      </el-table-column> -->

      <el-table-column width="50" header-align="center" align="center">
        <template #header>
          <el-button
            link
            :icon="ElIconPlus"
            type="success"
            @click="addItem"
          ></el-button>
        </template>
        <template #default="{ row, $index }">
          <el-button
            tabindex="-1"
            link
            :icon="ElIconDelete"
            type="danger"
            @click="removeItem($index, row.id)"
          />
        </template>
      </el-table-column>
    </el-table>

    <table class="table">
      <tbody>
        <tr>
          <td class="font-semibold bg-gray-100 text-right">GRAND TOTAL</td>
          <td class="text-right">
            <span class="font-mono font-semibold">
              {{ toCurrency(grandTotal, form.currency) }}
            </span>
          </td>
        </tr>

        <tr v-if="form.paymentType == 'VENDOR'">
          <td class="font-semibold bg-gray-100 text-right">TAX</td>
          <td class="text-right">
            <el-input
              v-model="form.tax"
              placeholder="Tax"
              style="width: 150px"
              class="font-mono"
              :formatter="formatNumberInput"
              :parser="parseNumberInput"
            />
          </td>
        </tr>

        <tr v-if="form.paymentType == 'VENDOR'">
          <td class="font-semibold bg-gray-100 text-right">DEDUCTION</td>
          <td class="text-right">
            <el-input
              v-model="form.deduction"
              placeholder="Deduction"
              style="width: 150px"
              class="font-mono"
              :formatter="formatNumberInput"
              :parser="parseNumberInput"
            />
          </td>
        </tr>

        <tr v-if="form.paymentType == 'VENDOR'">
          <td class="font-semibold bg-gray-100 text-right">NET AMOUNT</td>
          <td class="text-right">
            <span class="font-mono font-semibold">
              {{ toCurrency(netAmount, form.currency) }}
            </span>
          </td>
        </tr>

        <tr v-if="form.paymentType == 'EMPLOYEE' && form.cashAdvanceBalance">
          <td class="font-semibold bg-gray-100 text-right">
            CASH ADVANCE BALANCE
          </td>
          <td class="text-right">
            <span class="font-mono font-semibold">
              {{ toCurrency(form.cashAdvanceBalance, form.currency) }}
            </span>
          </td>
        </tr>

        <tr v-if="form.paymentType == 'VENDOR' && form.nkpType == 'SETTLEMENT'">
          <td class="font-semibold bg-gray-100 text-right">DOWN PAYMENT</td>
          <td class="text-right">
            <span class="font-mono font-semibold">
              {{ toCurrency(form.downPayment, form.currency) }}
            </span>
          </td>
        </tr>

        <tr v-if="form.nkpType !== 'DECLARATION'">
          <td class="font-semibold bg-gray-100 text-right">
            TRANSFER TO {{ form.paymentType }}
          </td>
          <td class="text-right">
            <span class="font-mono font-semibold text-green-500">
              {{ toCurrency(finalPayment, form.currency) }}
            </span>
          </td>
        </tr>

        <tr v-if="form.paymentType == 'EMPLOYEE' && form.parentId">
          <td class="font-semibold bg-gray-100 text-right">
            Kembali Ke {{ finalPayment > 0 ? "Karyawan" : "Perusahaan" }}
          </td>
          <td class="text-right">
            <el-text
              :type="finalPayment > 0 ? 'success' : 'danger'"
              class="font-mono font-semibold"
            >
              {{ toCurrency(Math.abs(finalPayment), form.currency) }}
            </el-text>
          </td>
        </tr>

        <tr>
          <td class="font-semibold bg-green-50" colspan="2">
            {{ terbilang(finalPayment).toUpperCase() }}
          </td>
        </tr>
      </tbody>
    </table>

    <br />

    <div class="font-bold mt-6 mb-4">Attachment</div>

    <el-upload
      v-model:file-list="fileList"
      :action="`${config.public.apiBase}/api/file`"
      :with-credentials="true"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :multiple="true"
    >
      <el-button type="success" :icon="ElIconUpload">Upload</el-button>
    </el-upload>

    <template #footer>
      <el-button :icon="ElIconCircleCloseFilled" @click="closeForm">
        CLOSE
      </el-button>
      <el-button
        :icon="ElIconSuccessFilled"
        type="info"
        @click="saveWithStatus('DRAFT')"
      >
        SAVE AS DRAFT
      </el-button>

      <el-button
        :icon="ElIconSuccessFilled"
        type="success"
        @click="saveWithStatus('SUBMITTED')"
      >
        SUBMIT
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { gql } from "@apollo/client";
import { useQuery } from "@tanstack/vue-query";
import { currencies } from "~/constants/currencies";

const newRow = {
  date: undefined,
  description: undefined,
  amount: undefined,
};

const url = "/api/nkp";

const { errors, form, show, request, closeForm, saveMutation } = useCrud({
  url,
  queryKey: "nkp",
});
const { mutate: save } = saveMutation();

const {
  data: { companies, suppliers, banks, users },
} = await useGraphqlQuery(gql`
  query {
    companies {
      id
      code
      name
    }
    suppliers {
      id
      code
      name
      bankId
      currency
      bankAccount
    }
    banks {
      id
      code
      name
    }
    users {
      id
      code
      name
      bankId
      bankAccount
      currency
    }
  }
`);

const purchaseOrders = ref([]);
const goodsReceipts = ref([]);

function fetchPurchaseOrders(supplierId) {
  if (!supplierId) return;
  useGraphqlQuery(
    gql`
      query ($status: [PurchaseOrderStatus!], $supplierId: Int!) {
        purchaseOrders(status: $status, supplierId: $supplierId) {
          id
          number
          date
          supplierId
          PurchaseOrderItems {
            partNumber
            description
            quantity
            receivedQuantity
            unitPrice
          }
        }
      }
    `,
    {
      variables: {
        status: ["Completed", "PartiallyReceived"],
        supplierId: Number(supplierId),
      },
    },
  ).then((response) => {
    purchaseOrders.value = response.data.purchaseOrders;
  });
}

function fetchGoodsReceipts(purchaseOrderId) {
  if (!purchaseOrderId) return;
  useGraphqlQuery(
    gql`
      query ($purchaseOrderId: Int!) {
        goodsReceipts(purchaseOrderId: $purchaseOrderId) {
          id
          number
          date
          supplierId
          GoodsReceiptItems {
            partNumber
            description
            quantityReceived
          }
        }
      }
    `,
    {
      variables: {
        purchaseOrderId: Number(purchaseOrderId),
      },
    },
  ).then((response) => {
    goodsReceipts.value = response.data.goodsReceipts;
  });
}

function handleSupplierChange(supplierId) {
  fetchPurchaseOrders(supplierId);
  form.value.purchaseOrderId = null;
  form.value.goodsReceiptId = null;
}

function handlePurchaseOrderChange(purchaseOrderId) {
  fetchGoodsReceipts(purchaseOrderId);
  form.value.goodsReceiptId = null;
}

function handleGoodsReceiptChange(goodsReceiptId) {
  const gr = goodsReceipts.value.find((gr) => gr.id == goodsReceiptId);
  if (!gr) return;

  const items =
    purchaseOrders.value.find((po) => po.id == form.value.purchaseOrderId)
      ?.PurchaseOrderItems || [];

  form.value.NkpItem = items
    .map((i) => {
      const grItem = gr.GoodsReceiptItems.find(
        (item) => item.partNumber == i.partNumber,
      );

      return {
        date: gr.date,
        description: `${i.partNumber} - ${i.description} (x${grItem?.quantityReceived || 0})`,
        amount: i.unitPrice * (grItem?.quantityReceived || 0),
      };
    })
    .filter((i) => i.amount > 0);
}

const { data: balances } = useQuery({
  queryKey: ["user-balance"],
  queryFn: () => request("/api/users/balance"),
});

function updateBank(id) {
  let data = {};

  if (form.value.paymentType == "EMPLOYEE") {
    data = users.find((u) => u.id == id);
  }

  if (form.value.paymentType == "VENDOR") {
    data = suppliers.find((u) => u.id == id);
  }

  if (data) {
    form.value.bankId = data.bankId;
    form.value.bankAccount = data.bankAccount;
    form.value.currency = data.currency;
  }
}

function resetBank() {
  form.value.employeeId = null;
  form.value.supplierId = null;
  form.value.bankId = null;
  form.value.bankAccount = null;
  form.value.currency = null;
}

const grandTotal = computed(() => {
  return (
    form.value.NkpItem?.reduce(
      (total, current) => total + Number(current.amount),
      0,
    ) ?? 0
  );
});

const netAmount = computed(() => {
  if (form.value.paymentType == "EMPLOYEE") {
    return grandTotal.value;
  }

  if (form.value.paymentType == "VENDOR") {
    return grandTotal.value - form.value.tax - form.value.deduction;
  }

  return 0;
});

const finalPayment = computed(() => {
  if (form.value.paymentType == "EMPLOYEE") {
    return grandTotal.value - form.value.cashAdvanceBalance;
  }

  if (form.value.paymentType == "VENDOR") {
    return netAmount.value - form.value.downPayment;
  }

  return 0;
});

async function saveWithStatus(status) {
  if (status == "SUBMITTED") {
    try {
      await ElMessageBox.confirm(
        "Pastikan Anda telah mengisi for dengan benar!",
        "Warning",
        {
          type: "warning",
        },
      );
    } catch (error) {
      return;
    }
  }

  form.value.grandTotal = grandTotal.value;
  form.value.netAmount = netAmount.value;
  form.value.totalAmount = Number(form.value.totalAmount);
  form.value.finalPayment = finalPayment.value;
  form.value.deduction = Number(form.value.deduction);
  form.value.tax = Number(form.value.tax);
  form.value.cashAdvanceBalance = Number(form.value.cashAdvanceBalance);
  form.value.downPayment = Number(form.value.downPayment);
  form.value.status = status;

  form.value.NkpItem.forEach((e) => {
    e.amount = Number(e.amount);
    e.currency = form.value.currency;
  });

  save(form.value);
}

async function removeItem(index, id) {
  if (id) {
    await request(`${url}/${form.value.id}/${id}`, {
      method: "DELETE",
    });
  }

  form.value.NkpItem.splice(index, 1);
}

function addItem() {
  form.value.NkpItem.push({ ...newRow });
}

// UPLOAD RELATED

const config = useRuntimeConfig();
const fileList = ref([]);

watch(
  () => form.value.NkpAttachment,
  async (value, oldValue) => {
    if (!value) {
      return (fileList.value = []);
    }

    fileList.value = form.value.NkpAttachment.map((el) => {
      const { fileName: name, fileSize: size, filePath, fileType } = el;
      return {
        name,
        size,
        url: `${config.public.apiBase}/${filePath}`,
        filePath,
      };
    });
  },
);

// kalau dia cash advance, ambil data balance employee
watch(
  () => form.value.employeeId,
  (value) => {
    if (form.value.nkpType == "CASH_ADVANCE") {
      const employeeBalance = balances.value.find((el) => el.userId == value);
      form.value.cashAdvanceBalance = employeeBalance?.balance ?? 0;
    }
  },
);

function handleSuccess(file) {
  if (!form.value.NkpAttachment) {
    form.value.NkpAttachment = [];
  }

  form.value.NkpAttachment.push(file);
}

function handlePreview(file) {
  const path = file.response?.filePath ?? file.filePath;
  window.open(`${config.public.apiBase}/${path}`, "_blank");
}

function handleRemove(file) {
  const path = file.response?.filePath ?? file.filePath;
  const index = form.value.NkpAttachment.findIndex((f) => f.filePath == path);

  if (index !== -1) {
    form.value.NkpAttachment.splice(index, 1);
  }

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

function handleTab(e, index) {
  if (index == form.value.NkpItem.length - 1) {
    addItem();
  }
}
</script>
