export const parseError = (e) => {
  const errors = {};

  if (e.response?.status == 400) {
    e.response._data.errors.forEach(({ error, property, children }) => {
      errors[property] =
        error || (children && children.length > 0 ? children : "");
    });
  }

  return errors;
};
