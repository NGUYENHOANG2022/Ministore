import moment from "moment";

// Format shift times to 12-hour clock with minutes
// Example: 13:00:00 - 21:00:00 => 1pm - 9pm
export function shiftTimes(startTime: string, endTime: string) {
  const format = "h:mma"; // Time format: 12-hour clock with minutes

  const start = moment(startTime, "HH:mm:ss");
  const end = moment(endTime, "HH:mm:ss");

  const formattedStart = start.format(format).replace(":00", "");
  const formattedEnd = end.format(format).replace(":00", "");

  return `${formattedStart} - ${formattedEnd}`;
}

// Format shift times to 12-hour clock
// Example: 13:00:00 => 1:00pm
export function timeToReadable(time: string) {
  const format = "h:mma"; // Time format: 12-hour clock with minutes

  const t = moment(time, "HH:mm:ss");

  if (!t.isValid()) return "";

  return t.format(format);
}

// Format readable time to 24-hour clock
// Example: 1:00pm => 13:00:00
export function readableToTimeStr(time: string) {
  const format = "HH:mm:ss"; // Time format: 12-hour clock with minutes

  const t = moment(time, "h:mma");

  if (!t.isValid()) return "";

  return t.format(format);
}

export function shiftDetailsTime(
  date: string,
  startTime: string,
  endTime: string
) {
  const format = "h:mma"; // Time format: 12-hour clock with minutes

  const start = moment(startTime, "HH:mm:ss");
  const end = moment(endTime, "HH:mm:ss");
  const d = moment(date, "YYYY-MM-DD").format("ddd, MMM D");

  const formattedStart = start.format(format).replace(":00", "");
  const formattedEnd = end.format(format).replace(":00", "");

  return `${d}, ${formattedStart} - ${formattedEnd}`;
}
