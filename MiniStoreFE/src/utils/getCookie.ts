export function getCookie(
  cookieHeader: string | undefined | null,
  key: string
): string | null {
  if (!cookieHeader) return null;

  let name = key + "=";
  let decodedCookie = decodeURIComponent(cookieHeader);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export function createCookieVariable(
  cname: string,
  cvalue: string,
  exdays: number
): string {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  return cname + "=" + cvalue + ";" + expires + ";path=/";
}
