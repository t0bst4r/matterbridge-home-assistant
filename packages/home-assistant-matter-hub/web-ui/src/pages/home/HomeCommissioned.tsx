import { faAmazon } from '@fortawesome/free-brands-svg-icons/faAmazon';
import { faApple } from '@fortawesome/free-brands-svg-icons/faApple';
import { faGoogle } from '@fortawesome/free-brands-svg-icons/faGoogle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CommissionedStatus } from '@home-assistant-matter-hub/shared-models';
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown';
import { Avatar, Box, ListItemAvatar } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';

export interface HomeCommissionedProps {
  status: CommissionedStatus;
}

const iconPerFabricType: Record<string, ReactNode> = {
  Alexa: <FontAwesomeIcon icon={faAmazon} />,
  Apple: <FontAwesomeIcon icon={faApple} />,
  Google: <FontAwesomeIcon icon={faGoogle} />,
};

export const HomeCommissioned = (props: HomeCommissionedProps) => {
  return (
    <Box p={2}>
      <Typography variant="h5" component="h2">
        Your Hub is already paired with the following controllers:
      </Typography>
      <List>
        {props.status.fabrics.map((fabric) => (
          <ListItem key={fabric.id}>
            <ListItemAvatar>
              <Avatar>{iconPerFabricType[fabric.name] ?? <DeviceUnknownIcon />}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <>
                  <b>{fabric.id}</b> with <b>{fabric.activeSessions}</b> active session
                  {fabric.activeSessions === 1 ? '' : 's'}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
