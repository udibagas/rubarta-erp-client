import exportFromJSON from "export-from-json";

export default (url, paginated = false) => {
  const api = useApi();
  const showForm = ref(false);
  const formErrors = ref({});
  const formModel = ref({});
  const keyword = ref("");
  const page = ref(1);
  const pageSize = ref(10);
  const tableData = paginated ? ref({}) : ref([]);
  const sort_prop = ref(null);
  const sort_order = ref(null);
  const filters = ref({});
  const loading = ref(false);

  const sortChange = ({ prop, order }) => {
    if (prop != sort_prop.value || order != sort_order.value) {
      if (order == "ascending") {
        sort_order.value = "asc";
      } else if (order == "descending") {
        sort_order.value = "desc";
      } else {
        sort_order.value = "asc";
      }

      sort_prop.value = prop;
      requestData();
    }
  };

  const currentChange = (p) => {
    page.value = p;
    requestData();
  };

  const sizeChange = (size) => {
    pageSize.value = size;
    requestData();
  };

  const filterChange = (filter) => {
    filters.value = { ...filters.value, ...filter };
    page.value = 1;
    requestData();
  };

  const openForm = (data = {}) => {
    formErrors.value = {};
    formModel.value = JSON.parse(JSON.stringify(data));
    showForm.value = true;
  };

  const save = (cb) => {
    const loadingInstance = ElLoading.service({ target: ".el-dialog" });
    let request;

    if (formModel.value.id) {
      const { id, ...payload } = formModel.value;
      request = api(`${url}/${formModel.value.id}`, {
        method: "PATCH",
        body: payload,
      });
    } else {
      request = api(url, {
        method: "POST",
        body: formModel.value,
      });
    }

    request
      .then((r) => {
        showForm.value = false;
        ElMessage({
          message: "Data berhasil disimpan.",
          type: "success",
          showClose: true,
        });

        requestData();
        if (typeof cb == "function") cb();
      })
      .catch((e) => {
        if (e.response.status == 400) {
          const errors = {};

          e.response._data.errors.forEach(({ error, property }) => {
            errors[property] = error;
          });

          formErrors.value = errors;
        } else {
          formErrors.value = {};
        }
      })
      .finally(() => {
        loadingInstance.close();
      });
  };

  const deleteData = (id, cb) => {
    ElMessageBox.confirm("Anda yakin akan menghapus data ini?", "Warning", {
      type: "warning",
    })
      .then(() => {
        api(`${url}/${id}`, { method: "DELETE" }).then((r) => {
          requestData();
          if (typeof cb == "function") cb();
          ElMessage({
            message: "Data berhasil dihapus",
            type: "success",
            showClose: true,
          });
        });
      })
      .catch(() => console.log(e));
  };

  const searchData = () => {
    page.value = 1;
    requestData();
  };

  const refreshData = () => {
    page.value = 1;
    keyword.value = "";
    filters.value = {};
    requestData();
  };

  const closeForm = () => {
    showForm.value = false;
    formModel.value = {};
    formErrors.value = {};
  };

  const requestData = () => {
    let params = {
      keyword: keyword.value,
      sort_prop: sort_prop.value,
      sort_order: sort_order.value,
      ...filters.value,
    };

    if (paginated) {
      params = {
        ...params,
        paginated: true,
        page: page.value,
        pageSize: pageSize.value,
      };
    }

    // parse array
    for (let key in params) {
      if (Array.isArray(params[key])) {
        delete params[key];
        params[`${key}[0]`] = filters.value[key][0];
        params[`${key}[1]`] = filters.value[key][1];
      }
    }

    loading.value = true;
    api(url, { params })
      .then((response) => {
        loading.value = false;
        tableData.value = response;
      })
      .finally(() => (loading.value = false));
  };

  const exportData = (fileName) => {
    const params = {
      sort_prop: sort_prop.value,
      sort_order: sort_order.value,
      ...filters.value,
      action: "export",
    };

    loading.value = true;
    api(url, { params })
      .then((data) => exportFromJSON({ data, fileName, exportType: "xls" }))
      .catch((e) => console.log(e))
      .finally(() => (loading.value = false));
  };

  return {
    api,
    showForm,
    formErrors,
    formModel,
    keyword,
    page,
    pageSize,
    tableData,
    sort_prop,
    sort_order,
    filters,
    loading,
    sortChange,
    currentChange,
    sizeChange,
    filterChange,
    openForm,
    save,
    deleteData,
    searchData,
    refreshData,
    closeForm,
    requestData,
    exportData,
  };
};
