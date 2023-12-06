import { useNavigate, useServerContext } from "solid-start";
import cookie from "~/utils/cookie";
import { Role, UserAuth } from "~/types";
import routes from "~/utils/routes";

export default function checkAuth(roles: Role[], fallbackRoute: string) {
  const event = useServerContext();
  const navigate = useNavigate();
  const user = JSON.parse(cookie(event).user as string) as UserAuth;

  // If the user is not logged in, redirect to the login page
  if (!user) throw navigate(routes.login);

  // If the user is not authorized, redirect to the fallback route
  if (!roles.includes(user.role)) throw navigate(fallbackRoute);
}