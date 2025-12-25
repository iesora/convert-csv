export const tokenString = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userToken") || "";
  }
  return "";
};
export const jsonHeader = {
  "Content-Type": "application/json",
};
export const httpHeader = {
  "Content-Type": "application/json",
};
export const jwtJsonHeader = {
  "Content-Type": "application/json",
  get Authorization() {
    return `Bearer ${tokenString()}`;
  },
};
export const jwtFormDataHeader = {
  "Content-Type": "multipart/form-data",
  Authorization: `Bearer ${tokenString()}`,
};
