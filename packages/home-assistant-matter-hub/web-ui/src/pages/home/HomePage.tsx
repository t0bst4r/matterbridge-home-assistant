import { Container, Stack } from '@mui/material';

import { HomeCommissioned } from './HomeCommissioned.tsx';
import { HomeNotCommissioned } from './HomeNotCommissioned.tsx';

import { useDevices } from '../../api/devices.ts';
import { useMatterStatus } from '../../api/matter-status.ts';
import { Devices } from '../../components/devices/Devices.tsx';

export const HomePage = () => {
  const [, status] = useMatterStatus();

  const [, devices] = useDevices();

  return (
    <Container>
      <Stack spacing={4}>
        {status &&
          (status.isCommissioned ? <HomeCommissioned status={status} /> : <HomeNotCommissioned status={status} />)}
        {devices && <Devices devices={devices} />}
      </Stack>
    </Container>
  );
};
