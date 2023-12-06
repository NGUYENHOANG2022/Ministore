import { Setter, Resource } from "solid-js";
import { ShiftTemplate } from "~/types";

export interface ShiftTemplateProps {
  setState: Setter<"list" | "edit" | "create">;
  shiftTemplates: Resource<ShiftTemplate[]>;
  refreshShiftTemplates: () => void;
}
