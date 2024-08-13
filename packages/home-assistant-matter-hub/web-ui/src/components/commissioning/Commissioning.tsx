import Box from '@mui/material/Box';
import QRCode from 'react-qr-code';

export interface CommissioningProps {
  commissioningCode: string;
}

export const Commissioning = (props: CommissioningProps) => {
  return (
    <Box p={2}>
      <QRCode value={props.commissioningCode} style={{ width: '100%', height: 'auto' }} />
    </Box>
  );
};
