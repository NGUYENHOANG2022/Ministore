import moment from "moment";

const displayDate = (dateStr: string | undefined) => {
  if (dateStr === undefined) return;
  let date = moment(dateStr);
  // Check if the date is less than 24 hours ago
  if (moment().diff(date, "hours") < 24) {
    // Display relative time (e.g., "2 hours ago")
    let relativeTime = date.fromNow();
    return `Created ${relativeTime} ago`;
  } else {
    // Display full date string
    let fullDate = date.format("MMM DD YYYY [at] h:mma");
    return `Created on ${fullDate}`;
  }
};

export default displayDate;
