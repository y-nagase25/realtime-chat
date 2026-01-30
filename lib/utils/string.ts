export function trimString(str: string, len: number = 30): string {
  if (str.length > len) {
    return `${str.slice(0, len)}...`;
  }
  return str;
}
