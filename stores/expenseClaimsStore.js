const url = "/api/expense-claims";
const api = useApi();

export const useExpenseClaimsStore = defineStore("expenseClaim", {
  state: () => ({
    tableData: {},
    page: 1,
    pageSize: 10,
    sort_prop: undefined,
    sort_order: undefined,
    keyword: "",
    fileters: {},
    formModel: { ExpenseClaimItem: [] },
    showForm: false,
    formErrors: {},
    loading: false,
    newRow: {
      date: undefined,
      expenseType: undefined,
      description: undefined,
      amount: undefined,
    },
  }),

  actions: {
    sortChange({ prop, order }) {
      if (prop != this.sort_prop || order != this.sort_order) {
        if (order == "ascending") {
          this.sort_order = "asc";
        } else if (order == "descending") {
          this.ort_order = "desc";
        } else {
          this.sort_order = "asc";
        }

        this.sort_prop = prop;
        this.requestData();
      }
    },

    currentChange(p) {
      this.page = p;
      this.requestData();
    },

    sizeChange(size) {
      this.pageSize = size;
      this.requestData();
    },

    filterChange(filter) {
      this.filters = { ...this.filters, ...filter };
      this.page = 1;
      this.requestData();
    },

    openForm(data = {}) {
      this.formErrors = {};
      this.formModel = data;
      this.showForm = true;
      console.log(this.showForm, this.formModel);
    },

    closeForm() {
      this.formErrors = {};
      this.formModel = {};
      this.showForm = false;
    },

    searchData() {
      this.page = 1;
      this.requestData();
    },

    refreshData() {
      this.page = 1;
      this.keyword = "";
      this.filters = {};
      this.requestData();
    },

    requestData() {
      let params = {
        keyword: this.keyword,
        sort_prop: this.sort_prop,
        sort_order: this.sort_order,
        paginated: true,
        page: this.page,
        pageSize: this.pageSize,
        ...this.filters,
        companyId: useCookie("companyId").value, // jadi default filter untuk transaction data
      };

      // parse array
      for (let key in params) {
        if (Array.isArray(params[key])) {
          delete params[key];
          params[`${key}[0]`] = filters.value[key][0];
          params[`${key}[1]`] = filters.value[key][1];
        }
      }

      this.loading = true;
      api(url, { params })
        .then((response) => {
          this.loading = false;
          this.tableData = response;
        })
        .finally(() => (this.loading = false));
    },

    save() {
      const loadingInstance = ElLoading.service({ target: ".el-dialog" });
      const { id, ...payload } = this.formModel;
      let request;

      if (id) {
        request = api(`${url}/${id}`, {
          method: "PATCH",
          body: payload,
        });
      } else {
        request = api(url, {
          method: "POST",
          body: payload,
        });
      }

      request
        .then((r) => {
          this.showForm = false;
          ElMessage({
            message: "Data berhasil disimpan.",
            type: "success",
            showClose: true,
          });
          this.requestData();
        })
        .catch((e) => {
          if (e.response.status == 400) {
            const errors = {};

            e.response._data.errors.forEach(({ error, property }) => {
              errors[property] = error;
            });

            this.formErrors = errors;
          } else {
            this.formErrors = {};
          }
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

    async removeItem(index, id) {
      if (id) {
        await api(`${url}/${this.formModel.id}/${id}`, {
          method: "DELETE",
        });
      }

      this.formModel.ExpenseClaimItem.splice(index, 1);
    },

    addItem() {
      this.formModel.ExpenseClaimItem.push({ ...this.newRow });
    },
  },
});
