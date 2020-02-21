import {Suggestion} from '../types';

/**
 * Apply suggestion to code to generate updated code
 * @param code
 * @param suggestion
 */
export function takeSuggestion(code: string, suggestion: Suggestion): string {
  const {simpleReplace, from, to, codeEffect} = suggestion;
  if (codeEffect) {
    return codeEffect(code);
  }
  return simpleReplace ? code.replace(from, to) : code.replace(new RegExp(from, 'g'), to);
}
