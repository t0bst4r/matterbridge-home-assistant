import FaqItems from '@home-assistant-matter-hub/documentation/faqs.json';
import { Container } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { MarkdownRenderer } from '../../components/Markdown/MarkdownRenderer.tsx';

export const DocumentationPage = () => {
  return (
    <Container sx={{ mt: 2 }}>
      <Typography variant="h2">Documentation</Typography>
      <Divider />
      <Box sx={{ padding: 1 }}>
        {FaqItems.map((faq) => (
          <MarkdownRenderer key={faq.filePath} content={faq.content} filePath={faq.filePath} />
        ))}
      </Box>
    </Container>
  );
};
