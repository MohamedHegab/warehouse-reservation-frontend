import React from "react";
import { ActionCableConsumer } from "react-actioncable-provider";
import { KeyedMutator } from "swr";

type receivedSlotsType = {
  warehouseId: number;
  reservedSlots: any;
  mutate: KeyedMutator<any>;
};

const ReceivedSlots: React.FC<receivedSlotsType> = ({ warehouseId, reservedSlots, mutate }) => {
  const createReceiveSlot = (response: any) => {
    if (
      reservedSlots.find(
        (reservedSlot: any) =>
          reservedSlot.start_time === response.start_time &&
          reservedSlot.end_time === response.end_time
      )
    )
      return;
    mutate(
      async () => {
        return [...reservedSlots, response];
      },
      { optimisticData: [...reservedSlots, response] }
    );
  };

  const destroyReceiveSlot = (response: any) => {
    const index = reservedSlots.findIndex(
      ({ uuid }: { uuid: string }) => uuid === response.uuid
    );
    if (index > -1) {
      mutate(
        async () => {
          return [...reservedSlots, response];
        },
        { optimisticData: [...reservedSlots.splice(index, 1)] }
      );
    }
  };

  const updateReceiveSlot = (response: any) => {
    if (
      reservedSlots.find(
        (reservedSlot: any) =>
          reservedSlot.start_time === response.start_time &&
          reservedSlot.end_time === response.end_time
      )
    )
      return;
    const index = reservedSlots.findIndex(
      ({ uuid }: { uuid: string }) => uuid === response.uuid
    );
    if (index > -1) {
      mutate(
        async () => {
          return [...reservedSlots.splice(index, 1, response)];
        },
        { optimisticData: [...reservedSlots.splice(index, 1, response)] }
      );
    }
  };

  const handleReceiveSlots = (response: { action: string; data: any }) => {
    const { action, data } = response;
    switch (action) {
      case "create":
        createReceiveSlot(data);
        break;
      case "update":
        updateReceiveSlot(data);
        break;
      case "destroy":
        destroyReceiveSlot(data);
        break;
      default:
        break;
    }
  };

  return (
    <ActionCableConsumer
      channel={{ channel: "ReservedSlotsChannel", id: warehouseId }}
      onReceived={handleReceiveSlots}
    />
  );
};

export default ReceivedSlots;