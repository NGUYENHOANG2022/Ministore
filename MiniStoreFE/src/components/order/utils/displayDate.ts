import moment from "moment";

export default function displayDate(dateStr: string) {
  let date = moment(dateStr);
  // Check if the date is less than 24 hours ago
  if (moment().diff(date, "hours") < 24) {
    // Display relative time (e.g., "2 hours ago")
    return date.fromNow();
  } else {
    // Display full date string
    return date.format("D MMM YYYY");
  }
}