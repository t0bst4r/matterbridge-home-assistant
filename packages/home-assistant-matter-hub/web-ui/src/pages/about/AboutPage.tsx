import readme from '@home-assistant-matter-hub/documentation/readme.json';
import { Container } from '@mui/material';

import { MarkdownRenderer } from '../../components/Markdown/MarkdownRenderer.tsx';

export const AboutPage = () => {
  return (
    <Container>
      <MarkdownRenderer content={readme.content} filePath={readme.filePath} />
    </Container>
  );
};
