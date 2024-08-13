import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { dirname, join } from 'path-browserify';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export interface MarkdownRendererProps {
  content: string;
  filePath?: string;
}

const repoUrl = 'https://github.com/t0bst4r/matterbridge-home-assistant/blob/main/';

function resolveUrl(url: string | undefined, srcFilePath: string): string | undefined {
  if (url) {
    if (url.startsWith('./') || url.startsWith('../')) {
      return join(repoUrl, dirname(srcFilePath), url);
    }
  }
  return url;
}

export const MarkdownRenderer = ({ content, filePath }: MarkdownRendererProps) => {
  return (
    <Markdown
      children={content}
      rehypePlugins={[rehypeRaw]}
      components={{
        h1({ children }) {
          return (
            <Typography variant="h4" component="h2">
              {children}
            </Typography>
          );
        },
        hr() {
          return <Divider />;
        },
        a({ href, children }) {
          return (
            <Link href={resolveUrl(href, filePath ?? '.')} target="_blank">
              {children}
            </Link>
          );
        },
        img({ src, alt }) {
          return (
            <img
              style={{ whiteSpace: 'pre' }}
              alt={alt?.replace(/<br\s*\/?>/g, '\n')}
              src={resolveUrl(src, filePath ?? './File.md')}
            />
          );
        },
      }}
    />
  );
};
