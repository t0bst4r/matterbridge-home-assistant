import { Tooltip, TooltipProps } from '@mui/material';
import { useMemo } from 'react';

export interface OptionalTooltip extends TooltipProps {
  enableTooltip?: boolean;
}

export const OptionalTooltip = (props: OptionalTooltip) => {
  const clonedProps: TooltipProps = useMemo(() => {
    return Object.fromEntries(Object.entries(props).filter(([key]) => key !== 'enableTooltip')) as TooltipProps;
  }, [props]);
  if (props.enableTooltip) {
    return <Tooltip {...clonedProps} children={props.children} />;
  } else {
    return <>{props.children}</>;
  }
};
