import moment from "moment";

export function getWeekFirstAndLastDates(dateString: string) {
  let date = moment(dateString, "YYYY-MM-DD");
  if (!date.isValid()) {
    date = moment();
  }
  const from_date = date.clone().isoWeekday(1);
  const to_date = date.clone().isoWeekday(7);
  return [from_date, to_date];
}

export default function getWeekDates(dateString: string) {
  let date = moment(dateString, "YYYY-MM-DD");
  if (!date.isValid()) {
    date = moment();
  }
  const startOfWeek = date.clone().isoWeekday(1);
  const weekDates = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = startOfWeek.clone().add(i, "days");
    weekDates.push(currentDate);
  }

  return weekDates;
}

export function getWeekDateStings(dateString: string | undefined) {
  let date = moment(dateString, "YYYY-MM-DD");
  if (!date.isValid()) {
    date = moment();
  }
  const startOfWeek = date.clone().isoWeekday(1);
  const weekDates = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = startOfWeek.clone().add(i, "days");
    weekDates.push(currentDate.format("YYYY-MM-DD"));
  }

  return weekDates;
}
