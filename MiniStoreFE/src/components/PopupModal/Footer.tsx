import { JSX, Component, children } from "solid-js";

type PopupModalFooterProps = {
  children: JSX.Element;
};
const Footer: Component<PopupModalFooterProps> = (props) => {
  return (
    <div class="rounded-b-md px-5 py-3.5 border-t border-gray-300 flex items-center justify-start bg-gray-50">
      {props.children}
    </div>
  );
};

export default Footer;
