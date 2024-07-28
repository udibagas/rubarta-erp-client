import { form, errors, show, openForm, closeForm } from "~/stores/form";

export default ({ url, queryKey }) => {
  const page = ref(1);
  const pageSize = ref(10);
  const keyword = ref("");

  const queryClient = useQueryClient();
  const request = useRequest();

  function fetchData() {
    return useQuery({
      queryKey: [queryKey],
      queryFn: () => request(url),
    });
  }

  function refreshData() {
    queryClient.invalidateQueries({
      queryKey: [queryKey],
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

  function sizeChange(size) {
    pageSize.value = size;
    refreshData();
  }

  function currentChange(currentPage) {
    page.value = currentPage;
    refreshData();
  }

  return {
    form,
    errors,
    show,
    page,
    pageSize,
    keyword,
    request,
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
