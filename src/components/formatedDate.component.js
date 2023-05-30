export function getFormattedDate() {
  // Create a new Date object with the current date and time
  const now = new Date();

  // Get the year, month, day, hour, minute, and second from the Date object
  const year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  let hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const ampm = hour >= 12 ? "PM" : "AM"; // Determine AM or PM suffix
  hour = hour % 12 || 12; // Convert to 12-hour time and get hour value

  // Conditionally add leading zeros to month, day, minute, and second
  month = month < 10 ? `0${month}` : month;
  day = day < 10 ? `0${day}` : day;
  hour = hour < 10 ? `0${hour}` : hour;
  const minuteStr = minute < 10 ? `0${minute}` : minute;
  const secondStr = second < 10 ? `0${second}` : second;

  // Create the formatted date string
  const formattedDate = `${year}-${month}-${day}_${hour}-${minuteStr}-${secondStr}_${ampm}`;

  return formattedDate;
}

// module.exports = getFormattedDate;

// This code will output a string in the format yyyy-mm-dd_hh-mm-ss_AM/PM, with leading zeros added to the hour only if it's less than 10, and no leading zeros added to the month, day, minute, and second if they're greater than or equal to 10.
