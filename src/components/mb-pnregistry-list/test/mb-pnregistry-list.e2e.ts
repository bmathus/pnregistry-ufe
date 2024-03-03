import { newE2EPage } from '@stencil/core/testing';

describe('mb-pnregistry-list', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-pnregistry-list></mb-pnregistry-list>');

    const element = await page.find('mb-pnregistry-list');
    expect(element).toHaveClass('hydrated');
  });
});
