import { Accessor, Component, createContext, createSignal, JSX, useContext, } from "solid-js";
import Cookies from "js-cookie";
import { apiRoutes } from "~/utils/routes";
import { DataResponse, Staff, StaffStatus, UserAuth } from "~/types";
import axios from "axios";
import { toastSuccess } from "~/utils/toast";
import handleFetchError from "~/utils/handleFetchError";
import { parseCookie, useServerContext } from "solid-start";
import { isServer } from "solid-js/web";
import getEndPoint from "~/utils/getEndPoint";

const addItem = (key: string, value = "") => {
  /**
   *  Using the local storage code....
   */
  // if (key) localStorage.setItem(key, value);

  /**
   *  Using the Cookies code...
   */
  if (key) Cookies.set(key, value, { expires: 1 });
};

const clearItem = (key: string) => {
  /**
   *  Using the local storage code....
   */
  // localStorage.removeItem(key);

  /**
   *  Using the Cookies code...
   */
  Cookies.remove(key);
};


type AuthContextType = {
  user: Accessor<UserAuth | undefined>;
  logOut: () => void;
  logIn: (username: string, password: string) => void;
  loggingIn: Accessor<boolean>;
  loginError: Accessor<string>;
};

export const AuthContext = createContext<AuthContextType>();

interface AuthProviderProps {
  children: JSX.Element;
}

export const AuthProvider: Component<AuthProviderProps> = (props) => {
  const event = useServerContext();
  const cookie = () => parseCookie(isServer ? event.request.headers.get("cookie") ?? "" : document.cookie);
  const userCookie = JSON.parse(cookie().user || "null") as UserAuth | null;
  const [ user, setUser ] = createSignal<UserAuth | undefined>(userCookie || undefined);
  const [ loggingIn, setloggingIn ] = createSignal<boolean>(false);
  const [ error, setError ] = createSignal<string>("");

  const logOut = () => {
    setUser(undefined);
    clearItem("token");
    clearItem("user");
  };

  const logIn = async (username: string, password: string) => {
    if (loggingIn()) return;
    try {
      setloggingIn(true);
      setError("");
      const { data: token } = await axios.post<DataResponse<string>>(
        `${getEndPoint()}${apiRoutes.login}`,
        { username, password }
      );

      if (token.content === undefined) throw new Error("Token is undefined");
      addItem("token", token.content);

      // get current user data by token
      const { data } = await axios.get<DataResponse<Staff>>(
        `${getEndPoint()}${apiRoutes.currentUser}`,
        {
          headers: {
            Authorization: `Bearer ${token.content}`,
          }
        }
      );

      if (data.content === undefined || data.content.status === StaffStatus.DISABLED)
        throw new Error("User is disabled");

      toastSuccess("Authorization succeeded");
      addItem("user", JSON.stringify(data.content));
      setUser(data.content);
    } catch (error) {
      setError(handleFetchError(error));
      clearItem("token");
      clearItem("user");
    } finally {
      setloggingIn(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, logOut, logIn, loggingIn, loginError: error }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  return useContext(AuthContext)!;
}
