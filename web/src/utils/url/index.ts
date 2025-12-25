import axios from "axios";
import { jwtJsonHeader } from "./header";

export const baseURL = process.env.NEXT_PUBLIC_API_URL;
export const axiosInstance = axios.create({ baseURL });
axiosInstance.defaults.withCredentials = true;
//@ts-ignore
axiosInstance.defaults.headers = jwtJsonHeader;
