import moment from "moment";

export default function isDayInThePast(date: string) {
  const currentDate = moment().startOf("day");
  const inputDate = moment(date).startOf("day");

  return inputDate.isBefore(currentDate);
}
