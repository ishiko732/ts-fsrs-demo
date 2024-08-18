import { Note } from '@prisma/client';
import defaultTemplate from './default';
import type { ITemplate } from './types';

const templates: { [key: string]: ITemplate } = {
  default: defaultTemplate,
};

export class TemplateProvider {
  static getTemplate(source: string) {
    const template = templates[source];
    return template ?? defaultTemplate;
  }
}
