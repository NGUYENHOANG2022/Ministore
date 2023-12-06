import { redirect } from "solid-start";
import { createHandler, renderAsync, StartServer, } from "solid-start/entry-server";
import routes, { apiRoutes } from "./utils/routes";
import { createCookieVariable, getCookie } from "./utils/getCookie";
import { DataResponse, Staff, StaffStatus } from "./types";

const protectedRoutes = [];
const publicRoutes = [ routes.login ];

export default createHandler(
  ({ forward }) => {
    return async (event) => {
      const cookie = event.request.headers.get("Cookie");
      // console.log(cookie);
      const token = getCookie(cookie, "token");
      let user: Staff | null = null;

      if (token) {
        try {
          const data = await fetch(process.env.API_ENDPOINT + apiRoutes.currentUser, {
            headers: {
              Authorization: "Bearer " + token,
            },
          });
          const { content } = (await data.json()) as DataResponse<Staff>;
          // console.log(content)

          if (content && content.status === StaffStatus.ACTIVATED) {
            // console.log(content);
            user = content;
            event.locals.token = token;
            event.locals.user = JSON.stringify({
              staffId: content.staffId,
              staffName: content.staffName,
              username: content.username,
              role: content.role,
              status: content.status,
            });
          }else{
            event.locals.authError = "true";
          }
        } catch (error) {
          console.log(error);
          event.locals.authError = "true";
        }
      }

      const accessUrl = new URL(event.request.url);

      // if user accesses a non public route, and he is not authenticated - redirect him to the login page
      if (!publicRoutes.includes(accessUrl.pathname) && !user) {
        return redirect(routes.login);
      }

      // if user accesses a public route, and he is authenticated - redirect him to the main page
      if (publicRoutes.includes(accessUrl.pathname) && user) {
        return redirect(routes.dashboard, {
          headers: { "Set-Cookie": createCookieVariable("token", token!, 1) }
        });
      }

      return forward(event); // if we got here, and the pathname is inside the `protectedPaths` array - user is logged in
    };
  },
  renderAsync((event) => {
    // set the endpoint cookie. Cause we can't use the env variable in the browser
    event.responseHeaders.set(
      "Set-Cookie",
      createCookieVariable("endpoint", process.env.API_ENDPOINT!, 1)
    );
    // console.log(event.locals.token);
    if (event.locals.token !== undefined && event.locals.authError !== "true") {
      event.responseHeaders.set(
        "Set-Cookie",
        createCookieVariable("token", event.locals.token as string, 1)
      );
    }
    if (event.locals.user !== undefined && event.locals.authError !== "true") {
      event.responseHeaders.set(
        "Set-Cookie",
        createCookieVariable("user", event.locals.user as string, 1)
      );
    }
    // console.log(event.locals.authError)
    if (event.locals.authError === "true") {
      event.responseHeaders.append("Set-Cookie", createCookieVariable("token", "", 0));
      event.responseHeaders.append("Set-Cookie", createCookieVariable("user", "", 0));
    }

    return <StartServer event={event}/>;
  })
);
