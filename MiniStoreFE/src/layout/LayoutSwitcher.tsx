import { Component, JSX, Match, Switch } from "solid-js";
import DashboardLayout from "./DashboardLayout";
import { useLocation } from "solid-start";
import routes from "~/utils/routes";

const LayoutSwitcher: Component<{ children: JSX.Element }> = (props) => {
  const location = useLocation();

  return (
    <Switch fallback={props.children}>
      <Match when={location.pathname !== routes.login} keyed>
        <DashboardLayout>{props.children}</DashboardLayout>
      </Match>
    </Switch>
  );
};

export default LayoutSwitcher;
