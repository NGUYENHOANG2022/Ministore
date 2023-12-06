import moment from "moment";

export default function getDatesUntilWeek(dateArray: string[], dateB: string, today: string) {
  const newDatesArray = [];

  for (const date of dateArray) {
    const newDate = moment(date);
    if (newDate.isSameOrBefore(today)) newDate.add(1, 'week');

    console.log(today, newDate.format("YYYY-MM-DD"))
    while (newDate.isSameOrBefore(dateB)) {
      newDatesArray.push(newDate.format('YYYY-MM-DD'));
      newDate.add(1, 'week');
    }
  }

  return newDatesArray;
}