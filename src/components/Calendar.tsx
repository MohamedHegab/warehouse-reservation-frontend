import * as React from 'react';
import Paper from '@mui/material/Paper';
import { ViewState, EditingState, IntegratedEditing } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  WeekView,
  Appointments,
  AppointmentForm,
  AppointmentTooltip,
  DragDropProvider,
  Toolbar,
  DateNavigator,
  TodayButton
} from '@devexpress/dx-react-scheduler-material-ui';

import { appointments } from './appointments';
import useBusinessHours from '../services/hooks/useBusinessHours';
import useReservedSlots from '../services/hooks/useReservedSlots';

const PREFIX = 'Demo';
// #FOLD_BLOCK
export const classes = {
  container: `${PREFIX}-container`,
  text: `${PREFIX}-text`,
  formControlLabel: `${PREFIX}-formControlLabel`,
};

const Calendar = ({ title, warehouseId }: { title: string, warehouseId: number }) => {
  const { businessHours, isLoading: isBusinessHoursLoading, isError: isBusinessHoursError } = useBusinessHours(warehouseId);
  const { reservedSlots, isLoading: isReservedSlotsLoading, isError: isReservedSlotsError } = useReservedSlots(warehouseId);
  console.log({ businessHours })
  const [data, setData] = React.useState(appointments);
  const [addedAppointment, setAddedAppointment] = React.useState({});
  const [isAppointmentBeingCreated, setIsAppointmentBeingCreated] = React.useState(false);
  const [currentDate, setCurrentDate] = React.useState('2018-06-27')
  const {
    allowAdding, allowDeleting, allowUpdating, allowResizing, allowDragging,
  } = {
    allowAdding: true,
    allowDeleting: true, allowUpdating: true, allowResizing: true, allowDragging: true,
  };

  const onCommitChanges = React.useCallback(({
    added,
    changed,
    deleted
  }: { added: any, changed: any, deleted: any }) => {
    if (added) {
      const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
      setData([...data, { id: startingAddedId, ...added }]);
    }
    if (changed) {
      setData(data.map(appointment => (
        changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment)));
    }
    if (deleted !== undefined) {
      setData(data.filter(appointment => appointment.id !== deleted));
    }
    setIsAppointmentBeingCreated(false);
  }, [setData, setIsAppointmentBeingCreated, data]);
  const onAddedAppointmentChange = React.useCallback((appointment: any) => {
    setAddedAppointment(appointment);
    setIsAppointmentBeingCreated(true);
  }, []);

  const TimeTableCell = React.useCallback(React.memo(({ onDoubleClick, ...restProps }) => (
    <WeekView.TimeTableCell
      {...restProps}
      onDoubleClick={allowAdding ? onDoubleClick : undefined}
    />
  )), [allowAdding]);

  const CommandButton = React.useCallback(({ id, ...restProps }) => {
    if (id === 'deleteButton') {
      return <AppointmentForm.CommandButton id={id} {...restProps} disabled={!allowDeleting} />;
    }
    return <AppointmentForm.CommandButton id={id} {...restProps} />;
  }, [allowDeleting]);

  const allowDrag = React.useCallback(
    () => allowDragging && allowUpdating,
    [allowDragging, allowUpdating],
  );
  const allowResize = React.useCallback(
    () => allowResizing && allowUpdating,
    [allowResizing, allowUpdating],
  );

  const currentDateChange = (currentDate: any) => {
    setCurrentDate(currentDate)
  };
  return (
    <>
      <Paper>
        <Scheduler
          data={data}
          height={600}
        >
          <ViewState
            currentDate={currentDate}
            onCurrentDateChange={currentDateChange}
          />
          <EditingState
            onCommitChanges={onCommitChanges}
            addedAppointment={addedAppointment}
            onAddedAppointmentChange={onAddedAppointmentChange}
          />
          {/* <IntegratedEditing /> */}
          <WeekView
            startDayHour={9}
            endDayHour={19}
            timeTableCellComponent={TimeTableCell}
          />
          <Toolbar />
          <DateNavigator />
          <TodayButton />
          <Appointments />

          <AppointmentTooltip
            showOpenButton
            showDeleteButton={allowDeleting}
          />
          <AppointmentForm
            commandButtonComponent={CommandButton}
            readOnly={isAppointmentBeingCreated ? false : !allowUpdating}
          />
          <DragDropProvider
            allowDrag={allowDrag}
            allowResize={allowResize}
          />
        </Scheduler>
      </Paper>
    </>
  );
};

export default Calendar;