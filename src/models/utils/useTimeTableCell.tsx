import { WeekView } from "@devexpress/dx-react-scheduler-material-ui";
import React from "react";
import { BusinessHour } from "../types";

const useTimeTableCell = (businessHours: Array<BusinessHour>) => {
  const isBusinessOpen = React.useCallback(
    (startDate: Date, endDate: Date) => {
      if (businessHours.length < 1) return;

      const day = startDate.getDay();
      // TODO: group this so we can get it faster
      const businessHour = businessHours.find(
        (businessHour) => businessHour.day === day
      );

      if (!businessHour) {
        return false;
      }
      const [openHour, openMinute] = businessHour.open_time.split(":");
      const [closeHour, closeMinute] = businessHour.close_time.split(":");
      const openTime = new Date(
        Date.UTC(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          +openHour,
          +openMinute,
          0
        )
      );
      const closeTime = new Date(
        Date.UTC(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          +closeHour,
          +closeMinute,
          0
        )
      );
      return openTime <= startDate && closeTime >= endDate;
    },
    [businessHours]
  );

  const TimeTableCell = React.useCallback(React.memo(({ onDoubleClick, isShaded, startDate, endDate, ...restProps }) => {
    return (
      <WeekView.TimeTableCell
        {...restProps}
        onDoubleClick={
          isBusinessOpen(startDate, endDate) ? onDoubleClick : undefined
        }
        isShaded={!isBusinessOpen(startDate, endDate)}
      />
    );
  }), [businessHours])

  return TimeTableCell
}

export default useTimeTableCell