import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Layout } from '../../components/Layout/Layout.tsx';

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#112D4E',
    },
    secondary: {
      main: '#3F72AF',
    },
    background: {
      default: '#F9F7F7',
      paper: '#DBE2EF',
    },
  },
});

function App() {
  const [theme] = useState(defaultTheme);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Outlet />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
