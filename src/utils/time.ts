import dayjs from "dayjs";

type TimeUnit = "seconds" | "minutes" | "hours" | "days" | "months" | "years";
type OutputUnit = "seconds" | "milliseconds" | "dateTime";

interface ToTime {
  unit: TimeUnit;
  value: number;
  output?: OutputUnit;
}

export function toTime({
  unit,
  value,
  output = "seconds",
}: ToTime): number | Date {
  const now = dayjs();

  const dayjsUnit = unit.slice(0, -1) as
    | "second"
    | "minute"
    | "hour"
    | "day"
    | "month"
    | "year";
  const target = now.add(value, dayjsUnit);

  switch (output) {
    case "seconds":
      return target.diff(now, "second");

    case "milliseconds":
      return target.diff(now, "millisecond");

    case "dateTime":
      return target.toDate();
  }
}
