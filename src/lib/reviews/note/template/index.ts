import defaultTemplate from './default';
import lingqTemplate from './lingq';
import progeigoTemplate from './progeigo';
import type { ITemplate } from './types';

const templates: { [key: string]: ITemplate } = {
  default: defaultTemplate,
  ProgeigoNote: progeigoTemplate,
  lingq: lingqTemplate,
};

export class TemplateProvider {
  static getTemplate(source: string) {
    const template = templates[source];
    return template ?? defaultTemplate;
  }
}
