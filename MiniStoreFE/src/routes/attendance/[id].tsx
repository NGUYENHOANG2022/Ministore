import { createEffect, createMemo, createResource, createSignal, onCleanup, ResourceFetcher, Show, } from "solid-js";
import Breadcrumbs from "~/components/Breadcrumbs";
import { useAuth } from "~/context/Auth";
import moment from "moment";
import { DataResponse, Staff, Timesheet, TimesheetStatus } from "~/types";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { useParams } from "@solidjs/router";
import { TextArea } from "~/components/form/TextArea";
import { TextInput } from "~/components/form/TextInput";
import { createRouteAction, useNavigate } from "solid-start";
import { useFormHandler } from "solid-form-handler";
import * as yup from "yup";
import { yupSchema } from "solid-form-handler/yup";
import Spinner from "~/components/Spinner";
import ShiftsChooserModal from "~/components/attendance/ShiftsChooserModal";
import { toastError, toastSuccess } from "~/utils/toast";
import routes from "~/utils/routes";
import ShiftCard from "~/components/attendance/ShiftCard";
import axios from "axios";

const schema: yup.Schema<
  Omit<
    Timesheet,
    | "timesheetId"
    | "checkInTime"
    | "checkOutTime"
    | "shift"
    | "staff"
    | "staffId"
    | "salary"
    | "salaryId"
  >
> = yup.object({
  shiftId: yup.number().required("Shift ID is required"),
  status: yup
    .string()
    .oneOf([
      TimesheetStatus.PENDING,
      TimesheetStatus.APPROVED,
      TimesheetStatus.REJECTED,
    ])
    .required("Status is required"),
  noteTitle: yup.string().default(""),
  noteContent: yup.string().default(""),
});

const fetcher: ResourceFetcher<{ id: string } | undefined, Staff> = async (
  source
) => {
  try {
    const today = moment().format("YYYY-MM-DD");

    const { data } = await axios.get<DataResponse<Staff[]>>(
      `${getEndPoint()}/shift-planning?from=${today}&to=${today}&staffId=${
        source?.id
      }`
    );
    console.log(data.content, source);
    if (!data) throw new Error("Invalid response from server");

    return data.content[0];
  } catch (e) {
    throw new Error(handleFetchError(e));
  }
};

const createTimesheet = async (
  formData: Omit<Timesheet, "timesheetId" | "salaryId">
) => {
  try {
    const { data } = await axios.post<DataResponse<Timesheet>>(
      `${getEndPoint()}/timesheets/add`,
      { ...formData }
    );
    console.log(data);
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

const updateTimesheet = async (formData: Omit<Timesheet, "salaryId">) => {
  try {
    const { data } = await axios.put<DataResponse<Timesheet>>(
      `${getEndPoint()}/timesheets/update/${formData.timesheetId}`,
      { ...formData }
    );
    console.log(data);
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

export default function Attendance() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ start, setStart ] = createSignal(false);
  const [ isShiftsModalOpen, setIsShiftsModalOpen ] = createSignal(false);
  const [ chosenShiftId, setChosenShiftId ] = createSignal(0);
  const [ creating, create ] = createRouteAction(createTimesheet);
  const [ updating, update ] = createRouteAction(updateTimesheet);
  const [ data, { refetch } ] = createResource(
    () => (start() && params.id !== undefined ? { id: params.id } : undefined),
    fetcher
  );
  const [ curTime, setCurTime ] = createSignal(moment().format("h:mm:ss a"));
  const formHandler = useFormHandler(yupSchema(schema), { validateOn: [] });
  const { formData } = formHandler;
  let interval: any;
  const chosenShift = createMemo(() =>
    data()?.shifts.find((s) => s.shiftId === chosenShiftId())
  );

  createEffect(() => {
    // If user is not the staff, redirect to his own attendance page
    if (params.id !== `${user()?.staffId}`) {
      navigate(routes.attendanceId(user()!.staffId));
    }
    // If user is the staff, start fetching data
    else {
      console.log("start");
      setStart(true);
    }
  });

  createEffect(() => {
    // If data is ready, set the clock interval
    if (data.state === "ready")
      interval = setInterval(
        () => setCurTime(moment().format("h:mm:ss a")),
        900
      );

    onCleanup(() => clearInterval(interval));
  });

  const submit = async (e: Event) => {
    e.preventDefault();
    if (creating.pending || updating.pending) return;

    if (
      chosenShift()?.timesheet?.checkInTime &&
      chosenShift()?.timesheet?.checkOutTime
    ) {
      toastError("You have already checked in and checked out for this shift");
      return;
    }

    if (
      moment(`${chosenShift()?.date} ${chosenShift()?.startTime}`).isAfter(
        moment()
      )
    ) {
      toastError("Shift has not started yet");
      return;
    }

    const f = await formHandler.validateForm({ throwException: false });

    if (f.isFormInvalid) return;

    const checkInTime = chosenShift()?.timesheet?.checkInTime
      ? chosenShift()!.timesheet!.checkInTime
      : moment().format("HH:mm:ss");
    const checkOutTime = chosenShift()?.timesheet?.checkInTime
      ? chosenShift()?.timesheet?.checkOutTime
        ? chosenShift()!.timesheet!.checkOutTime!
        : moment().format("HH:mm:ss")
      : null;

    let success: boolean;

    // If the staff has not checked in yet, create a new timesheet
    if (!chosenShift()?.timesheet)
      success = await create({
        ...formData(),
        checkInTime,
        checkOutTime,
        status: TimesheetStatus.PENDING,
        staffId: user()?.staffId!,
      });
    // If the staff has checked in, update the timesheet
    else
      success = await update({
        ...formData(),
        checkInTime,
        checkOutTime,
        timesheetId: chosenShift()?.timesheet?.timesheetId!,
        status: TimesheetStatus.APPROVED,
        staffId: user()?.staffId!,
      });

    if (success) {
      refetch();
      toastSuccess("Your attendance is recorded successfully");
      await formHandler.resetForm();
    }
  };

  const selectShift = (shiftId: number) => {
    setChosenShiftId(shiftId);
    setIsShiftsModalOpen(false);
  };

  return (
    <main>
      <h1 class="mb-2 text-2xl font-medium">Attendance</h1>
      <Breadcrumbs linkList={[ { name: "Attendance" } ]}/>
      <Show when={data.loading}>
        <div class="flex justify-center items-center h-[300px]">
          <Spinner/>
        </div>
      </Show>
      <Show when={data.error}>
        <div class="flex justify-center items-center h-[300px]">
          <span>Something went wrong</span>
        </div>
      </Show>
      <Show when={!data.error && data() !== undefined}>
        <div class="bg-white mx-auto p-[50px] shadow-xl rounded-md border border-gray-300 max-w-xl">
          <div class="text-2xl mb-5 font-semibold text-center text-gray-800">
            {user()?.staffName}
          </div>
          <div class="flex border-b border-gray-300 border-dotted">
            <div class="flex-1 flex flex-row py-2.5 overflow-hidden gap-1.5">
              <span class="font-semibold text-gray-600">Current Date:</span>
              <span>{moment().format("MMMM Do YYYY")}</span>
            </div>
            <div class="flex-1 flex flex-row py-2.5 overflow-hidden gap-1.5">
              <span class="font-semibold text-gray-600">Time:</span>
              <span>{curTime()}</span>
            </div>
          </div>
          <div class="flex">
            <div class="flex-1 flex flex-row py-2.5 overflow-hidden gap-3">
              <span class="font-semibold text-gray-600">Associated Shift:</span>
              <button
                type="button"
                onClick={[ setIsShiftsModalOpen, true ]}
                class="font-semibold text-blue-500 hover:text-blue-600 hover:underline hover:underline-offset-1"
              >
                Select a shift
              </button>
            </div>
          </div>
          <div class="flex border-b border-gray-300 border-dotted">
            <div class="flex-1 flex flex-row py-2.5 overflow-hidden gap-3">
              <Show
                when={chosenShiftId() !== 0}
                fallback={
                  <p class="w-full text-gray-500 text-center">
                    No shift available
                  </p>
                }
              >
                <ShiftCard
                  shift={chosenShift()!}
                  onClick={() => setIsShiftsModalOpen(true)}
                />
              </Show>
            </div>
          </div>
          <Show when={chosenShiftId() !== 0}>
            <div class="flex mt-5">
              <div class="flex-1 py-2 flex flex-row gap-1.5 overflow-hidden">
                <span class="text-gray-600 font-semibold">Check In Time: </span>
                <span>
                  {chosenShift()?.timesheet &&
                  chosenShift()?.timesheet?.checkInTime
                    ? moment(
                      chosenShift()?.timesheet?.checkInTime,
                      "HH:mm:ss"
                    ).format("h:mm:ss a")
                    : "Not yet"}
                </span>
              </div>
              <div class="flex-1 py-2 flex flex-row gap-1.5 overflow-hidden">
                <span class="text-gray-600 font-semibold">
                  Check Out Time:{" "}
                </span>
                <span>
                  {chosenShift()?.timesheet &&
                  chosenShift()?.timesheet?.checkOutTime
                    ? moment(
                      chosenShift()?.timesheet?.checkOutTime,
                      "HH:mm:ss"
                    ).format("h:mm:ss a")
                    : "Not yet"}
                </span>
              </div>
              <TextInput
                id="status"
                name="status"
                value={
                  chosenShift()?.timesheet
                    ? chosenShift()?.timesheet?.status
                    : TimesheetStatus.APPROVED
                }
                hidden={true}
                formHandler={formHandler}
              />
              <TextInput
                id="shiftId"
                name="shiftId"
                value={chosenShiftId()}
                hidden={true}
                formHandler={formHandler}
              />
            </div>
            <div class="flex">
              <div class="flex-1 py-2 flex flex-col gap-1 overflow-hidden">
                <TextInput
                  id="noteTitle"
                  name="noteTitle"
                  label="Note Title"
                  value={
                    chosenShift()?.timesheet
                      ? chosenShift()?.timesheet?.noteTitle
                      : ""
                  }
                  placeholder="Give your note a title..."
                  formHandler={formHandler}
                />
              </div>
            </div>
            <div class="flex">
              <div class="flex-1 py-2 flex flex-col gap-1 overflow-hidden">
                <TextArea
                  id="noteContent"
                  name="noteContent"
                  label="Note Content"
                  value={
                    chosenShift()?.timesheet
                      ? chosenShift()?.timesheet?.noteContent
                      : ""
                  }
                  placeholder="e.g. Any other information you want to include..."
                  formHandler={formHandler}
                />
              </div>
            </div>
            <div class="w-full flex justify-end items-center gap-2">
              <button
                type="button"
                onClick={submit}
                class="py-1.5 px-3 font-semibold text-white border border-blue-600 bg-blue-500 text-sm rounded hover:bg-blue-600"
              >
                Check In / Out
              </button>
            </div>
          </Show>
        </div>
        <ShiftsChooserModal
          showModal={isShiftsModalOpen}
          setShowModal={setIsShiftsModalOpen}
          setChosenShiftId={selectShift}
          shifts={() => data()!.shifts}
        />
      </Show>
    </main>
  );
}
