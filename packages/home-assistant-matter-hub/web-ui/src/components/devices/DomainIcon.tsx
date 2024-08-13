import AirIcon from '@mui/icons-material/Air';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BlindsIcon from '@mui/icons-material/Blinds';
import CodeIcon from '@mui/icons-material/Code';
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown';
import FlakyIcon from '@mui/icons-material/Flaky';
import FluorescentIcon from '@mui/icons-material/Fluorescent';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LockIcon from '@mui/icons-material/Lock';
import RadioIcon from '@mui/icons-material/Radio';
import SensorsIcon from '@mui/icons-material/Sensors';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { ReactNode } from 'react';

enum EntityDomain {
  automation = 'automation',
  binary_sensor = 'binary_sensor',
  cover = 'cover',
  input_boolean = 'input_boolean',
  light = 'light',
  lock = 'lock',
  media_player = 'media_player',
  scene = 'scene',
  script = 'script',
  switch = 'switch',
  fan = 'fan',
}

const iconPerDomain: Record<EntityDomain, ReactNode> = {
  [EntityDomain.automation]: <AutoAwesomeIcon />,
  [EntityDomain.binary_sensor]: <SensorsIcon />,
  [EntityDomain.cover]: <BlindsIcon />,
  [EntityDomain.input_boolean]: <FlakyIcon />,
  [EntityDomain.light]: <LightbulbIcon />,
  [EntityDomain.lock]: <LockIcon />,
  [EntityDomain.media_player]: <RadioIcon />,
  [EntityDomain.scene]: <FluorescentIcon />,
  [EntityDomain.script]: <CodeIcon />,
  [EntityDomain.switch]: <ToggleOnIcon />,
  [EntityDomain.fan]: <AirIcon />,
};

export interface DomainIconProps {
  domain: string;
}

export const DomainIcon = ({ domain }: DomainIconProps) => {
  return iconPerDomain[domain as EntityDomain] ?? <DeviceUnknownIcon />;
};
