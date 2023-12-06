import { Component, JSX, Match, Resource, Switch } from "solid-js";
import Spinner from "./Spinner";

interface ResourceWrapperProps {
  children: JSX.Element | JSX.Element[];
  data: Resource<any>;
}

const ResourceWrapper: Component<ResourceWrapperProps> = (props) => {
  return (
    <Switch>
      <Match when={props.data.loading}>
        <div class="w-full h-full min-h-[300px] grid place-items-center">
          <Spinner />
        </div>
      </Match>
      <Match when={props.data.error}>
        <div class="w-full h-full min-h-[300px] grid place-items-center">
          Something went wrong
        </div>
      </Match>
      <Match when={!props.data.error && props.data()}>{props.children}</Match>
    </Switch>
  );
};

export default ResourceWrapper;
