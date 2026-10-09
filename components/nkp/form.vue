<template>
  <el-dialog
    v-model="show"
    width="900"
    title="NOTA KUASA PEMBAYARAN"
    :close-on-click-modal="false"
  >
    <el-card shadow="never">
      <template #header>
        <div class="font-semibold">NKP INFORMATION</div>
      </template>
      <el-form label-width="150px" label-position="left">
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

        <el-form-item label="Payment Target" :error="errors.paymentType">
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
        >
          <el-radio-group
            v-model="form.nkpType"
            placeholder="NKP Type"
            @change="resetBank"
            :disabled="!!form.parentId"
            fill="rgb(149, 212, 117)"
          >
            <el-radio-button
              v-if="form.paymentType == 'EMPLOYEE'"
              value="CASH_ADVANCE"
              label="CASH ADVANCE"
            />

            <el-radio-button
              v-if="form.paymentType == 'EMPLOYEE'"
              value="DECLARATION"
              label="DECLARATION"
            />

            <el-radio-button
              v-if="form.paymentType == 'EMPLOYEE'"
              value="SALARY"
              label="SALARY"
            />

            <el-radio-button
              v-if="form.paymentType == 'VENDOR'"
              value="DOWN_PAYMENT"
              label="DOWN PAYMENT"
            />

            <el-radio-button
              v-if="form.paymentType == 'VENDOR'"
              value="SETTLEMENT"
              label="SETTLEMENT"
            />
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="form.paymentType == 'EMPLOYEE'"
          label="Employee"
          :error="errors.employeeId"
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
      </el-form>
    </el-card>

    <el-card shadow="never" class="mt-4">
      <template #header>
        <div class="font-semibold">BANK INFORMATION</div>
      </template>

      <el-form label-width="150px" label-position="top">
        <div class="flex gap-4">
          <div class="flex-1">
            <el-form-item label="Bank" :error="errors.bankId">
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
            <el-form-item label="Currency" :error="errors.currency">
              <el-radio-group v-model="form.currency" fill="rgb(149, 212, 117)">
                <el-radio-button
                  v-for="(curr, i) in currencies"
                  :key="i"
                  :label="curr"
                  :value="curr"
                />
              </el-radio-group>
            </el-form-item>
          </div>
          <div class="flex-1">
            <el-form-item label="Bank Account" :error="errors.bankAccount">
              <el-input
                v-model="form.bankAccount"
                placeholder="Bank Account"
                :disabled="!!form.parentId"
                :prefix-icon="ElIconCreditCard"
              >
              </el-input>
            </el-form-item>

            <el-form-item
              label="Account Holder"
              :error="errors.bankAccountHolder"
            >
              <el-input
                v-model="form.bankAccountHolder"
                placeholder="Account Holder"
                :disabled="!!form.parentId"
                :prefix-icon="ElIconUser"
              />
            </el-form-item>
          </div>
        </div>
      </el-form>
    </el-card>

    <el-card shadow="never" class="mt-4" v-if="form.paymentType == 'VENDOR'">
      <template #header>
        <div class="font-semibold">INVOICE INFORMATION</div>
      </template>

      <el-form label-position="left" label-width="150px">
        <el-form-item label="Invoice Number" :error="errors.invoiceNumber">
          <div class="flex items-center gap-4 w-full">
            <el-input
              v-model="form.invoiceNumber"
              placeholder="Type invoice number"
              class="flex-1"
            />
            <span>Or</span>
            <el-select
              v-model="form.goodsReceiptId"
              placeholder="Select invoice number"
              filterable
              default-first-option
              @change="(v) => handleGoodsReceiptChange(v)"
              clearable
              class="flex-1"
            >
              <el-option
                v-for="gr in goodsReceipts.filter((g) => g.vendorInvoiceNumber)"
                :key="gr.id"
                :value="gr.id"
                :label="gr.vendorInvoiceNumber"
              />
            </el-select>
          </div>
        </el-form-item>

        <el-form-item label="PO Number">
          <el-input
            :model-value="form.PurchaseOrder?.number"
            placeholder="e.g. PO12345"
          />
        </el-form-item>

        <el-form-item label="Reference Number" :error="errors.referenceNumber">
          <el-input
            v-model="form.referenceNumber"
            placeholder="Reference Number"
          />
        </el-form-item>

        <el-form-item
          v-if="form.paymentType == 'VENDOR'"
          label="Total Amount"
          :error="errors.totalAmount"
        >
          <el-input
            v-model="form.totalAmount"
            placeholder="Total Amount"
            class="font-mono"
            :prefix-icon="ElIconMoney"
            :formatter="formatNumberInput"
            :parser="parseNumberInput"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="mt-4">
      <template #header>
        <div class="font-semibold">ADDITIONAL INFORMATION</div>
      </template>

      <el-form label-position="left" label-width="150px">
        <el-form-item label="Description" :error="errors.description">
          <el-input
            type="textarea"
            :rows="3"
            v-model="form.description"
            placeholder="Description"
          />
        </el-form-item>

        <el-form-item label="Attachment">
          <el-upload
            v-model:file-list="fileList"
            :action="`${config.public.apiBase}/api/file`"
            :with-credentials="true"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-success="handleSuccess"
            :multiple="true"
            class="w-80"
          >
            <el-button :icon="ElIconUpload">Upload</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" body-class="p-1!" class="mt-4">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="font-semibold">NKP ITEMS</div>
          <el-button
            :icon="ElIconPlus"
            plain
            type="success"
            size="small"
            @click="addItem"
          >
            Add Item
          </el-button>
        </div>
      </template>
      <el-table :data="form.NkpItem" table-layout="auto">
        <template #empty>
          <el-empty description="No NKP items"></el-empty>
        </template>
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

        <el-table-column width="50" header-align="center" align="center">
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

          <tr
            v-if="form.paymentType == 'VENDOR' && form.nkpType == 'SETTLEMENT'"
          >
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
    </el-card>

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
      bankAccountHolder
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

const goodsReceipts = ref([]);

function fetchGoodsReceipts(supplierId) {
  if (!supplierId) return;
  useGraphqlQuery(
    gql`
      query (
        $supplierId: Int!
        $status: [GoodsReceiptStatus!]
        $paymentStatus: [PaymentStatus!]
      ) {
        goodsReceipts(
          supplierId: $supplierId
          status: $status
          paymentStatus: $paymentStatus
        ) {
          id
          number
          date
          supplierId
          vendorInvoiceNumber
          referenceNumber
          purchaseOrderId
          GoodsReceiptItems {
            partNumber
            description
            quantityReceived
          }
          PurchaseOrder {
            number
            referenceNumber
            grandTotal
            PurchaseOrderItems {
              partNumber
              description
              unitPrice
            }
          }
        }
      }
    `,
    {
      variables: {
        supplierId: Number(supplierId),
        status: ["Confirmed"],
        paymentStatus: ["UNPAID"],
      },
    },
  ).then((response) => {
    goodsReceipts.value = response.data.goodsReceipts;
  });
}

function handleSupplierChange(supplierId) {
  fetchGoodsReceipts(supplierId);
  form.value.purchaseOrderId = null;
  form.value.goodsReceiptId = null;
}

function handleGoodsReceiptChange(goodsReceiptId) {
  const gr = goodsReceipts.value.find((gr) => gr.id == goodsReceiptId);
  if (!gr) return;

  form.value.purchaseOrderId = gr.purchaseOrderId;
  form.value.invoiceNumber = gr.vendorInvoiceNumber;
  form.value.referenceNumber =
    gr.referenceNumber || gr.PurchaseOrder.referenceNumber;
  form.value.totalAmount = gr.PurchaseOrder.grandTotal || 0;
  form.value.PurchaseOrder = gr.PurchaseOrder;

  const items = gr.PurchaseOrder?.PurchaseOrderItems ?? [];

  form.value.NkpItem = items
    .map((i) => {
      const grItem = gr.GoodsReceiptItems.find(
        (item) => item.partNumber == i.partNumber,
      );

      return {
        date: gr.date,
        description: `${i.partNumber} - ${i.description} (${grItem?.quantityReceived || 0} x ${toCurrency(i.unitPrice || 0, form.value.currency)})`,
        amount: i.unitPrice * (grItem?.quantityReceived ?? 0),
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
    form.value.bankAccountHolder = data.bankAccountHolder || data.name;
    form.value.currency = data.currency;
  }
}

function resetBank() {
  form.value.employeeId = null;
  form.value.supplierId = null;
  form.value.bankId = null;
  form.value.bankAccount = null;
  form.value.bankAccountHolder = null;
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
