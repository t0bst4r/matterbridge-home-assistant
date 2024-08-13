import BalanceIcon from '@mui/icons-material/Balance';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import SettingsIcon from '@mui/icons-material/Settings';
import { ComponentType, FunctionComponent } from 'react';

import { DocumentationPage } from './pages/documentation/DocumentationPage.tsx';
import { HomePage } from './pages/home/HomePage.tsx';
import { NotYetImplementedPage } from './pages/not-yet-implemented/NotYetImplementedPage.tsx';

export interface Route {
  icon: FunctionComponent;
  title: string;
  path: string;
  component?: ComponentType;
}

export const routes: Route[][] = [
  [
    { icon: () => <HomeIcon />, title: 'Home', path: '/', component: () => <HomePage /> },
    {
      icon: () => <SettingsIcon />,
      title: 'Configuration',
      path: '/configuration',
      component: () => <NotYetImplementedPage title="Configuration" />,
    },
    {
      icon: () => <LiveHelpIcon />,
      title: 'Documentation',
      path: '/documentation',
      component: () => <DocumentationPage />,
    },
  ],
  [
    {
      icon: () => <InfoIcon />,
      title: 'About',
      path: '/about',
      component: () => <NotYetImplementedPage title="About" />,
    },
    {
      icon: () => <BalanceIcon />,
      title: 'Licenses',
      path: '/licenses',
      component: () => <NotYetImplementedPage title="Licenses" />,
    },
  ],
];
