import * as React from "react";
import Paper from "@mui/material/Paper";
import { ViewState, IntegratedEditing } from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  WeekView,
  Appointments,
  AppointmentForm,
  AppointmentTooltip,
  DragDropProvider,
  Toolbar,
  DateNavigator,
  TodayButton,
} from "@devexpress/dx-react-scheduler-material-ui";
import useReservedSlots from "../../services/hooks/useReservedSlots";
import ReceivedSlots from "./ReceiveSlots";
import EditingStateComponent from "./EditingState";
import useTimeTableCell from "../../models/utils/useTimeTableCell";
import { BusinessHour, ReservedSlot } from "../../models/types";

const PREFIX = "Demo";
// #FOLD_BLOCK
export const classes = {
  container: `${PREFIX}-container`,
  text: `${PREFIX}-text`,
  formControlLabel: `${PREFIX}-formControlLabel`,
};

type Appointment = {
  title: string;
  startDate: Date;
  endDate: Date;
  id: string;
  location: string;
};

type Props = {
  warehouseId: number;
  businessHours: Array<BusinessHour>;
};

const Calendar: React.FC<Props> = ({ warehouseId, businessHours }) => {
  const { reservedSlots, mutate } = useReservedSlots(warehouseId);
  const includedDays = businessHours.map((businessHour) => businessHour.day);

  const excludedDays = React.useCallback(() => {
    let excludedItems = [];
    for (let i = 1; i <= 6; i++)
      if (!includedDays.includes(i)) excludedItems.push(i);
    return excludedItems;
  }, [includedDays]);

  const [data, setData] = React.useState<Array<Appointment>>([]);

  React.useEffect(() => {
    setData(
      reservedSlots.map((reservedSlot: ReservedSlot) => ({
        title: reservedSlot.reservation_name,
        startDate: new Date(reservedSlot.start_time),
        endDate: new Date(reservedSlot.end_time),
        id: reservedSlot.uuid,
        allDay: false,
      }))
    );
  }, [reservedSlots]);

  const [currentDate, setCurrentDate] = React.useState();

  const TimeTableCell = useTimeTableCell(businessHours)

  const CommandButton = React.useCallback(({ id, ...restProps }) => {
    if (id === "deleteButton") {
      return (
        <AppointmentForm.CommandButton
          id={id}
          {...restProps}
          disabled={false}
        />
      );
    }
    return <AppointmentForm.CommandButton id={id} {...restProps} />;
  }, []);

  const currentDateChange = (currentDate: any) => {
    setCurrentDate(currentDate);
  };

  return (
    <>
      <Paper>
        <Scheduler data={data} height={600}>
          <ViewState
            currentDate={currentDate}
            onCurrentDateChange={currentDateChange}
          />
          <EditingStateComponent
            warehouseId={warehouseId}
            reservedSlots={reservedSlots}
            mutate={mutate}
            data={data}
            setData={setData}
          />
          <IntegratedEditing />
          <WeekView
            startDayHour={0}
            endDayHour={24}
            timeTableCellComponent={TimeTableCell}
            excludedDays={excludedDays()}
            cellDuration={15}
          />
          <Toolbar />
          <DateNavigator />
          <TodayButton />
          <Appointments />

          <AppointmentTooltip showOpenButton showDeleteButton={true} />
          <AppointmentForm
            commandButtonComponent={CommandButton}
            readOnly={false}
          />
          <DragDropProvider allowDrag={() => true} allowResize={() => true} />
        </Scheduler>
        <ReceivedSlots
          warehouseId={warehouseId}
          reservedSlots={reservedSlots}
          mutate={mutate}
        />
      </Paper>
    </>
  );
};

export default Calendar;
