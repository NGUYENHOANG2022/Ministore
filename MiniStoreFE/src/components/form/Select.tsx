import { Field, FieldProps } from "solid-form-handler";
import {
  Component,
  For,
  JSX,
  Show,
  createEffect,
  createSignal,
  splitProps,
} from "solid-js";

type SelectableOption = { value: string | number; label: string };

export type SelectProps = JSX.SelectHTMLAttributes<HTMLSelectElement> &
  FieldProps & {
    label?: string;
    options?: Array<SelectableOption>;
    placeholder?: string;
  };

export const Select: Component<SelectProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "placeholder",
    "options",
    "label",
    "classList",
    "formHandler",
  ]);
  const [options, setOptions] = createSignal<SelectableOption[]>([]);

  /**
   * Computes the select options by using the placeholder and options props.
   */
  createEffect(() => {
    setOptions(() => [
      ...(local.placeholder ? [{ value: 0, label: local.placeholder }] : []),
      ...(local.options || []),
    ]);
  });

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
          <select
            {...rest}
            {...field.props}
            classList={{
              "w-full border outline-none text-gray-600 focus:border-indigo-500 focus:shadow px-4 py-[8px] rounded truncate disabled:bg-[#FAFAFA] disabled:border-gray-300 disabled:appearance-none":
                true,
              "border-red-400": field.helpers.error,
            }}
          >
            <For each={options()}>
              {(option) => (
                <option
                  value={option.value}
                  selected={option.value == field.props.value}
                >
                  {option.label}
                </option>
              )}
            </For>
          </select>
          <Show when={field.helpers.error}>
            <p class="text-sm text-red-400">{field.helpers.errorMessage}</p>
          </Show>
        </div>
      )}
    />
  );
};
