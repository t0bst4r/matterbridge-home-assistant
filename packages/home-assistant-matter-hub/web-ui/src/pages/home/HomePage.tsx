import { Container, Stack } from '@mui/material';

import { HomeCommissioned } from './HomeCommissioned.tsx';
import { HomeNotCommissioned } from './HomeNotCommissioned.tsx';

import { useBridge } from '../../api/bridges.ts';
import { useDevices } from '../../api/devices.ts';
import { Devices } from '../../components/devices/Devices.tsx';

export const HomePage = () => {
  const [, bridge] = useBridge();

  const [, devices] = useDevices();

  return (
    <Container>
      <Stack spacing={4}>
        {bridge &&
          (bridge.fabrics.length > 0 ? <HomeCommissioned bridge={bridge} /> : <HomeNotCommissioned bridge={bridge} />)}
        {devices && <Devices devices={devices} />}
      </Stack>
    </Container>
  );
};
