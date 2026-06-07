import fs from 'fs';

try {
  const content = fs.readFileSync('dist/assets/index-RDnbhztF.js', 'utf8');
  console.log('--- START CHUNK ---');
  console.log(content.substring(435000, 442000));
  console.log('--- END CHUNK ---');
} catch (e: any) {
  console.error(e.message);
}
