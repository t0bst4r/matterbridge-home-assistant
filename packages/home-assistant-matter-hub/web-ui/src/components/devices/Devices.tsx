import { MatterDevice } from '@home-assistant-matter-hub/shared-models';
import MobileOffIcon from '@mui/icons-material/MobileOff';
import {
  Box,
  capitalize,
  lighten,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableRowProps,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useMemo } from 'react';

import { DomainIcon } from './DomainIcon.tsx';

export interface DevicesProps {
  devices: MatterDevice[];
}

export const Devices = ({ devices }: DevicesProps) => {
  const sortedDevices = useMemo(() => devices.sort((a, b) => (a.registered ? -1 : b.registered ? 1 : 0)), [devices]);
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell aria-label="Domain"></TableCell>
            <TableCell>Entity Id</TableCell>
            <TableCell>Device Name</TableCell>
            <TableCell>Device Type</TableCell>
            <TableCell>Cluster Servers</TableCell>
            <TableCell>Current State</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedDevices.map((device) => (
            <StyledTableRow key={device.entityId} registered={`${device.registered}`}>
              <TableCell>
                <Tooltip
                  title={device.registered ? capitalize(device.domain) : device.comments.map(capitalize).join(', ')}
                  placement="right"
                >
                  <Box>{device.registered ? <DomainIcon domain={device.domain} /> : <MobileOffIcon />}</Box>
                </Tooltip>
              </TableCell>
              <TableCell>{device.entityId}</TableCell>
              <TableCell>{device.friendlyName}</TableCell>
              <TableCell>{device.registered && device.deviceType}</TableCell>
              <TableCell>{device.registered && Object.keys(device.currentState).map(capitalize).join(', ')}</TableCell>
              <TableCell>{device.registered && JSON.stringify(device.currentState)}</TableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface StyledTableRowProps extends TableRowProps {
  registered: `${boolean}`;
}

const StyledTableRow = styled(TableRow)<StyledTableRowProps>(({ theme, registered }) => ({
  backgroundColor: registered === 'false' ? theme.palette.grey['200'] : undefined,
  td: {
    color: registered === 'false' ? theme.palette.grey['400'] : undefined,
  },
  ':hover': {
    backgroundColor: registered === 'true' ? lighten(theme.palette.primary.main, 0.95) : undefined,
  },
  ':hover td': {
    color: registered === 'false' ? theme.palette.grey['700'] : undefined,
  },
}));
