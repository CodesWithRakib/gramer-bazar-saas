import { describe, it, expect } from 'vitest';
import {
  buildVariableDefinitions,
  extractVariableKeys,
  findMissingVariables,
  hasInvalidVariableSyntax,
  renderTemplate,
} from './template-renderer.js';

describe('template-renderer', () => {
  it('extracts unique variable keys in first-seen order', () => {
    const body = 'Hello {{customer_name}}, {{shop_name}} has {{discount}}% off today {{customer_name}}.';
    expect(extractVariableKeys(body)).toEqual(['customer_name', 'shop_name', 'discount']);
  });

  it('supports whitespace inside mustaches', () => {
    expect(extractVariableKeys('Hi {{ customer_name }}')).toEqual(['customer_name']);
  });

  it('renders known variables and leaves unknown placeholders untouched', () => {
    const rendered = renderTemplate('Hi {{customer_name}}, code {{code}}', {
      customer_name: 'Rakib',
    });
    expect(rendered).toBe('Hi Rakib, code {{code}}');
  });

  it('reports missing variables', () => {
    expect(
      findMissingVariables('Hi {{a}} {{b}}', { a: 'x' }),
    ).toEqual(['b']);
  });

  it('builds structured variable definitions preserving existing metadata', () => {
    const definitions = buildVariableDefinitions('Hi {{a}} {{b}}', [
      { key: 'a', label: 'A', example: '1', required: true },
    ]);
    expect(definitions).toEqual([
      { key: 'a', label: 'A', example: '1', required: true },
      { key: 'b', label: null, example: null, required: true },
    ]);
  });

  it('detects malformed variable syntax', () => {
    expect(hasInvalidVariableSyntax('Hi {{customer_name}}')).toBe(false);
    expect(hasInvalidVariableSyntax('Hi {{customer_name}} and {{broken')).toBe(true);
  });
});
