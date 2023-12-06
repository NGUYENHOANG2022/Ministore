import { Component, JSX, Show, splitProps } from "solid-js";
import { Field, FieldProps } from "solid-form-handler";

export type TextAreaInputProps =
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement> &
    FieldProps & { label?: string };

export const TextArea: Component<TextAreaInputProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "classList",
    "label",
    "formHandler",
    "cols",
    "rows",
  ]);

  return (
    <Field
      {...props}
      mode="input"
      render={(field) => (
        <div classList={local.classList}>
          <Show when={local.label}>
            <label
              for={field.props.id}
              class="inline-block mb-1.5 text-gray-600 font-semibold"
            >
              {local.label}
            </label>
          </Show>

          <textarea
            {...rest}
            {...field.props}
            cols={local.cols}
            rows={local.rows}
            classList={{
              "border-red-400": field.helpers.error,
              "border py-2 px-4 text-gray-600 rounded min-h-[65px] outline-none focus:border-indigo-500 focus:shadow":
                true,
              "w-full": !local.cols,
            }}
          />

          <Show when={field.helpers.error}>
            <p class="text-sm text-red-400">{field.helpers.errorMessage}</p>
          </Show>
        </div>
      )}
    />
  );
};
