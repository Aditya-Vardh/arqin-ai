export function isModificationRequest(message: string): boolean {
  const modKeywords = [
    'add', 'remove', 'delete', 'replace', 'introduce', 'connect',
    'change', 'update', 'migrate', 'refactor', 'implement', 'create',
    'insert', 'move', 'rename', 'drop', 'include', 'exclude', 'attach', 'detach'
  ];
  const lower = message.toLowerCase().trim();
  return modKeywords.some(kw => lower.startsWith(kw) || lower.includes(' ' + kw + ' '));
}
