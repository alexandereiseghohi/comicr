import { type ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function NumberInput({
  onChange,
  value,
  ...props
}: Omit<ComponentProps<typeof Input>, "onChange" | "type" | "value"> & {
  onChange: (value: null | number) => void;
  value: null | number | undefined;
}) {
  return (
    <Input
      {...props}
      onChange={(e) => {
        const number = e.target.valueAsNumber;
        onChange(isNaN(number) ? null : number);
      }}
      type="number"
      value={value ?? ""}
    />
  );
}

export function InputGroupNumberInput({ className, ...props }: React.ComponentProps<typeof NumberInput>) {
  return (
    <NumberInput
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
        className
      )}
      data-slot="input-group-control"
      {...props}
    />
  );
}
