import { form, errors, show, openForm, closeForm } from "~/stores/form";

export default ({ url, queryKey }) => {
  const queryClient = useQueryClient();
  const request = useRequest();

  function fetchData(params = {}) {
    return useQuery({
      queryKey: [queryKey],
      queryFn: () => request(url, { params }),
    });
  }

  function refreshData() {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  }

  function saveMutation(queryKey) {
    return useMutation({
      mutationFn: (data) => {
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

  return {
    form,
    errors,
    show,
    fetchData,
    refreshData,
    openForm,
    closeForm,
    saveMutation,
    removeMutation,
    handleRemove,
  };
};
