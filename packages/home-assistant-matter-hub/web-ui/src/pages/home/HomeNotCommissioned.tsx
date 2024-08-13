import { NotCommissionedStatus } from '@home-assistant-matter-hub/shared-models';
import { Grid, lighten, Paper } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Commissioning } from '../../components/commissioning/Commissioning.tsx';

export interface HomeNotCommissionedProps {
  status: NotCommissionedStatus;
}

export const HomeNotCommissioned = (props: HomeNotCommissionedProps) => {
  return (
    <Box pt={2}>
      <Paper sx={{ p: 2, backgroundColor: (theme) => lighten(theme.palette.success.main, 0.8) }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4} lg={2} display="flex" justifyContent="center" alignItems="center">
            <Box maxWidth="196px">
              <Commissioning commissioningCode={props.status.commissioningCode} />
            </Box>
          </Grid>
          <Grid item xs={12} md={8} display="flex" flexDirection="column" justifyContent="center">
            <Typography variant="h5" component="h2">
              Your Hub is not paired with any Matter enabled controller.
            </Typography>
            <Typography mt={2}>
              To connect your Hub to Alexa, Apple Home, Google Home or other Matter controllers, you need to open the
              corresponding app and add it as a new Matter-device.
              <br />
              Then you will be asked to scan a QR code or to enter a commissioning code. Please you the QR code or
              commissioning code on this page to connect your controllers.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
