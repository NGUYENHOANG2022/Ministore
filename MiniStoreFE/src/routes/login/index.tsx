import { TextInput } from "~/components/form/TextInput";
import * as yup from "yup";
import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import { useAuth } from "~/context/Auth";
import { createEffect, Show } from "solid-js";
import { useNavigate } from "solid-start";
import routes from "~/utils/routes";
import { StaffStatus } from "~/types";

type Login = {
  username: string;
  password: string;
};

const schema: yup.Schema<Login> = yup.object({
  username: yup.string().required("Please enter username"),
  password: yup.string().required("Please enter password"),
});

export default function Login() {
  const navigate = useNavigate();
  const { logIn, user, loggingIn, loginError } = useAuth();
  const formHandler = useFormHandler(yupSchema(schema), {
    validateOn: ["change"],
  });
  const { formData } = formHandler;

  createEffect(() => {
    if (user() && user()?.status === StaffStatus.ACTIVATED) {
      navigate(routes.dashboard);
    }
  });

  const submit = async (event: Event) => {
    event.preventDefault();
    try {
      const f = await formHandler.validateForm({throwException: false});
      if (f.isFormInvalid) return;

      logIn(formData().username, formData().password);
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <div
      class="h-screen grid place-items-center"
      classList={{ "cursor-progress": loggingIn() }}
    >
      <div
        class="bg-white w-full max-w-xs mx-auto p-8 rounded-lg shadow-md"
        x-data="loginForm"
      >
        <h2 class="text-2xl font-bold mb-4 text-center">Log In</h2>
        <Show when={!!loginError()}>
          <p class="text-center text-sm text-red-400">{loginError()}</p>
        </Show>
        <form class="space-y-4" onSubmit={submit}>
          <div>
            <TextInput
              type="text"
              id="username"
              name="username"
              label="Username"
              placeholder="Enter username"
              formHandler={formHandler}
            />
          </div>
          <div>
            <TextInput
              type="password"
              id="password"
              name="password"
              label="Password"
              placeholder="Enter password"
              formHandler={formHandler}
            />
          </div>
          <div>
            <button
              class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded focus:shadow-outline w-full disabled:bg-indigo-200"
              type="submit"
              disabled={loggingIn()}
            >
              Log In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
