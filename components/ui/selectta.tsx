// =============================================
// Lightweight headless Select API compatible with shadcn usage in the page
// =============================================

import * as React from "react";
import { cn } from "@/lib/utils";

type SelectCtx = {
  value?: string;
  onValueChange: (v: string) => void;
  placeholder?: string;
  open: boolean;
  setOpen: (b: boolean) => void;
  items: { value: string; label: React.ReactNode }[];
  setItems: React.Dispatch<
    React.SetStateAction<{ value: string; label: React.ReactNode }[]>
  >;
};

const Ctx = React.createContext<SelectCtx | null>(null);

export function Select({
  value,
  onValueChange,
  children,
}: {
  value?: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<
    { value: string; label: React.ReactNode }[]
  >([]);
  const ctx = React.useMemo(
    () => ({
      value,
      onValueChange,
      placeholder: undefined,
      open,
      setOpen,
      items,
      setItems,
    }),
    [value, onValueChange, open, items]
  );
  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

export function SelectTrigger({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(Ctx)!;
  return (
    <button
      type="button"
      className={cn(
        "w-full justify-between rounded-xl border bg-background px-3 py-2 text-sm",
        className
      )}
      onClick={() => ctx.setOpen(!ctx.open)}
      {...props}
    >
      <span className="truncate">{children}</span>
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(Ctx)!;
  const current = ctx.items.find((i) => i.value === ctx.value);
  return (
    <span className={cn(!current && "text-muted-foreground")}>
      {current ? current.label : placeholder ?? "Select"}
    </span>
  );
}

export function SelectContent({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(Ctx)!;
  if (!ctx.open) return null;
  return (
    <div
      className={cn(
        "z-50 mt-2 max-h-64 w-full overflow-auto rounded-xl border bg-popover p-1 shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(Ctx)!;
  React.useEffect(() => {
    ctx.setItems((prev) =>
      prev.some((i) => i.value === value)
        ? prev
        : [...prev, { value, label: children }]
    );
  }, [value, children]);
  const active = ctx.value === value;
  return (
    <div
      role="option"
      aria-selected={active}
      onClick={() => {
        ctx.onValueChange(value);
        ctx.setOpen(false);
      }}
      className={cn(
        "cursor-pointer select-none rounded-lg px-2 py-1.5 text-sm hover:bg-accent",
        active && "bg-accent"
      )}
    >
      {children}
    </div>
  );
}

export const SelectGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-1">{children}</div>
);
export const SelectLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="px-2 py-1 text-xs text-muted-foreground">{children}</div>
);
export default Select;
