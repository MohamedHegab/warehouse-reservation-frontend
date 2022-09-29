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
import useReservedSlots, {
  addReservedSlot, destroyReservedSlot, updateReservedSlot
} from '../services/hooks/useReservedSlots';
import { ActionCableConsumer } from 'react-actioncable-provider'

const PREFIX = 'Demo';
// #FOLD_BLOCK
export const classes = {
  container: `${PREFIX}-container`,
  text: `${PREFIX}-text`,
  formControlLabel: `${PREFIX}-formControlLabel`,
};

type BusinessHour = {
  id: number,
  day: number,
  open_time: string,
  close_time: string,
}

type ReservedSlot = {
  reservation_name: string,
  start_time: string,
  end_time: string,
  uuid: string,
  allDay: boolean
}

type Appointment = {
  title: string,
  startDate: Date,
  endDate: Date,
  id: string,
  location: string
}

type Props = {
  warehouseId: number,
  businessHours: Array<BusinessHour>
}

const Calendar: React.FC<Props> = ({ warehouseId, businessHours }) => {
  const { reservedSlots, mutate } = useReservedSlots(warehouseId);
  const includedDays = businessHours.map((businessHour) => businessHour.day)

  const excludedDays = React.useCallback(() => {
    let excludedItems = [];
    for (let i = 1; i <= 6; i++) if (!includedDays.includes(i)) excludedItems.push(i);
    return excludedItems;
  }, [includedDays])

  const [data, setData] = React.useState<Array<Appointment>>([])
  React.useEffect(() => {
    setData(reservedSlots.map((reservedSlot: ReservedSlot) => (
      {
        title: reservedSlot.reservation_name,
        startDate: new Date(reservedSlot.start_time),
        endDate: new Date(reservedSlot.end_time),
        id: reservedSlot.uuid,
        allDay: false
      })
    ))
  }, [reservedSlots])

  const createReceiveSlot = (response) => {
    if (reservedSlots.find(reservedSlot =>
      reservedSlot.start_time === response.start_time &&
      reservedSlot.end_time === response.end_time)
    )
      return
    mutate(async () => {
      return [...reservedSlots, response]
    }, { optimisticData: [...reservedSlots, response] });
  }

  const destroyReceiveSlot = (response) => {
    const index = reservedSlots.findIndex(({ uuid }) => uuid === response.uuid)
    if (index > -1) {
      mutate(async () => {
        return [...reservedSlots, response]
      }, { optimisticData: [...reservedSlots.splice(index, 1)] });
    }
  }

  const updateReceiveSlot = (response) => {
    if (reservedSlots.find(reservedSlot =>
      reservedSlot.start_time === response.start_time &&
      reservedSlot.end_time === response.end_time)
    )
      return
    const index = reservedSlots.findIndex(({ uuid }) => uuid === response.uuid)
    if (index > -1) {
      mutate(async () => {
        return [...reservedSlots.splice(index, 1, response)]
      }, { optimisticData: [...reservedSlots.splice(index, 1, response)] });
    }
  }

  const handleReceiveSlots = (response: { action: string, data: any }) => {
    const { action, data } = response
    switch (action) {
      case 'create':
        createReceiveSlot(data)
        break;
      case 'update':
        updateReceiveSlot(data)
        break;
      case 'destroy':
        destroyReceiveSlot(data)
        break;
      default:
        break;
    }
  }

  const isBusinessOpen = React.useCallback((startDate: Date, endDate: Date) => {
    if (businessHours.length < 1)
      return

    const day = startDate.getDay()
    // TODO: group this so we can get it faster
    const businessHour = businessHours.find((businessHour) => businessHour.day === day)

    if (!businessHour) {
      return false
    }
    const [openHour, openMinute] = businessHour.open_time.split(':')
    const [closeHour, closeMinute] = businessHour.close_time.split(':')
    const openTime = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), +openHour, +openMinute, 0))
    const closeTime = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), +closeHour, +closeMinute, 0))
    return openTime <= startDate && closeTime >= endDate
  }, [businessHours])

  const handleAddReservedSlot = (added: Appointment) => {
    const reservedSlot = {
      reservation_name: added.title,
      start_time: added.startDate.toISOString(),
      end_time: added.endDate.toISOString()
    }
    mutate(async () => {
      return [...reservedSlots, await addReservedSlot(warehouseId, reservedSlot)]
    }, { optimisticData: [...reservedSlots, reservedSlot], rollbackOnError: true, revalidate: false });
  }

  const handleDestroyReservedSlot = (deleted: string) => {
    const index = reservedSlots.findIndex(({ uuid }) => deleted === uuid)
    mutate(async () => {
      return [...reservedSlots, await destroyReservedSlot(warehouseId, deleted)]
    }, { optimisticData: [...reservedSlots.splice(index, 1)], rollbackOnError: true, revalidate: false });
  }

  const handleUpdateReservedSlot = (updated: Appointment) => {
    const id = Object.keys(updated)[0]
    const index = reservedSlots.findIndex(({ uuid }) => uuid === id)
    const reservedSlot = {
      reservation_name: updated[id]?.title || reservedSlots[index].reservation_name,
      start_time: updated[id]?.startDate?.toISOString() || reservedSlots[index].reservation_name.start_time,
      end_time: updated[id]?.endDate?.toISOString() || reservedSlots[index].reservation_name.end_time
    }

    mutate(async () => {
      return [...reservedSlots, await updateReservedSlot(warehouseId, id, reservedSlot)]
    }, { optimisticData: [...reservedSlots.splice(index, 1)], rollbackOnError: true, revalidate: false });
  }

  const [addedAppointment, setAddedAppointment] = React.useState({})
  const [isAppointmentBeingCreated, setIsAppointmentBeingCreated] = React.useState(false)
  const [currentDate, setCurrentDate] = React.useState()
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
      handleAddReservedSlot(added)
    }
    if (changed) {
      handleUpdateReservedSlot(changed)
    }
    if (deleted !== undefined) {
      handleDestroyReservedSlot(deleted)
    }
    setIsAppointmentBeingCreated(false);
  }, [setData, setIsAppointmentBeingCreated, data]);
  const onAddedAppointmentChange = React.useCallback((appointment: any) => {
    setAddedAppointment(appointment);
    setIsAppointmentBeingCreated(true);
  }, []);

  const TimeTableCell = React.useCallback(React.memo(({ onDoubleClick, isShaded, startDate, endDate, ...restProps }) => {
    return (
      <WeekView.TimeTableCell
        {...restProps}
        onDoubleClick={isBusinessOpen(startDate, endDate) ? onDoubleClick : undefined}
        isShaded={!isBusinessOpen(startDate, endDate)}
      />
    )
  }), [allowAdding, businessHours]);

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
      <ActionCableConsumer
        channel={{ channel: 'ReservedSlotsChannel', id: warehouseId }}
        onReceived={handleReceiveSlots}
      />
    </>
  );
};

export default Calendar;