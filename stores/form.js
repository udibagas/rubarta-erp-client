export const form = ref({});
export const errors = ref({});
export const show = ref(false);

export function openForm(data = {}) {
  form.value = { ...data };
  show.value = true;
}

export function closeForm() {
  form.value = {};
  errors.value = {};
  show.value = false;
}
