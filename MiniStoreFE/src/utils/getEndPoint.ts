import Cookies from "js-cookie";
import { isServer } from "solid-js/web";

export default () => isServer ? process.env.API_ENDPOINT : Cookies.get("endpoint");
