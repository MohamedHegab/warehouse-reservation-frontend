import axios, { AxiosInstance } from "axios";
const BASE_URL = "http://localhost:3000/api/";

export const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: { "content-type": "application/json" }
});
