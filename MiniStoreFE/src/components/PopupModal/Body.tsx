import { JSX, Component } from "solid-js";

type PopupModalBodyProps = {
  children: JSX.Element;
};
const Body: Component<PopupModalBodyProps> = (props) => {
  return (
    <div class="flex-1 p-5">
      <div class="p-5 -m-5">{props.children}</div>
    </div>
  );
};
export default Body;
