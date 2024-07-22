export const toRupiah = (value: string) => {
  if (!value) return "0";
  return Number(value).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
};

export const formatDate = (value: string) => {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
  });
};

export const terbilang = (value: number) => {
  const strNumbers = value.toString().split(",");
  const numbers =
    "nol,satu,dua,tiga,empat,lima,enam,tujuh,delapan,sembilan".split(",");
  const units = ",ribu,juta,milyar".split(",");
};
