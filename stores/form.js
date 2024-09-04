export const form = ref({});
export const errors = ref({});
export const show = ref(false);

export function openForm(data = {}) {
  console.log(data);
  form.value = JSON.parse(JSON.stringify(data)); // JANGAN COBA - COBA PAKAI REST OPERATOR!
  show.value = true;
}

export function closeForm() {
  form.value = {};
  errors.value = {};
  show.value = false;
}
