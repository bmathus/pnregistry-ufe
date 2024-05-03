import { newE2EPage } from '@stencil/core/testing';

describe('mb-pnregistry-app', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-pnregistry-app></mb-pnregistry-app>');

    const element = await page.find('mb-pnregistry-app');
    expect(element).toHaveClass('hydrated');
  });
});
