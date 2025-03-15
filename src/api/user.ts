import api from "@/lib/api";

export const getUser = () => api.get("v1/users/me").json();