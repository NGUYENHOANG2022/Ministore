import { ImPlus } from "solid-icons/im";
import { Accessor, batch, Component, createResource, For, ResourceFetcher, Setter, } from "solid-js";
import { ScheduleTemplateModalState } from "~/context/ShiftPlanning";
import { DataResponse, ScheduleTemplate } from "~/types";
import ResourceWrapper from "~/components/ResourceWrapper";
import SidePopupModal from "~/components/SidePopupModal";
import axios from "axios";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";

interface ListProps {
  modalState: Accessor<ScheduleTemplateModalState>;
  setModalState: Setter<ScheduleTemplateModalState>;
  setScheduleTemplateFocus: Setter<ScheduleTemplate | undefined>;
}

const fetcher: ResourceFetcher<
  boolean,
  ScheduleTemplate[],
  { state: ScheduleTemplateModalState }
> = async () => {
  try {
    const { data: staffs } = await axios
      .get<DataResponse<ScheduleTemplate[]>>(`${getEndPoint()}/schedule-templates/list`);

    return staffs.content;
  } catch (e) {
    throw new Error(handleFetchError(e));
  }
};

const List: Component<ListProps> = ({ modalState, setModalState, setScheduleTemplateFocus }) => {
  const [ scheduleTemplates, { refetch } ] = createResource(() => modalState() === "list", fetcher);

  return (
    <ResourceWrapper data={scheduleTemplates}>
      <SidePopupModal.Body>
        <div class="text-sm mb-4 text-gray-400 leading-[1.5] tracking-wide">
          Select the template that you would like to use from the list below.
          You will be able to preview the shifts that will be created in the
          next step.
        </div>
        <div>
          <For each={scheduleTemplates()}>
            {(scheduleTemplate) => (
              <div
                onClick={() => {
                  batch(() => {
                    setModalState("apply");
                    setScheduleTemplateFocus(scheduleTemplate);
                  });
                }}
                class="flex py-2.5 overflow-hidden hover:rounded hover:bg-[#ceefff] hover:px-2.5 hover:-mx-2.5 hover:border-opacity-0 [&:hover_+_div]:border-opacity-0 cursor-pointer border-t border-gray-300 first:border-none"
              >
                <div class="flex-1 flex items-center">
                  <div class="text-gray-700 font-semibold tracking-wide text-base">
                    {scheduleTemplate.name}
                  </div>
                  {/*<div class="text-gray-500 tracking-wide text-sm">*/}
                  {/*{displayDate(scheduleTemplate.createdAt)}*/}
                  {/*</div>*/}
                </div>
                <div class="ml-3.5 flex items-start">
                  <div
                    class="text-[#00a8ff] bg-[#ceefff] text-xs font-semibold capitalize rounded-full aspect-square w-7 flex justify-center items-center border-2 border-white">
                    {scheduleTemplate.numOfShifts}
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </SidePopupModal.Body>
      <SidePopupModal.Footer>
        <div class="w-full flex justify-between items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            class="py-1.5 px-3 font-semibold text-white border border-blue-400 bg-[#00a8ff] text-sm rounded hover:bg-blue-500"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={[ setModalState, "create" ]}
            class="flex gap-2 justify-center items-center py-1.5 px-3 font-semibold text-white border border-[#00bc1d] bg-[#00bc1d] text-sm rounded hover:bg-green-600"
          >
            <span class="text-xs">
              <ImPlus/>
            </span>
            New Week Template
          </button>
        </div>
      </SidePopupModal.Footer>
    </ResourceWrapper>
  );
};

export default List;
