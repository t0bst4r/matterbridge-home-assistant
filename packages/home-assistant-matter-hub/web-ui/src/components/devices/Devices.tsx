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

import { MatterDevice } from '../../../../shared-interfaces/src/models';

export interface DevicesProps {
  devices: MatterDevice[];
}

export const Devices = ({ devices }: DevicesProps) => {
  const sortedDevices = useMemo(() => devices.sort((a, b) => a.friendlyName.localeCompare(b.friendlyName)), [devices]);
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
            <StyledTableRow key={device.entityId} registered={'true'}>
              <TableCell>
                <Tooltip title={capitalize(device.domain)} placement="right">
                  <Box>
                    <DomainIcon domain={device.domain} />
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell>{device.entityId}</TableCell>
              <TableCell>{device.friendlyName}</TableCell>
              <TableCell>{device.deviceType}</TableCell>
              <TableCell>{Object.keys(device.currentState).map(capitalize).join(', ')}</TableCell>
              <TableCell>{JSON.stringify(device.currentState)}</TableCell>
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
