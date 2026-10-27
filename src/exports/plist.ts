/** A value a property list can hold. */
export type PlistValue = string | number | PlistValue[] | PlistDict;

/** A property list dictionary. */
export type PlistDict = { [key: string]: PlistValue };

const escapeXML = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const render = (value: PlistValue, indent: string): string[] => {
  const inner = `${indent}\t`;
  if (typeof value === 'string') {
    return [`${indent}<string>${escapeXML(value)}</string>`];
  }
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? [`${indent}<integer>${value}</integer>`]
      : [`${indent}<real>${value}</real>`];
  }
  if (Array.isArray(value)) {
    return [
      `${indent}<array>`,
      ...value.flatMap((item) => render(item, inner)),
      `${indent}</array>`,
    ];
  }
  return [
    `${indent}<dict>`,
    ...Object.entries(value).flatMap(([key, item]) => [
      `${inner}<key>${escapeXML(key)}</key>`,
      ...render(item, inner),
    ]),
    `${indent}</dict>`,
  ];
};

/**
 * An XML property list, as TextMate, Sublime Text and iTerm2 read them.
 *
 * @param root - The top-level dictionary.
 */
export function plist(root: PlistDict): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    ...render(root, ''),
    '</plist>',
    '',
  ].join('\n');
}
