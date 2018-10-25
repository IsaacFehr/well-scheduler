/**
 * Verifies that a given date is in the future based on the machine's local time
 * @param  {Date} date - the date to check 
 * @return {Boolean} - True if the date is in the future, false if the date is
 * in the past or not a date
 */
export function validateDate(date){
  if (!(date instanceof Date)) return false;
  const now = new Date(); 
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  return date.getTime() >= today.getTime();
}

/**
 * Creates a readable string for the hours and minutes.
 * @param  {Number} minutesSinceMidnight - Minutes since midnight
 * @param  {Boolean} includeAmPm - if the AM/PM characters should be included
 * @return {String} - the readable string
 */
export function formatTime(minutesSinceMidnight, includeAmPm=true){
  const hours = Math.floor(minutesSinceMidnight) / 60;
  const minutes = minutesSinceMidnight % 60;
  let time = new Date(0, 0, 0, hours, minutes).toLocaleTimeString("en-US", 
    {hour12: true, hour: "2-digit", minute: "2-digit", "second": undefined });
  if(!includeAmPm) time = time.slice(0,-3);
  return time;
}