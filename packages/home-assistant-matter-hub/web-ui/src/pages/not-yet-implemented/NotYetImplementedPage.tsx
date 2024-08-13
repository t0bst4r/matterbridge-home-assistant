import { Box, Container, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';

import UnderConstruction from '../../assets/undraw_under_construction_-46-pa.svg';

export interface NotYetImplementedPageProps {
  title: string;
}

export const NotYetImplementedPage = (props: NotYetImplementedPageProps) => {
  return (
    <Container
      sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}
    >
      <Stack direction="column" spacing={4}>
        <Typography variant="h3" component="h2" align="center">
          {props.title}
        </Typography>

        <Typography variant="subtitle1" component="p" align="center">
          This page is not yet implemented. Come back later to check it out.
        </Typography>

        <Box>
          <img src={UnderConstruction} alt="Under Construction" style={{ width: '100%', maxWidth: '500px' }} />
        </Box>
      </Stack>
    </Container>
  );
};
