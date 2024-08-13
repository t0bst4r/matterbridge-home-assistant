import Box from '@mui/material/Box';
import { PropsWithChildren, useState } from 'react';

import { SideNav } from './SideNav.tsx';
import { TopBar } from './TopBar.tsx';

const drawerWidth = 240;

export const Layout = (props: PropsWithChildren) => {
  const [sidenavOpen, setSidenavOpen] = useState(true);
  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
      <TopBar drawerWidth={drawerWidth} drawerIsOpen={sidenavOpen} openDrawer={() => setSidenavOpen(true)} />
      <SideNav width={drawerWidth} open={sidenavOpen} onClose={() => setSidenavOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 6 }}>
        {props.children}
      </Box>
    </Box>
  );
};
