import { JSX, Component } from "solid-js";

type PopupModalBodyProps = {
  children: JSX.Element;
  classList?: {[key: string]: boolean};
};
const Body: Component<PopupModalBodyProps> = (props) => {
  return <div class="flex-1 p-5 overflow-y-scroll" classList={props.classList}>{props.children}</div>;
};
export default Body;
