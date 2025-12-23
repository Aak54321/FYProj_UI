import fs from 'fs/promises';
import path from 'path';

const POSTS_DIR = path.resolve(process.cwd(), 'public', 'posts');
const INDEX_FILE = path.join(POSTS_DIR, 'index.json');

function summaryFromContent(item) {
  if (!item) return '';
  if (item.summary && item.summary.trim()) return item.summary;
  if (item.content && item.content.trim()) return item.content.slice(0, 300).replace(/\n+/g, ' ') + (item.content.length > 300 ? '...' : '');
  return '';
}

async function buildIndex() {
  const names = await fs.readdir(POSTS_DIR);
  const files = names.filter(n => n.endsWith('.json') && n !== 'index.json');

  const items = [];
  for (const file of files) {
    try {
      const txt = await fs.readFile(path.join(POSTS_DIR, file), 'utf8');
      const json = JSON.parse(txt);

      const item = {
        id: json.id || json.slug || path.basename(file, '.json'),
        slug: json.slug || json.id || path.basename(file, '.json'),
        title: json.title || '',
        author: json.author || '',
        score: typeof json.score === 'number' ? json.score : 0,
        summary: summaryFromContent(json),
        url: file,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      items.push(item);
    } catch (err) {
      console.error(`Skipping file ${file}:`, err.message);
    }
  }

  // Sort: first by score desc, then by title
  items.sort((a, b) => (b.score - a.score) || a.title.localeCompare(b.title));

  const index = {
    version: 1,
    generatedAt: new Date().toISOString(),
    items,
  };

  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${INDEX_FILE} with ${items.length} items`);
}

buildIndex().catch(err => {
  console.error(err);
  process.exit(1);
});
