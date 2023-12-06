import { Navigate } from "solid-start";
import { useAuth } from "~/context/Auth";
import routes from "~/utils/routes";
import { Show } from "solid-js";

export default function Attendance() {
  const { user } = useAuth();

  return (
    <Show when={user() !== undefined}>
      <Navigate href={routes.attendanceId(user()!.staffId)}/>
    </Show>
  );
}
