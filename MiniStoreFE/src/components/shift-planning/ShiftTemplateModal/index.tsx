import {
  Accessor,
  batch,
  Component,
  createResource,
  createSignal,
  Match,
  ResourceFetcher,
  Setter,
  Switch,
} from "solid-js";
import PopupModal from "../../PopupModal";
import { DataResponse, ShiftTemplate } from "~/types";
import Spinner from "../../Spinner";
import Edit from "./Edit";
import List from "./List";
import Create from "./Create";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import axios from "axios";

const fetcher: ResourceFetcher<
  boolean,
  ShiftTemplate[],
  { state: "list" | "edit" | "create" }
> = async () => {
  try {
    const response = await axios.get<DataResponse<ShiftTemplate[]>>(
      `${getEndPoint()}/shift-templates`
    );
    return response.data.content;
  } catch (e: any) {
    throw new Error(handleFetchError(e));
  }
};

const ShiftTemplateModal: Component<{
  showModal: Accessor<boolean>;
  modalData: Accessor<ShiftTemplate | undefined>;
  setShowModal: Setter<boolean>;
}> = ({ showModal, modalData, setShowModal }) => {
  const [ state, setState ] = createSignal<"list" | "edit" | "create">("list");
  const [ shiftTemplateFocus, setShiftTemplateFocus ] =
    createSignal<ShiftTemplate>();
  const [ shiftTemplates, { refetch, mutate } ] = createResource(
    showModal,
    fetcher,
    {
      initialValue: [],
    }
  );

  return (
    <PopupModal.Wrapper
      title={
        state() === "list"
          ? "Shift Templates"
          : state() === "edit"
            ? "Edit Shift Template"
            : "New Shift Template"
      }
      close={() => {
        batch(() => {
          setState("list");
          setShowModal(false);
          setShiftTemplateFocus(undefined);
        });
      }}
      open={showModal}
    >
      <Switch fallback={<div class="text-center">Something went wrong.</div>}>
        <Match when={shiftTemplates.loading}>
          <div class="w-full min-h-[300px] grid place-items-center">
            <Spinner/>
          </div>
        </Match>
        <Match when={shiftTemplates.error}>
          <div class="w-full min-h-[300px] grid place-items-center">
            Something went wrong.
          </div>
        </Match>
        <Match when={state() === "list"}>
          <List
            setState={setState}
            shiftTemplates={shiftTemplates}
            setShiftTemplateFocus={setShiftTemplateFocus}
            refreshShiftTemplates={refetch}
          />
        </Match>
        <Match when={state() === "create"}>
          <Create
            setState={setState}
            shiftTemplates={shiftTemplates}
            refreshShiftTemplates={refetch}
          />
        </Match>
        <Match when={state() === "edit"}>
          <Edit
            setState={setState}
            shiftTemplates={shiftTemplates}
            shiftTemplateFocus={shiftTemplateFocus}
            refreshShiftTemplates={refetch}
            setShiftTemplateFocus={setShiftTemplateFocus}
          />
        </Match>
      </Switch>
    </PopupModal.Wrapper>
  );
};

export default ShiftTemplateModal;
