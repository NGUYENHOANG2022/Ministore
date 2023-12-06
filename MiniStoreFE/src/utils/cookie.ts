import { PageEvent, parseCookie } from "solid-start";
import { isServer } from "solid-js/web";

export default function cookie(event: PageEvent) {
  return parseCookie(isServer ? event.request.headers.get("cookie") ?? "" : document.cookie);
}
