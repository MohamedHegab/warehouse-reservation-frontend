import React from "react";
import { EditingState } from "@devexpress/dx-react-scheduler";
import { KeyedMutator } from "swr";

import {
  addReservedSlot,
  destroyReservedSlot,
  updateReservedSlot,
} from "../../services/hooks/useReservedSlots";

type Appointment = {
  title: string;
  startDate: Date;
  endDate: Date;
  id: string;
  location: string;
};

type editingStateComponentType = {
  warehouseId: number;
  reservedSlots: any;
  mutate: KeyedMutator<any>;
  setData: React.Dispatch<React.SetStateAction<Appointment[]>>;
  data: Appointment[];
};

const EditingStateComponent: React.FC<editingStateComponentType> = ({
  reservedSlots,
  mutate,
  warehouseId,
  data,
  setData,
}) => {
  const [addedAppointment, setAddedAppointment] = React.useState({});

  const onAddedAppointmentChange = React.useCallback((appointment: any) => {
    setAddedAppointment(appointment);
  }, []);

  const handleAddReservedSlot = (added: Appointment) => {
    const reservedSlot = {
      reservation_name: added.title,
      start_time: added.startDate.toISOString(),
      end_time: added.endDate.toISOString(),
    };
    mutate(
      async () => {
        return [
          ...reservedSlots,
          await addReservedSlot(warehouseId, reservedSlot),
        ];
      },
      {
        optimisticData: [...reservedSlots, reservedSlot],
        rollbackOnError: true,
        revalidate: false,
      }
    );
  };

  const handleDestroyReservedSlot = (deleted: string) => {
    const index = reservedSlots.findIndex(
      ({ uuid }: { uuid: string }) => deleted === uuid
    );
    mutate(
      async () => {
        return [
          ...reservedSlots,
          await destroyReservedSlot(warehouseId, deleted),
        ];
      },
      {
        optimisticData: [...reservedSlots.splice(index, 1)],
        rollbackOnError: true,
        revalidate: false,
      }
    );
  };

  const handleUpdateReservedSlot = (updated: any) => {
    const id = Object.keys(updated)[0];
    const index = reservedSlots.findIndex(
      ({ uuid }: { uuid: string }) => uuid === id
    );
    const reservedSlot = {
      reservation_name:
        updated[id]?.title || reservedSlots[index].reservation_name,
      start_time:
        updated[id]?.startDate?.toISOString() ||
        reservedSlots[index].reservation_name.start_time,
      end_time:
        updated[id]?.endDate?.toISOString() ||
        reservedSlots[index].reservation_name.end_time,
    };

    mutate(
      async () => {
        return [
          ...reservedSlots,
          await updateReservedSlot(warehouseId, id, reservedSlot),
        ];
      },
      {
        optimisticData: [...reservedSlots.splice(index, 1)],
        rollbackOnError: true,
        revalidate: false,
      }
    );
  };

  const onCommitChanges = React.useCallback(
    ({
      added,
      changed,
      deleted,
    }: {
      added?: any;
      changed?: any;
      deleted?: any;
    }) => {
      if (added) {
        handleAddReservedSlot(added);
      }
      if (changed) {
        handleUpdateReservedSlot(changed);
      }
      if (deleted !== undefined) {
        handleDestroyReservedSlot(deleted);
      }
    },
    [setData, data]
  );

  return (
    <EditingState
      onCommitChanges={onCommitChanges}
      addedAppointment={addedAppointment}
      onAddedAppointmentChange={onAddedAppointmentChange}
    />
  );
};

export default EditingStateComponent;