import { Role } from "~/types";

export function capitalize(str: string): string {
  let s = str === Role.ALL_ROLES? "all roles" :str.toLowerCase().trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
