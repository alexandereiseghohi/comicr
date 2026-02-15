"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { createContext, type HTMLAttributes, useContext, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const formatDate = (date: Date, timeZone: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(
    "en-US",
    options ?? {
      dateStyle: "long",
      timeZone,
    }
  ).format(date);

const formatTime = (date: Date, timeZone: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(
    "en-US",
    options ?? {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone,
    }
  ).format(date);

interface RelativeTimeContextType {
  dateFormatOptions?: Intl.DateTimeFormatOptions;
  time: Date;
  timeFormatOptions?: Intl.DateTimeFormatOptions;
}

const RelativeTimeContext = createContext<RelativeTimeContextType>({
  time: new Date(),
  dateFormatOptions: {
    dateStyle: "long",
  },
  timeFormatOptions: {
    hour: "2-digit",
    minute: "2-digit",
  },
});

export type RelativeTimeProps = HTMLAttributes<HTMLDivElement> & {
  dateFormatOptions?: Intl.DateTimeFormatOptions;
  defaultTime?: Date;
  onTimeChange?: (time: Date) => void;
  time?: Date;
  timeFormatOptions?: Intl.DateTimeFormatOptions;
};

export const RelativeTime = ({
  time: controlledTime,
  defaultTime = new Date(),
  onTimeChange,
  dateFormatOptions,
  timeFormatOptions,
  className,
  ...props
}: RelativeTimeProps) => {
  const [time, setTime] = useControllableState<Date>({
    defaultProp: defaultTime,
    prop: controlledTime,
    onChange: onTimeChange,
  });

  useEffect(() => {
    if (controlledTime) {
      return;
    }

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [setTime, controlledTime]);

  return (
    <RelativeTimeContext.Provider
      value={{
        time: time ?? defaultTime,
        dateFormatOptions,
        timeFormatOptions,
      }}
    >
      <div className={cn("grid gap-2", className)} {...(props as any)} />
    </RelativeTimeContext.Provider>
  );
};

export type RelativeTimeZoneProps = HTMLAttributes<HTMLDivElement> & {
  dateFormatOptions?: Intl.DateTimeFormatOptions;
  timeFormatOptions?: Intl.DateTimeFormatOptions;
  zone: string;
};

export interface RelativeTimeZoneContextType {
  zone: string;
}

const RelativeTimeZoneContext = createContext<RelativeTimeZoneContextType>({
  zone: "UTC",
});

export const RelativeTimeZone = ({ zone, className, ...props }: RelativeTimeZoneProps) => (
  <RelativeTimeZoneContext.Provider value={{ zone }}>
    <div className={cn("flex items-center justify-between gap-1.5 text-xs", className)} {...(props as any)} />
  </RelativeTimeZoneContext.Provider>
);

export type RelativeTimeZoneDisplayProps = HTMLAttributes<HTMLDivElement>;

export const RelativeTimeZoneDisplay = ({ className, ...props }: RelativeTimeZoneDisplayProps) => {
  const { time, timeFormatOptions } = useContext(RelativeTimeContext);
  const { zone } = useContext(RelativeTimeZoneContext);
  const display = formatTime(time, zone, timeFormatOptions);

  return (
    <div className={cn("text-muted-foreground ps-8 tabular-nums", className)} {...(props as any)}>
      {display}
    </div>
  );
};

export type RelativeTimeZoneDateProps = HTMLAttributes<HTMLDivElement>;

export const RelativeTimeZoneDate = ({ className, ...props }: RelativeTimeZoneDateProps) => {
  const { time, dateFormatOptions } = useContext(RelativeTimeContext);
  const { zone } = useContext(RelativeTimeZoneContext);
  const display = formatDate(time, zone, dateFormatOptions);

  return <div {...(props as any)}>{display}</div>;
};

export type RelativeTimeZoneLabelProps = HTMLAttributes<HTMLDivElement>;

export const RelativeTimeZoneLabel = ({ className, ...props }: RelativeTimeZoneLabelProps) => (
  <div
    className={cn("bg-secondary flex h-4 items-center justify-center rounded-xs px-1.5 font-mono", className)}
    {...(props as any)}
  />
);

// Demo
const demoTimezones = [
  { zone: "America/New_York", label: "NYC", flag: "🇺🇸" },
  { zone: "Europe/London", label: "LON", flag: "🇬🇧" },
  { zone: "Europe/Paris", label: "PAR", flag: "🇫🇷" },
  { zone: "Asia/Tokyo", label: "TYO", flag: "🇯🇵" },
  { zone: "Australia/Sydney", label: "SYD", flag: "🇦🇺" },
];

export function RelativeTimeDemo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="bg-muted/50 h-64 w-80 animate-pulse rounded-lg" />;
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="bg-background rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-medium">World Clock</h3>
        <RelativeTime className="gap-3">
          {demoTimezones.map(({ zone, label, flag }) => (
            <RelativeTimeZone key={zone} zone={zone}>
              <div className="flex items-center gap-2">
                <span>{flag}</span>
                <RelativeTimeZoneLabel>{label}</RelativeTimeZoneLabel>
                <RelativeTimeZoneDate className="text-muted-foreground" />
              </div>
              <RelativeTimeZoneDisplay className="font-mono text-sm" />
            </RelativeTimeZone>
          ))}
        </RelativeTime>
      </div>
    </div>
  );
}
