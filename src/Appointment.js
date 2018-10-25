/**
 * The object representing an appointment
 */
export class AppointmentData {
  constructor(date, startTime, duration, isRequested=true){
    this.date = date;
    this.startTime = Number(startTime); //Total Minutes since midngiht
    this.duration = Number(duration); //Minutes as well
    this.endTime = Number(this.startTime + this.duration);
    this.timeZoneOffset = this.date.getTimezoneOffset();
    this.isRequested = isRequested;
  }
}