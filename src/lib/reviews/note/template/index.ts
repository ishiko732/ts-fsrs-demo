import defaultTemplate from './default';
import lingqTemplate from './lingq';
import progeigoTemplate from './progeigo';
import type { ITemplate } from './types';

const templates: { [key: string]: ITemplate } = {
  default: defaultTemplate,
  ProgeigoNote: progeigoTemplate,
  lingq: lingqTemplate,
};

export function TemplateProvider(source: string) {
  return templates[source] ?? defaultTemplate;
}
