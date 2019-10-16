export function classnames(classObject: {[val: string]: boolean}): string {
  return Object.keys(classObject)
    .filter(name => classObject[name])
    .join(' ');
}
