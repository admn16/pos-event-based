import axios from "axios";

export const coreReq = axios.create({
  baseURL: process.env.CORE_API_URL || "http://core:8081",
});
