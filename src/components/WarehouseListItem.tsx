import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';

type Props = {
  warehouse: any
  onClick: () => void
  selectedWarehouseId: number | null
}
const WarehouseListItem: React.FC<Props> = ({ warehouse, onClick, selectedWarehouseId }) => {
  return (
    <>
      <ListItem
        button
        alignItems="flex-start"
        onClick={onClick}
        selected={selectedWarehouseId === warehouse.id}
      >
        <ListItemText
          primary={warehouse?.name}
        />
      </ListItem>
      <Divider component="li" />
    </>
  )
}

export default WarehouseListItem;