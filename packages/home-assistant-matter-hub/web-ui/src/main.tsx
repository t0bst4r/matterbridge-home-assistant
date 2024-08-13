import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './index.scss';
import App from './pages/app/App.tsx';
import { informationRoutes, mainRoutes } from './router.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [mainRoutes, informationRoutes].flat().map((route) => ({
      path: route.path,
      Component: route.component,
    })),
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
