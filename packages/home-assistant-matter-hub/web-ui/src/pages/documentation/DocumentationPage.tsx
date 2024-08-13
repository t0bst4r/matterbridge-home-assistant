import Faqs from '@home-assistant-matter-hub/documentation/faqs.json';
import { Container } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Markdown from 'react-markdown';

const faqMarkdown: string = Faqs.map((t) => t.trim()).join('\n\n---\n\n');

export const DocumentationPage = () => {
  return (
    <Container sx={{ mt: 2 }}>
      <Typography variant="h2">Documentation</Typography>
      <Divider />
      <Box sx={{ padding: 1 }}>
        <Markdown
          children={faqMarkdown}
          components={{
            hr() {
              return <Divider />;
            },
          }}
        />
      </Box>
    </Container>
  );
};
