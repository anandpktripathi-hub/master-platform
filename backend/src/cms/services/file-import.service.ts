import { Injectable } from '@nestjs/common';
import * as unzipper from 'unzipper';
import * as cheerio from 'cheerio';
import { Readable } from 'stream';

@Injectable()
export class FileImportService {
  async processZip(file: any, tenantId: string) {
    // Unzip and parse HTML/CSS/JS
    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);
    const directory = await unzipper.Open.buffer(file.buffer);
    let indexHtml = '';
    let css = '';
    for (const entry of directory.files) {
      if (entry.path.match(/index\.html$/i)) {
        indexHtml = (await entry.buffer()).toString('utf-8');
      }
      if (entry.path.match(/\.css$/i)) {
        css += (await entry.buffer()).toString('utf-8');
      }
    }
    // Parse HTML to extract sections
    const $ = cheerio.load(indexHtml);
    const sections: any[] = [];
    $('section, header, main, footer, div').each((i, el) => {
      const html = $.html(el);
      // Simple heuristic: classify as hero/feature/footer by tag/class
      let type = 'feature';
      const classAttr = $(el).attr('class') || '';
      if (classAttr.match(/hero/i) || $(el).is('header')) type = 'hero';
      if (classAttr.match(/footer/i) || $(el).is('footer')) type = 'footer';
      sections.push({ type, html, column: 1 });
    });
    // Framework detection (simple)
    let framework = 'html';
    if (indexHtml.match(/react/i)) framework = 'react';
    if (indexHtml.match(/vue/i)) framework = 'vue';
    if (indexHtml.match(/angular/i)) framework = 'angular';
    // Return designJson
    return {
      sections,
      framework,
      cleaned: true,
      tenantId,
    };
  }
}
