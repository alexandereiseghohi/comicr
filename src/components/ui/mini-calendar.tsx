"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { addDays, format, isSameDay, isToday } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Slot } from "radix-ui";
import {
  type ButtonHTMLAttributes,
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Context for sharing state between components
interface MiniCalendarContextType {
  days: number;
  onDateSelect: (date: Date) => void;
  onNavigate: (direction: "next" | "prev") => void;
  selectedDate: Date | null | undefined;
  startDate: Date;
}

const MiniCalendarContext = createContext<MiniCalendarContextType | null>(null);

const useMiniCalendar = () => {
  const context = useContext(MiniCalendarContext);

  if (!context) {
    throw new Error("MiniCalendar components must be used within MiniCalendar");
  }

  return context;
};

// Helper function to get array of consecutive dates
const getDays = (startDate: Date, count: number): Date[] => {
  const days: Date[] = [];
  for (let i = 0; i < count; i++) {
    days.push(addDays(startDate, i));
  }
  return days;
};

// Helper function to format date
const formatDate = (date: Date) => {
  const month = format(date, "MMM");
  const day = format(date, "d");

  return { month, day };
};

export type MiniCalendarProps = HTMLAttributes<HTMLDivElement> & {
  days?: number;
  defaultStartDate?: Date;
  defaultValue?: Date;
  onStartDateChange?: (date: Date | undefined) => void;
  onValueChange?: (date: Date | undefined) => void;
  startDate?: Date;
  value?: Date;
};

export const MiniCalendar = ({
  value,
  defaultValue,
  onValueChange,
  startDate,
  defaultStartDate = new Date(),
  onStartDateChange,
  days = 5,
  className,
  children,
  ...props
}: MiniCalendarProps) => {
  const [selectedDate, setSelectedDate] = useControllableState<Date | undefined>({
    prop: value,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  const [currentStartDate, setCurrentStartDate] = useControllableState({
    prop: startDate,
    defaultProp: defaultStartDate,
    onChange: onStartDateChange,
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleNavigate = (direction: "next" | "prev") => {
    const newStartDate = addDays(currentStartDate || new Date(), direction === "next" ? days : -days);
    setCurrentStartDate(newStartDate);
  };

  const contextValue: MiniCalendarContextType = {
    selectedDate: selectedDate || null,
    onDateSelect: handleDateSelect,
    startDate: currentStartDate || new Date(),
    onNavigate: handleNavigate,
    days,
  };

  return (
    <MiniCalendarContext.Provider value={contextValue}>
      <div className={cn("bg-background flex items-center gap-2 rounded-lg border p-2", className)} {...(props as any)}>
        {children}
      </div>
    </MiniCalendarContext.Provider>
  );
};

export type MiniCalendarNavigationProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  direction: "next" | "prev";
};

export const MiniCalendarNavigation = ({
  direction,
  asChild = false,
  children,
  onClick,
  ...props
}: MiniCalendarNavigationProps) => {
  const { onNavigate } = useMiniCalendar();
  const Icon = direction === "prev" ? ChevronLeftIcon : ChevronRightIcon;

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onNavigate(direction);
    onClick?.(event);
  };

  if (asChild) {
    return (
      <Slot.Root onClick={handleClick} {...(props as any)}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <Button
      onClick={handleClick}
      size={asChild ? undefined : "icon"}
      type="button"
      variant={asChild ? undefined : "ghost"}
      {...(props as any)}
    >
      {children ?? <Icon className="size-4" />}
    </Button>
  );
};

export type MiniCalendarDaysProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: (date: Date) => ReactNode;
};

export const MiniCalendarDays = ({ className, children, ...props }: MiniCalendarDaysProps) => {
  const { startDate, days: dayCount } = useMiniCalendar();
  const days = getDays(startDate, dayCount);

  return (
    <div className={cn("flex items-center gap-1", className)} {...(props as any)}>
      {days.map((date) => children(date))}
    </div>
  );
};

export type MiniCalendarDayProps = ComponentProps<typeof Button> & {
  date: Date;
};

export const MiniCalendarDay = ({ date, className, ...props }: MiniCalendarDayProps) => {
  const { selectedDate, onDateSelect } = useMiniCalendar();
  const { month, day } = formatDate(date);
  const isSelected = selectedDate && isSameDay(date, selectedDate);
  const isTodayDate = isToday(date);

  return (
    <Button
      className={cn("h-auto min-w-12 flex-col gap-0 p-2 text-xs", isTodayDate && !isSelected && "bg-accent", className)}
      onClick={() => onDateSelect(date)}
      size="sm"
      type="button"
      variant={isSelected ? "default" : "ghost"}
      {...(props as any)}
    >
      <span className={cn("text-muted-foreground text-[10px] font-medium", isSelected && "text-primary-foreground/70")}>
        {month}
      </span>
      <span className="text-sm font-semibold">{day}</span>
    </Button>
  );
};

// Demo
export function MiniCalendarDemo() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !selectedDate) {
      setSelectedDate(new Date());
    }
  }, [mounted, selectedDate]);

  if (!mounted) {
    return <div className="bg-muted/50 h-16 w-96 animate-pulse rounded-lg" />;
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <MiniCalendar days={7} onValueChange={setSelectedDate} value={selectedDate}>
        <MiniCalendarNavigation direction="prev" />
        <MiniCalendarDays>{(date) => <MiniCalendarDay date={date} key={date.toISOString()} />}</MiniCalendarDays>
        <MiniCalendarNavigation direction="next" />
      </MiniCalendar>
    </div>
  );
}
