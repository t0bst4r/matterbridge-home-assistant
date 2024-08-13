import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { DrawerProps as MuiDrawerProps } from '@mui/material';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { CSSObject, styled, Theme, useTheme } from '@mui/material/styles';
import React from 'react';
import { Link } from 'react-router-dom';

import { routes } from '../../router.tsx';
import { OptionalTooltip } from '../OptionalTooltip/OptionalTooltip.tsx';

export interface SideNavProps {
  width: number;
  open: boolean;
  onClose?: () => void;
}

export const SideNav = (props: SideNavProps) => {
  const theme = useTheme();

  return (
    <Drawer variant="permanent" open={props.open} width={props.width}>
      <DrawerHeader>
        <IconButton color="inherit" onClick={() => props.onClose?.()}>
          {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      {routes.map((navigationItems, idx) => (
        <React.Fragment key={idx}>
          <List>
            {navigationItems.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ display: 'block' }}>
                <OptionalTooltip title={item.title} enableTooltip={!props.open} placement="right" arrow>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    sx={{
                      minHeight: 48,
                      justifyContent: props.open ? 'initial' : 'center',
                      px: 2.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: props.open ? 3 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      <item.icon />
                    </ListItemIcon>
                    <ListItemText primary={item.title} sx={{ opacity: props.open ? 1 : 0 }} />
                  </ListItemButton>
                </OptionalTooltip>
              </ListItem>
            ))}
          </List>
          <Divider />
        </React.Fragment>
      ))}
    </Drawer>
  );
};

const openedMixin = (theme: Theme, width: number): CSSObject => ({
  width,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface DrawerProps extends MuiDrawerProps {
  width: number;
}

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })<DrawerProps>(
  ({ theme, open, width }) => ({
    width: width,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme, width),
      '& .MuiDrawer-paper': openedMixin(theme, width),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);
