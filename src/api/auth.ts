import { postForm } from "@/lib/api";

export const login = (body) => postForm("v1/auth/token", body);