import { ListRequest } from "@/typings/common";

export interface User {
  role_id: number
  password: string
  updated_time: string
  id: number
  username: string
  created_time: string
  updated_by: number
}

export interface Role {
  id: number
  name: string
}

export interface UserListRequest extends ListRequest {
  username: string
}

export interface UserList {
  list: User[]
  pageNo: number
  pageSize: number
  total: number
}