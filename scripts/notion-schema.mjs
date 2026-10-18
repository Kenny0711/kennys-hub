const token = process.env.NOTION_TOKEN;
const sourceId = process.env.NOTION_DATA_SOURCE_ID;
if (!token || !sourceId) {
  console.error('Set NOTION_TOKEN and NOTION_DATA_SOURCE_ID first.');
  process.exit(1);
}

const url = `https://api.notion.com/v1/data_sources/${sourceId}`;
const headers = {
  Authorization: `Bearer ${token}`,
  'Notion-Version': '2026-03-11',
  'Content-Type': 'application/json',
};
const response = await fetch(url, { headers });
if (!response.ok) throw new Error(`Notion schema read failed (${response.status})`);
const source = await response.json();
const existing = source.properties?.['LeetCode ID'];
if (existing) {
  if (existing.type !== 'number') throw new Error('LeetCode ID exists but is not a Number property.');
  console.log('LeetCode ID Number property already exists. No change needed.');
  process.exit(0);
}
console.log('Dry-run: would add one Number property, LeetCode ID, to the existing data source.');
if (!process.argv.includes('--apply')) process.exit(0);
if (!process.argv.includes('--confirm=ADD_LEETCODE_ID')) {
  throw new Error('Apply requires --confirm=ADD_LEETCODE_ID');
}
const update = await fetch(url, {
  method: 'PATCH', headers,
  body: JSON.stringify({ properties: { 'LeetCode ID': { number: { format: 'number' } } } }),
});
if (!update.ok) throw new Error(`Notion schema update failed (${update.status})`);
console.log('Added LeetCode ID. Existing pages, views and other properties were not changed.');
