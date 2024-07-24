const url = "/api/expense-notes";
const api = useApi();

export const useExpenseNoteStore = defineStore("expenseNoteStore", {
  state: () => ({
    expenseNotes: [],
    showForm: false,
    formModel: {},
    formErrors: {},
    loading: false,
  }),

  actions: {
    openForm(data = {}) {
      this.formModel = { ...data };
      this.formErrors = {};
      this.showForm = true;
    },

    closeForm() {
      this.formErrors = {};
      this.formModel = {};
      this.showForm = false;
    },

    requestData() {
      this.loading = true;
      api(url)
        .then((data) => (this.expenseNotes = data))
        .finally(() => (this.loading = false));
    },

    save() {
      const { id, amount, ...payload } = this.formModel;
      const loadingInstance = ElLoading.service({ target: ".el-dialog" });
      const body = { ...payload, amount: Number(amount) };
      let request;

      if (id) {
        request = api(`${url}/${id}`, {
          method: "PATCH",
          body,
        });
      } else {
        request = api(url, { method: "POST", body });
      }

      request
        .then(() => {
          ElMessage({
            message: "Data berhasil disimpan.",
            type: "success",
            showClose: true,
          });
          this.closeForm();
          this.requestData();
        })
        .catch((e) => {
          this.formErrors = parseError(e);
        })
        .finally(() => {
          loadingInstance.close();
        });
    },

    remove(id) {
      ElMessageBox.confirm("Anda yakin akan menghapus data ini?", "Warning", {
        type: "warning",
      })
        .then(() => {
          api(`${url}/${id}`, { method: "DELETE" }).then((r) => {
            ElMessage({
              message: "Data berhasil dihapus",
              type: "success",
              showClose: true,
            });
            this.requestData();
          });
        })
        .catch(() => console.log(e));
    },
  },

  // getters: {
  //   summary: (state) => {
  //     const summaryObj = {};

  //     state.expenseNotes.forEach((item) => {
  //       if (!summaryObj[item.expenseTypeId]) summaryObj[item.expenseTypeId] = 0;
  //       summaryObj[item.expenseTypeId] += item.amount;
  //     });

  //     // { 1: 20000, 3: 20000, 4: 150000 }

  //     const summaryArr = Object.keys(summaryObj).map((k) => {
  //       const expenseType =
  //         store.expenseTypes.find((e) => e.id == k)?.name ?? "OTHER";

  //       return {
  //         expenseType,
  //         amount: summaryObj[k],
  //       };
  //     });

  //     return summaryArr;
  //   },
  // },
});
