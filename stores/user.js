const url = "/api/users";
const api = useApi();

export const useUserStore = defineStore("userStore", {
  state: () => ({
    users: [],
    showForm: false,
    formModel: {},
    formErrors: {},
    loading: false,
    keyword: "",
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
      api(url, { params: { keyword: this.keyword } })
        .then((data) => (this.users = data))
        .finally(() => (this.loading = false));
    },

    save() {
      const { id, ...payload } = this.formModel;
      const loadingInstance = ElLoading.service({ target: ".el-dialog" });
      let request;

      if (id) {
        request = api(`${url}/${id}`, { method: "PATCH", body: payload });
      } else {
        request = api(url, { method: "POST", body: payload });
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
});
