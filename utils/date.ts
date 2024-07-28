export const formatDate = (value: string) => {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
  });
};

export const formatTime = (value: string) => {
  return new Date(value).toLocaleString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "long",
  });
};
