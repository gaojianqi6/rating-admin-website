import { format } from "date-fns";

export const datetime = (timestamp: string) => {
  return format(new Date(timestamp), "yyyy-MM-dd HH:mm:ss")
}