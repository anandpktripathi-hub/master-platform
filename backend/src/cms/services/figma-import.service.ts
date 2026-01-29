import { Injectable, HttpException } from '@nestjs/common';
import { Client as FigmaClient } from 'figma-js';

@Injectable()
export class FigmaImportService {
  async fetchFigmaFile(figmaUrl: string, accessToken: string) {
    const fileKey = this.extractFileKey(figmaUrl);
    if (!fileKey) throw new HttpException('Invalid Figma URL', 400);
    const client = FigmaClient({ personalAccessToken: accessToken });
    const file = await client.file(fileKey);
    return file.data;
  }

  extractFileKey(url: string): string | null {
    const match = url.match(/figma.com\/file\/([a-zA-Z0-9]+)[/?]/);
    return match ? match[1] : null;
  }

  parseLayers(figmaData: any) {
    // Map Figma frames to PageBuilder sections
    const sections: any[] = [];
    const traverse = (node: any, column = 1) => {
      if (node.type === 'FRAME') {
        const section: any = {
          type: this.layerToSectionMapping(node),
          children: [],
          column,
          responsive: true,
        };
        if (node.children) {
          for (const child of node.children) {
            section.children.push(this.parseLayer(child));
          }
        }
        sections.push(section);
      } else if (node.children) {
        for (const child of node.children) traverse(child, column);
      }
    };
    traverse(figmaData.document);
    return sections;
  }

  parseLayer(node: any): any {
    if (node.type === 'TEXT') {
      return {
        type: 'text',
        content: node.characters,
        font:
          node.style?.fontFamily +
          (node.style?.fontWeight ? ' ' + node.style.fontWeight : ''),
      };
    }
    if (node.type === 'RECTANGLE' && node.fills?.[0]?.type === 'IMAGE') {
      return {
        type: 'image',
        url: node.fills[0].imageRef || node.fills[0].imageHash,
      };
    }
    // Add more mappings as needed
    return { type: node.type.toLowerCase(), name: node.name };
  }

  layerToSectionMapping(node: any): string {
    const name = node.name.toLowerCase();
    if (name.includes('hero')) return 'hero';
    if (name.includes('footer')) return 'footer';
    if (name.includes('feature')) return 'feature';
    return 'section';
  }
}
