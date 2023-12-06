import { DataResponse } from "~/types";
import { toastError } from "~/utils/toast";

export default function handleFetchError(error: any): string {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const data = error.response.data as DataResponse<any>;
    console.log(data.errors);
    toastError(typeof data.errors === "string" ? data.errors : data.errors[0])
    return typeof data.errors === "string" ? data.errors : data.errors[0]

  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log(error.request);
    toastError("No response from server")
    return "No response from server"

  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error in setting up the request', error.message);
    console.log(error.config);
    toastError(error.message)
    return error.message;
  }
}