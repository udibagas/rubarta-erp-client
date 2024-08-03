export const detail = ref({});
export const showDetail = ref(false);

export function openDetail(data = {}) {
  detail.value = data;
  showDetail.value = true;
}

export function closeDetail() {
  detail.value = {};
  showDetail.value = false;
}
