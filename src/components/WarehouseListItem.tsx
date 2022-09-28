import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import { ActionCableConsumer } from 'react-actioncable-provider'

type Props = {
  warehouse: any
  onClick: () => void
  selectedWarehouseId: number | null
}
const WarehouseListItem: React.FC<Props> = ({ warehouse, onClick, selectedWarehouseId }) => {
  // TODO: Add styling for the selected

  const handleReceiveSlots = (response) => {
    console.log({ response })
  }
  return (
    <>
      <ListItem button alignItems="flex-start" onClick={onClick}>
        <ListItemText
          primary={warehouse?.name}
        />
        <ActionCableConsumer
          channel={{ channel: 'ReservedSlotsChannel', id: 1 }}
          onReceived={handleReceiveSlots}
        />
      </ListItem>
      <Divider component="li" />
    </>
  )
}

export default WarehouseListItem;