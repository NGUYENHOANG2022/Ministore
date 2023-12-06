import { Field, FieldProps } from "solid-form-handler";
import { Component, For, JSX, Show } from "solid-js";

type SelectableOption = {
  value: string | number;
  label: string;
  disabled: boolean;
};

export type CheckboxesProps = FieldProps & {
  display?: "switch";
  label?: string;
  options?: Array<SelectableOption>;
  onChange?: JSX.DOMAttributes<HTMLInputElement>["onChange"];
  onBlur?: JSX.DOMAttributes<HTMLInputElement>["onBlur"];
  value?: Array<string | number>;
  triggers?: string[];
  class?: string;
  classList?: Record<string, boolean>;
};

export const Checkboxes: Component<CheckboxesProps> = (props) => {
  return (
    <Field
      {...props}
      mode="checkbox-group"
      render={(field) => (
        <div classList={props.classList}>
          <Show when={props.label}>
            <label class="inline-block mb-1.5 text-gray-600 font-semibold">
              {props.label}
            </label>
          </Show>
          <div class={props.class}>
            <For each={props.options}>
              {(option, i) => (
                <div
                  class="flex items-center gap-x-2 mb-2"
                  classList={{ "opacity-50": option.disabled }}
                >
                  <input
                    {...field.props}
                    id={`${field.props.id}-${i()}`}
                    checked={field.helpers.isChecked(option.value)}
                    value={option.value}
                    disabled={option.disabled}
                    classList={{
                      "appearance-none w-4 h-4 border-2 border-red-400 rounded-full":
                        field.helpers.error,
                      "cursor-default": option.disabled,
                      "cursor-pointer": !option.disabled,
                    }}
                    type="checkbox"
                  />
                  <Show when={option.label}>
                    <label
                      classList={{
                        "text-red-400": field.helpers.error,
                        "cursor-default": option.disabled,
                        "cursor-pointer": !option.disabled,
                      }}
                      for={`${field.props.id}-${i()}`}
                    >
                      {option.label}
                    </label>
                  </Show>
                </div>
              )}
            </For>
          </div>
          <Show when={field.helpers.error}>
            <p class="text-sm text-red-400">{field.helpers.errorMessage}</p>
          </Show>
        </div>
      )}
    />
  );
};
