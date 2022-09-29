export type BusinessHour = {
  id: number;
  day: number;
  open_time: string;
  close_time: string;
}

export type ReservedSlot = {
  reservation_name: string,
  start_time: string,
  end_time: string,
  uuid?: string,
  allDay?: boolean
}
