import { useState } from "react";
import { formatDate } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { motion } from "framer-motion";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

const Calendar = () => {
  const [currentEvents, setCurrentEvents] = useState([]);

  const handleDateClick = (selected) => {
    const title = prompt("Please enter a new title for your event");
    const calendarApi = selected.view.calendar;
    calendarApi.unselect();

    if (title) {
      calendarApi.addEvent({
        id: `${selected.dateStr}-${title}`,
        title,
        start: selected.startStr,
        end: selected.endStr,
        allDay: selected.allDay,
      });
    }
  };

  const handleEventClick = (selected) => {
    if (
      window.confirm(
        `Are you sure you want to delete the event '${selected.event.title}'?`
      )
    ) {
      selected.event.remove();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl w-full mx-auto my-10 p-8 bg-gray-800 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-lg shadow-2xl border border-gray-700"
    >
      <style>
        {`
          .fc .fc-toolbar-title {
            color: white !important;
            font-weight: bold !important;
          }
          .fc .fc-button {
            color: white !important;
            background-color: transparent !important;
            border: 1px solid white !important;
          }
          .fc .fc-button:hover {
            background-color: #ffffff40 !important;
          }
          .fc .fc-daygrid-day-number, .fc .fc-timegrid-event-harness, .fc .fc-list-event-title, .fc .fc-list-event-time {
            color: white !important;
            font-weight: bold !important;
          }
          
        `}
      </style>
      <Box m="20px">
        <Typography
          variant="h3"
          gutterBottom
          align="center"
          style={{ color: "#FFF" }}
        ></Typography>

        <Box display="flex" justifyContent="space-between">
          <Box
            flex="1 1 20%"
            className="p-4 rounded-lg shadow-lg"
            style={{
              backgroundImage: "linear-gradient(to right, #32D74B, #2C7A4B)",
              color: "#FFF",
            }}
          >
            <Typography variant="h5" gutterBottom align="center">
              Events
            </Typography>
            <List>
              {currentEvents.map((event) => (
                <ListItem
                  key={event.id}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    margin: "10px 0",
                    borderRadius: "8px",
                    padding: "10px",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      cursor: "pointer",
                    },
                  }}
                >
                  <ListItemText
                    primary={event.title}
                    secondary={formatDate(event.start, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box flex="1 1 75%" ml="15px">
            <FullCalendar
              height="auto"
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                listPlugin,
              ]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
              }}
              initialView="dayGridMonth"
              editable={true}
              selectable={true}
              dayMaxEvents={true}
              select={handleDateClick}
              eventClick={handleEventClick}
              eventsSet={setCurrentEvents}
            />
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default Calendar;
