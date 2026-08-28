import { onRequestPost as __api_enquiry_ts_onRequestPost } from "/Users/marceltielman/Documents/rumah-manusia/functions/api/enquiry.ts"
import { onRequest as __api_enquiry_ts_onRequest } from "/Users/marceltielman/Documents/rumah-manusia/functions/api/enquiry.ts"

export const routes = [
    {
      routePath: "/api/enquiry",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_enquiry_ts_onRequestPost],
    },
  {
      routePath: "/api/enquiry",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_enquiry_ts_onRequest],
    },
  ]