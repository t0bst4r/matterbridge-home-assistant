import { QrCode } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import MuiAppBar from '@mui/material/AppBar';
import { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
  drawerwidth: number;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open, drawerwidth }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerwidth,
    width: `calc(100% - ${drawerwidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export interface TopBarProps {
  drawerWidth: number;
  drawerIsOpen: boolean;
  openDrawer?: () => void;
}

export const TopBar = (props: TopBarProps) => {
  return (
    <AppBar drawerwidth={props.drawerWidth} position="fixed" open={props.drawerIsOpen}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={props.openDrawer}
          edge="start"
          sx={{
            marginRight: 5,
            ...(props.drawerIsOpen && { display: 'none' }),
          }}
        >
          <MenuIcon />
        </IconButton>
        <IconButton color="inherit">
          <QrCode />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          Home Assistant Matter Hub
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
