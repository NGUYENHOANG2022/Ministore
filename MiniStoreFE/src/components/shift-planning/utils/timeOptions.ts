import moment from "moment";

// returns an array of time options in 30 minute increments
export function timeOptions(startFrom = {hour: 0, minute: 0}) {
  const timeArray = [];

  for (let hour = startFrom.hour; hour < 24; hour++) {
    const startMinute = (hour === startFrom.hour) ? startFrom.minute : 0;
    for (let minute = startMinute; minute < 60; minute += 30) {
      const time = moment({hour, minute}).format("HH:mm:ss");
      const label = moment({hour, minute}).format("h:mma");

      timeArray.push({value: time, label: label});
    }
  }

  return timeArray;
}

// returns an object with hour and minute properties
export function transformTimeString(timeString: string) {
  const momentTime = moment(timeString, "h:mma");
  const hour = momentTime.hour();
  const minute = momentTime.minute();

  return {hour, minute};
}