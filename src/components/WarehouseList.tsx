import WarehouseListItem from './WarehouseListItem';
import useWarehouses from '../services/hooks/useWarehouses';
import List from '@mui/material/List';
import { Box, Paper } from '@mui/material';
import Calendar from './Calendar';
import { useEffect, useState } from 'react';
import useBusinessHours from '../services/hooks/useBusinessHours';

const WarehouseList = () => {
  const { warehouses, isLoading, isError } = useWarehouses();
  const [warehouseId, setWarehouseId] = useState<number>(0)
  const { businessHours, isLoading: isBusinessHoursLoading, isError: isBusinessHoursError } = useBusinessHours(warehouseId);

  useEffect(() => {
    if (warehouses) {
      setWarehouseId(warehouses?.[0]?.id)
    }
  }, [warehouses])

  if (isError)
    return (
      <div>Unable to fetch warehouses.</div>
    );

  if (isLoading)
    return (
      <div>Loading warehouses...</div>
    );

  return (
    <Paper elevation={5} sx={{ display: 'flex' }}>
      <List sx={{ flexBasis: 0, flexGrow: 1 }}>
        {
          warehouses.map((warehouse: any) => (
            <WarehouseListItem warehouse={warehouse} key={warehouse.id} selectedWarehouseId={warehouseId} onClick={() => setWarehouseId(warehouse.id)} />
          ))
        }
      </List>
      <Box sx={{ flexBasis: 0, flexGrow: 1 }}>
        {!isBusinessHoursLoading &&
          <Calendar warehouseId={warehouseId} businessHours={businessHours} />
        }
      </Box>
    </Paper>
  );
}

export default WarehouseList;