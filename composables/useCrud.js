import { useQueryClient, useQuery, useMutation } from "@tanstack/vue-query";
import { form, errors, show, openForm, closeForm } from "~/stores/form";

export default ({ url, queryKey }) => {
  const page = ref(1);
  const pageSize = ref(10);
  const keyword = ref("");
  const companyId = ref(useCookie("companyId"));
  const filters = ref({});

  const queryClient = useQueryClient();
  const request = useRequest();

  function fetchData() {
    return useQuery({
      queryKey: [queryKey],
      queryFn: () =>
        request(url, {
          params: {
            page: page.value,
            pageSize: pageSize.value,
            keyword: keyword.value,
            companyId: companyId.value,
            ...filters.value,
          },
        }),
    });
  }

  function refreshData(key) {
    queryClient.invalidateQueries({
      queryKey: [key ?? queryKey],
    });
  }

  function saveMutation() {
    let loadingInstance;
    return useMutation({
      mutationFn: (data) => {
        loadingInstance = ElLoading.service({ target: ".el-dialog" });
        return data.id
          ? request(`${url}/${data.id}`, { method: "PATCH", body: data })
          : request(url, { method: "POST", body: data });
      },
      onSuccess: () => {
        closeForm();
        refreshData();
        ElMessage({
          message: "Data berhasil disimpan.",
          type: "success",
          showClose: true,
        });
      },
      onError: (error) => {
        errors.value = parseError(error);
      },
      onSettled: () => {
        loadingInstance.close();
      },
    });
  }

  function removeMutation() {
    return useMutation({
      mutationFn: (id) => request(`${url}/${id}`, { method: "DELETE" }),
      onSuccess: () => {
        refreshData();
        ElMessage({
          message: "Data berhasil dihapus",
          type: "success",
          showClose: true,
        });
      },
    });
  }

  function handleRemove(id, callback) {
    ElMessageBox.confirm("Anda yakin akan menghapus data ini?", "Warning", {
      type: "warning",
    })
      .then(() => callback(id))
      .catch(() => console.log(e));
  }

  function sizeChange(size, params = {}) {
    page.value = 1;
    pageSize.value = size;
    refreshData(queryKey, params);
  }

  function currentChange(currentPage, params = {}) {
    page.value = currentPage;
    refreshData(queryKey, params);
  }

  function edit(id) {
    request(`${url}/${id}`).then((result) => {
      openForm(result);
    });
  }

  return {
    form,
    errors,
    show,
    page,
    pageSize,
    keyword,
    request,
    filters,
    companyId,
    edit,
    fetchData,
    refreshData,
    openForm,
    closeForm,
    saveMutation,
    removeMutation,
    handleRemove,
    sizeChange,
    currentChange,
  };
};
