import React, { Component } from 'react';
import './Scheduler.css';
import {Calendar} from './Calendar.js';
import {validateDate} from './utils.js';

const durationOptions = { //List Options and minutes
  "30 Minutes":         30,
  "1 Hour":             60,
  "1 Hour 30 Minutes":  90
};

/**
 * The root component of this widget
 */
class Scheduler extends Component {
  constructor(props){
    super(props);
    this.state = {
      requestedAppointments: [],
      date: null,
      duration: null
    }
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleDurationChange = this.handleDurationChange.bind(this);
    this.handleAppointmentRequest = this.handleAppointmentRequest.bind(this);
    this.getAppointmentsByDate = this.getAppointmentsByDate.bind(this);
  }

  handleDateChange(e){
    const dateInput = e.target.value.split('-');
    const newDate = new Date(dateInput[0], dateInput[1]-1, dateInput[2]);
    this.setState({
      date: new Date(newDate)
    });
  }

  handleDurationChange(e){
    this.setState({
      duration: Number(e.target.value)
    })
  }

  handleAppointmentRequest(appointment){
    let sortedAppointments = this.state.requestedAppointments.slice();
    appointment.isRequested = true;
    sortedAppointments.push(appointment);
    //Sort Appointments by start time (first to last)
    sortedAppointments.sort((a, b)=> a.startTime - b.startTime);

    this.setState({
      requestedAppointments: sortedAppointments
    });
    //TODO: Send Appointments to desired location
  }

  /**
   * Get All appointments
   * @param  {Date} date The date to retrive appointments for
   * @return {Array}     Array of appointment objects for the specified date
   */
  getAppointmentsByDate(date){
    let appointmentsOnDate = this.state.requestedAppointments.filter( (appointment)=>{
      let startTime = appointment.date;
      return (startTime.getUTCDate() === date.getUTCDate() &&
        startTime.getUTCMonth() === date.getUTCMonth() &&
        startTime.getUTCFullYear() === date.getUTCFullYear() );
    });
    return appointmentsOnDate;
  }

  render() {
    //isValid is true on valid input, false on invalid, and null on empty
    const isDateValid = this.state.date !== null ? validateDate(this.state.date) : null;
    const isDurationValid = this.state.duration !== null ? true : null;
    const isAppointmentValid = this.state.requestedAppointments.length > 0 ? true : null;
    //Choices for appointment durationElements
    const durationElements = Object.keys(durationOptions).map( (label, index) => <option key={index} value={durationOptions[label]}>{label}</option> );

    return (
      <div className="scheduler">
        <header className="scheduler__header">
          <h1>Request an Appointment</h1>
        </header>
        <form className="scheduler__form">
          <div className="scheduler__field-wrapper">
            <ul className="scheduler__fields">
              <SchedulerField stepNumber={1} isValid={isDateValid}>
                Appointment date
                <input className="scheduler__input" type="date" onChange={this.handleDateChange}/>
              </SchedulerField>
              <SchedulerField stepNumber={2} isValid={isDurationValid}>
                Duration of Appointment
                <select className="scheduler__input" onChange={this.handleDurationChange} defaultValue="">
                  <option value="" disabled>Select your option</option>
                  {durationElements}
                </select>
              </SchedulerField>
              <SchedulerField stepNumber={3} isValid={isAppointmentValid}>
                Select a Start Time:
              </SchedulerField>
            </ul>
          </div>
          <Calendar isEnabled={isDateValid && isDurationValid} 
          date={this.state.date} duration={this.state.duration} 
          appointments={this.getAppointmentsByDate(this.state.date)} 
          handleAppointmentRequest={this.handleAppointmentRequest} />
        </form>
      </div>
    );
  }
}
export default Scheduler;

/**
 * Creates a field for the scheduler with an signifier of its status.
 * Append input elements as children
 * @param {Boolean} props.isValid - true for valid input, false for invalid, null
 *  for no input.  Updates the signifier
 * @param {Number} props.stepNumber - the number to display in the signifier
 */
function SchedulerField(props){
  let isValid = props.isValid;
  const stepNumber = props.stepNumber;

  const classNames = ["scheduler__field"];
  if (isValid !== null){
    classNames.push(isValid === true ? "valid" : "invalid")
  }

  let signifier;
  if (isValid === null) signifier = stepNumber;
  else if (isValid === true) signifier = "✓";
  else signifier = "X";

  return (
    <li className={classNames.join(" ")}>
      <span className="field__step-number">{signifier}</span>
      {props.children}
    </li>    
  );
}