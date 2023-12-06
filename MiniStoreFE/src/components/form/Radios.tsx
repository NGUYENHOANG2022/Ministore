import { FieldProps, Field } from "solid-form-handler";
import { Component, For, Show } from "solid-js";

type SelectableOption = { value: string | number; label: string };

export type RadiosProps = FieldProps & {
  label?: string;
  options?: Array<SelectableOption>;
  value?: string | number;
  triggers?: string[];
  class?: string;
  classList?: Record<string, boolean>;
};

export const Radios: Component<RadiosProps> = (props) => {
  return (
    <Field
      {...props}
      mode="radio-group"
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
                <div class="flex items-center gap-x-2 mb-2">
                  <input
                    {...field.props}
                    id={`${field.props.id}-${i()}`}
                    checked={field.helpers.isChecked(option.value)}
                    value={option.value}
                    class=""
                    classList={{
                      "appearance-none w-4 h-4 border-2 border-red-400 rounded-full":
                        field.helpers.error,
                    }}
                    type="radio"
                  />
                  <Show when={option.label}>
                    <label
                      classList={{ "text-red-400": field.helpers.error }}
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
