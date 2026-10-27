import { type Variant } from '@/palette';

import { cssFile } from './css';
import { type ExportFile, type ExportInput } from './roles';
import { tailwindFile } from './tailwind';
import { textFile } from './text';

export {
  type ExportFile,
  type ExportInput,
  hexByRole,
  ROLE_NAMES,
  type RoleName,
  slugOf,
} from './roles';

/** A file format the palette exports to. */
export type ExportFormat = {
  /** Stable identifier. */
  id: string;
  /** Name shown to the user. */
  name: string;
  /** What the file is for. */
  description: string;
  /** Whether one file holds both variants, or there is one file per variant. */
  variants: 'both' | 'each';
  /** Builds the file; `variant` matters only for `each` formats. */
  build: (input: ExportInput, variant: Variant) => ExportFile;
};

/** Every export format, in the order they are offered. */
export const EXPORT_FORMATS: readonly ExportFormat[] = [
  {
    id: 'css',
    name: 'CSS',
    description:
      'Custom properties for every swatch, and role variables that follow the color scheme.',
    variants: 'both',
    build: cssFile,
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS 4',
    description:
      'Theme colors for every swatch, and role colors like bg-surface-0 that follow the color scheme.',
    variants: 'both',
    build: tailwindFile,
  },
  {
    id: 'text',
    name: 'Text',
    description: 'Both palettes as a plain list of hex values and names.',
    variants: 'both',
    build: textFile,
  },
];
