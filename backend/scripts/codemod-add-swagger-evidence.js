/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '..', 'src');

function titleCase(input) {
  return input
    .split(/\s+/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function tagFromFilename(filePath) {
  const base = path.basename(filePath);
  const withoutSuffix = base.replace(/\.controller\.ts$/i, '');
  const words = withoutSuffix.replace(/[._-]+/g, ' ');
  return titleCase(words);
}

async function* walk(dir) {
  const dirHandle = await fs.promises.opendir(dir);
  for await (const dirent of dirHandle) {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* walk(fullPath);
    } else {
      yield fullPath;
    }
  }
}

function ensureSwaggerImport(source, needed) {
  if (needed.length === 0) return source;

  const importRegex = /^import\s*\{([^}]+)\}\s*from\s*['"]@nestjs\/swagger['"];?\s*$/m;
  const match = source.match(importRegex);
  if (match) {
    const existing = match[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const merged = Array.from(new Set([...existing, ...needed])).sort();
    const replacement = `import { ${merged.join(', ')} } from '@nestjs/swagger';`;
    return source.replace(importRegex, replacement);
  }

  // Insert after the last import line (keeps formatting predictable)
  const importLines = source.match(/^import .*$/gm);
  const newImport = `import { ${needed.sort().join(', ')} } from '@nestjs/swagger';`;
  if (!importLines || importLines.length === 0) {
    return `${newImport}\n${source}`;
  }

  const lastImport = importLines[importLines.length - 1];
  const idx = source.lastIndexOf(lastImport);
  const insertAt = idx + lastImport.length;
  return `${source.slice(0, insertAt)}\n${newImport}${source.slice(insertAt)}`;
}

function injectDecorators(source, { tag, addBearer }) {
  const hasApiTags = /@ApiTags\(/.test(source);
  const hasBearer = /@ApiBearerAuth\(/.test(source);

  const needsTags = !hasApiTags;
  const needsBearer = addBearer && !hasBearer;
  if (!needsTags && !needsBearer) return { changed: false, source };

  const controllerDecoratorRegex = /\n\s*@Controller\(/;
  const controllerMatch = source.match(controllerDecoratorRegex);
  if (!controllerMatch) {
    // Not a typical controller file; skip.
    return { changed: false, source };
  }

  const injectLines = [];
  if (needsTags) injectLines.push(`@ApiTags('${tag}')`);
  if (needsBearer) injectLines.push(`@ApiBearerAuth('bearer')`);

  const injectedBlock = `\n${injectLines.join('\n')}\n`;
  const nextSource = source.replace(controllerDecoratorRegex, `${injectedBlock}@Controller(`);
  return { changed: true, source: nextSource };
}

async function run() {
  let scanned = 0;
  let changed = 0;

  for await (const filePath of walk(SRC_DIR)) {
    if (!filePath.endsWith('.controller.ts')) continue;
    if (filePath.endsWith('.controller.spec.ts')) continue;

    scanned += 1;
    const original = await fs.promises.readFile(filePath, 'utf8');

    const usesJwtAuthGuard = /UseGuards\([^\)]*JwtAuthGuard/.test(original);
    const desiredTag = tagFromFilename(filePath);

    const { changed: decoratorChanged, source: withDecorators } = injectDecorators(
      original,
      {
        tag: desiredTag,
        addBearer: usesJwtAuthGuard,
      },
    );

    const neededImports = [];
    if (!/@ApiTags\(/.test(original) && /@ApiTags\(/.test(withDecorators)) {
      neededImports.push('ApiTags');
    }
    if (
      usesJwtAuthGuard &&
      !/@ApiBearerAuth\(/.test(original) &&
      /@ApiBearerAuth\(/.test(withDecorators)
    ) {
      neededImports.push('ApiBearerAuth');
    }

    let updated = withDecorators;
    updated = ensureSwaggerImport(updated, neededImports);

    if (decoratorChanged || updated !== original) {
      await fs.promises.writeFile(filePath, updated, 'utf8');
      changed += 1;
    }
  }

  console.log(`[codemod] scanned=${scanned} changed=${changed}`);
}

run().catch((err) => {
  console.error('[codemod] failed', err);
  process.exit(1);
});
