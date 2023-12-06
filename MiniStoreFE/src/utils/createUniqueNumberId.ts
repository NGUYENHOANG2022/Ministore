export default function createUniqueNumberId() {
  const date = new Date(); // Get the current date
  const timestamp = date.getTime(); // Get the timestamp in milliseconds
  const randomSuffix = Math.floor(Math.random() * 1000); // Add a random suffix for uniqueness
  const uniqueId = parseInt(`${timestamp}${randomSuffix}`, 10); // Concatenate timestamp and random suffix

  return uniqueId;
}
