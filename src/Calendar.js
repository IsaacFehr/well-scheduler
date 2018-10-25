import React, { Component } from 'react';
import {AppointmentData} from './Appointment.js';
import {formatTime} from './utils.js';

const calendarSettings = {
  startTime: 8 * 60,      //8:00AM
  endTime:   20 * 60,     //10:00PM
  appointmentInterval: 30 //Appointments can be scheduled on every half hour
}

/**
 * The component that shows a calendar and allows users to create an appointment on it
 * @param {Boolean} props.isEnabled - true if the user can create appointments
 * @param {Date} props.date - the date to create the appointment on
 * @param {Number} props.duration - the duration, in minutes of the appointment
 * @param {[Appointment]} - an array of Appointment objects to render
 */
export class Calendar extends Component{
  constructor(props){
    super(props);
    this.parentHandleAppointmentRequest = this.props.handleAppointmentRequest;
    this.handleAppointmentRequest = this.handleAppointmentRequest.bind(this);
    this.handleTimeSlotClick = this.handleTimeSlotClick.bind(this);
    this.state = {
      selectedAppointment: null
    }
  }

  //Get rid of any unrequested appointments if options in the forms change
  static getDerivedStateFromProps(props, state){
    if (state.selectedAppointment !== null && (!props.isEnabled || props.duration !== state.selectedAppointment.duration) ){
      return({selectedAppointment: null});
    } else return null
  }

  handleTimeSlotClick(e){
    let timeSlot = e.currentTarget;
    if(timeSlot.classList.contains("is-open")){
      let appointment = new AppointmentData(this.props.date, timeSlot.getAttribute("value"), this.props.duration, false);
      this.setState({
        selectedAppointment: appointment
      });
    }
  }

  handleAppointmentRequest(e){
    e.preventDefault();
    this.parentHandleAppointmentRequest(this.state.selectedAppointment);
    this.setState({selectedAppointment: null});
  }

  render(){
    const isEnabled = this.props.isEnabled;
    const duration = this.props.duration;
    const appointments = this.props.appointments.slice();
    //Add the unrequested appointment
    if(this.state.selectedAppointment){
      appointments.push(this.state.selectedAppointment );
      appointments.sort( (a, b) => a.startTime - b.startTime );
    }

    const startTime = calendarSettings.startTime;
    const endTime = calendarSettings.endTime;
    const interval = calendarSettings.appointmentInterval;

    let timeSlots = [];
    let nextAppointment = appointments.shift();
    let currentAppointment = null;
    //Render Timeslots and appointments
    for(let time = startTime; time <= endTime; time += interval){ //In minutes
      if(!currentAppointment && nextAppointment && time >= nextAppointment.startTime){
        currentAppointment = nextAppointment;
        currentAppointment.timeSlots = [];
        nextAppointment = appointments.length > 0 ? appointments.shift() : null;
      }
      //A timeslot is selectable if an appointment in it with the current
      //duration wouldn't overlap another appointment
      let isOpen = isEnabled && 
        (!currentAppointment || time >= currentAppointment.endTime ) && 
        (!nextAppointment || !(nextAppointment.isRequested && duration > nextAppointment.startTime - time) );

      let timeSlot = <TimeSlot key={time} time={time} isOpen={isOpen} handleClick={this.handleTimeSlotClick}/>;

      if (!currentAppointment){
        timeSlots.push(timeSlot);
      } else { //Put this timeslot in the appointment
        currentAppointment.timeSlots.push(timeSlot);
        if(time - currentAppointment.startTime + interval >= currentAppointment.duration){ //Finished the timeslots for this appointment 
          timeSlots.push(
            <Appointment appointmentData={currentAppointment} handleAppointmentRequest={this.handleAppointmentRequest} key={"Appointment"+ currentAppointment.startTime} >
              {currentAppointment.timeSlots}
            </Appointment>
          );
          currentAppointment = null;
        }
      } 
    }
    return(
      <div className="scheduler__calendar">
        {timeSlots}
      </div>
    );
  }
}

/**
 * Creates a timeslot in a calendar that can be made an appointment for
 * @param {Number} props.time - The start time, in minutes, for this slot
 * @param {Boolean} props.isOpen - If this slot can be clicked for an appointment
 * @param {Function} props.handleClick - what to do when clicked
 */
function TimeSlot(props){
  const time = props.time;
  const isOpen = props.isOpen;
  const handleClick = props.handleClick;

  const classNames = ["time-slot", isOpen ? "is-open" : ""];
  const formattedTime = formatTime(time);

  return(
    <li className={classNames.join(" ")} value={time} onClick={handleClick}>
      <span className="time-slot__label">
        {formattedTime}
      </span>
    </li>
  );
}

/**
 * Wraps an appointment around timeslots
 * @param {Function} props.handleAppointmentRequest - callback for creating an
 * appointment
 * @param {Appointment} appointmentData - an object representing this appointment
 * @param {Boolean} isRequested - if this appointment is finalized or not
 */
function Appointment(props){
  const handleAppointmentRequest = props.handleAppointmentRequest;
  const appointmentData = props.appointmentData;
  const isRequested = appointmentData.isRequested;

  const startTimeString = formatTime(appointmentData.startTime, false);
  const endTimeString = formatTime(appointmentData.startTime + appointmentData.duration, false)

  let classNames = ["appointment"];
  if(isRequested) classNames.push("requested");

  return(
    <span className={classNames.join(" ")}>
      <span className="appointment__info">
        {appointmentData.date.toDateString()}, {startTimeString}-{endTimeString}
        {!isRequested ? 
          <input className="appointment__submit" type="submit" value="Request" onClick={handleAppointmentRequest}/> :
          <div className="appointment__submit_message">Requested</div>
        } 
      </span>
      {props.children}
    </span>
  );
}