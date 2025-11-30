const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src');
const PATTERN = /\.Value\s*-replace\b/;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.isFile() && full.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

function scanFiles(fix = false) {
  if (!fs.existsSync(ROOT)) {
    console.error(`Root not found: ${ROOT}`);
    process.exit(1);
  }
  const files = walk(ROOT);
  let totalMatches = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    const matches = [];
    lines.forEach((ln, idx) => {
      if (PATTERN.test(ln)) matches.push(idx);
    });
    if (matches.length) {
      totalMatches += matches.length;
      console.log(`\nFile: ${file}`);
      matches.forEach((idx) => {
        console.log(`  Line ${idx + 1}: ${lines[idx].trim()}`);
      });
      if (fix) {
        const bak = `${file}.bak`;
        if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);
        const newLines = lines.filter((_, idx) => !matches.includes(idx));
        fs.writeFileSync(file, newLines.join('\n'), 'utf8');
        console.log(`  -> Fixed: backup saved to ${bak}, ${matches.length} line(s) removed.`);
      }
    }
  }
  if (totalMatches === 0) {
    console.log('No corruption patterns found.');
  } else {
    console.log(`\nTotal matched lines: ${totalMatches}`);
  }
}

// CLI
const args = process.argv.slice(2);
const doFix = args.includes('--fix');
console.log(`Scanning ${ROOT} for corruption pattern ".Value -replace" (fix=${doFix})`);
scanFiles(doFix);
if (!doFix) {
  console.log('\nTo attempt automatic removal of matching lines run:');
  console.log('  node ./scripts/scan-and-fix-corruption.js --fix');
  console.log('Backups will be created with .bak extension.');
}
