import * as fs from 'node:fs';
import path from 'node:path';

const __dirname = import.meta.dirname;
const repoRoot = path.join(__dirname, '../../..');
const docsSrc = path.join(__dirname, 'docs');
const docsDist = path.join(__dirname, 'dist/docs');

function prepareEnvironment() {
  fs.rmSync(docsDist, { recursive: true, force: true });
  fs.mkdirSync(docsDist, { recursive: true });
}

function getRelativePath(file) {
  return './' + path.relative(repoRoot, file);
}

function buildReadme() {
  const readmePath = path.join(repoRoot, 'README.md');
  const content = fs.readFileSync(readmePath, { encoding: 'utf-8' });
  fs.writeFileSync(
    path.join(docsDist, 'readme.json'),
    JSON.stringify({
      content: content,
      filePath: getRelativePath(readmePath),
    }),
  );
}

function buildFAQs() {
  const faqFiles = fs.readdirSync(path.join(docsSrc, 'faq'), {
    withFileTypes: true,
    recursive: true,
  });

  const faqs = faqFiles
    .filter((file) => file.isFile())
    .map((file) => path.join(file.parentPath, file.name))
    .map((filePath) => {
      return {
        filePath: getRelativePath(filePath),
        content: fs.readFileSync(filePath, { encoding: 'utf-8' }),
      };
    });

  fs.writeFileSync(path.join(docsDist, 'faq.json'), JSON.stringify(faqs));
}

prepareEnvironment();
buildReadme();
buildFAQs();
