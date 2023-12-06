import { Accessor, batch, Component, createSignal, Match, Setter, Switch, } from "solid-js";
import SidePopupModal from "~/components/SidePopupModal";
import { ScheduleTemplate } from "~/types";
import List from "./List";
import { ScheduleTemplateModalState } from "~/context/ShiftPlanning";
import { FaSolidAngleLeft } from "solid-icons/fa";
import Apply from "./Apply";
import Create from "./Create";
import Copy from "./Copy";

const ScheduleTemplateModal: Component<{
  modalState: Accessor<ScheduleTemplateModalState>;
  setModalState: Setter<ScheduleTemplateModalState>;
}> = ({ modalState, setModalState }) => {
  const [ scheduleTemplateFocus, setScheduleTemplateFocus ] =
    createSignal<ScheduleTemplate>();

  const onCloseModal = () => {
    batch(() => {
      setModalState(undefined);
      setScheduleTemplateFocus(undefined);
    });
  };

  return (
    <SidePopupModal.Wrapper
      title={
        <Switch>
          <Match when={modalState() === "list"}>Select Week Template</Match>
          <Match when={modalState() === "apply"}>
            <div class="flex gap-2">
              <button
                onClick={[ setModalState, "list" ]}
                class="text-lg text-gray-400 hover:text-gray-700"
              >
                <FaSolidAngleLeft/>
              </button>
              <p>Apply Week Template</p>
            </div>
          </Match>
          <Match when={modalState() === "create"}>Create Week Template</Match>
          <Match when={modalState() === "copy"}>Copy Previous Week</Match>
        </Switch>
      }
      close={onCloseModal}
      open={() => modalState() !== undefined}
    >
      <Switch
        fallback={
          <div class="w-full h-full min-h-[300px] grid place-items-center">
            Something went wrong.
          </div>
        }
      >
        <Match when={modalState() === "list"}>
          <List
            modalState={modalState}
            setModalState={setModalState}
            setScheduleTemplateFocus={setScheduleTemplateFocus}
          />
        </Match>
        <Match when={modalState() === "apply"}>
          <Apply
            setModalState={setModalState}
            scheduleTemplateFocus={scheduleTemplateFocus}
            setScheduleTemplateFocus={setScheduleTemplateFocus}
          />
        </Match>
        <Match when={modalState() === "create"}>
          <Create modalState={modalState} setModalState={setModalState}/>
        </Match>
        <Match when={modalState() === "copy"}>
          <Copy modalState={modalState} setModalState={setModalState}/>
        </Match>
      </Switch>
    </SidePopupModal.Wrapper>
  );
};

export default ScheduleTemplateModal;
