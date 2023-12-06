import { Navigate } from "solid-start";
import { useAuth } from "~/context/Auth";
import routes from "~/utils/routes";

export default function Logout() {
  const { logOut } = useAuth();

  logOut();

  return <Navigate href={routes.login} />;
}
