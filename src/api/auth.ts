import { postForm } from "@/lib/api";
import { LoginRequest, LoginResponse } from "@/typings/auth";


export const login = (body: LoginRequest): Promise<LoginResponse> => postForm<LoginResponse>("v1/auth/token", body);