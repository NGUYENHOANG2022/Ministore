import moment from "moment";

// This function returns the date of the same day of the week as dateA in the week of dateB
// Example usage:
// const dateA = '2023-05-20';
// const dateB = '2023-07-20';
// const sameWeekDay = getSameWeekDay(dateA, dateB);
// console.log(sameWeekDay); // 2023-07-22 --- which will be a Saturday
export default function getSameWeekDay(dateA: string, dateB:string) {
  const dayOfWeekA = moment(dateA).format('dddd');
  const startOfWeekB = moment(dateB).startOf('week');
  // console.log(startOfWeekB, startOfWeekB.clone().day(dayOfWeekA).format("YYYY-MM-DD"))

  // Find the first occurrence of the dayOfWeekA in the week of dateB
  let newDate = startOfWeekB.clone().day(dayOfWeekA);

  if (newDate.isBefore(moment(dateB))) {
    newDate.add(7, 'days');
  }

  return newDate.format('YYYY-MM-DD');
}