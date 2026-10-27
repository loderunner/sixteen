import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { generatePalette, namePalette, type PalettePair } from '@/palette';
import { PaletteProvider } from '@/ui/palette';

import { EditorSection } from './editor-section';

const pairOf = (seed: string): PalettePair => {
  const pair = generatePalette(seed);
  if (pair === undefined) {
    throw new Error(`No palette for ${seed}`);
  }
  return pair;
};

const renderSection = () => {
  const pair = pairOf('#7ab4c8');
  render(
    <PaletteProvider
      value={{
        pair,
        names: namePalette(pair),
        setSeed: vi.fn(),
        variant: 'dark',
        palette: pair.dark,
        swatchNames: undefined,
      }}
    >
      <EditorSection />
    </PaletteProvider>,
  );
};

describe('EditorSection', () => {
  it('starts with the TypeScript sample', () => {
    renderSection();

    expect(
      screen.getByRole('textbox', { name: 'TypeScript code' }),
    ).toHaveDisplayValue(/export class Palette/);
  });

  it('shows the sample of the language picked', async () => {
    renderSection();

    await userEvent.click(screen.getByRole('combobox', { name: 'Language' }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'Python' }),
    );

    expect(
      screen.getByRole('textbox', { name: 'Python code' }),
    ).toHaveDisplayValue(/class Swatch/);
  });

  it('keeps edits per language', async () => {
    renderSection();
    const editor = screen.getByRole('textbox', { name: 'TypeScript code' });

    await userEvent.clear(editor);
    await userEvent.type(editor, 'const answer = 42;');
    await userEvent.click(screen.getByRole('combobox', { name: 'Language' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Go' }));
    await userEvent.click(screen.getByRole('combobox', { name: 'Language' }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'TypeScript' }),
    );

    expect(
      screen.getByRole('textbox', { name: 'TypeScript code' }),
    ).toHaveValue('const answer = 42;');
  });
});
