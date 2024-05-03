import { newE2EPage } from '@stencil/core/testing';

describe('mb-pnregistry-detail', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-pnregistry-detail></mb-pnregistry-detail>');

    const element = await page.find('mb-pnregistry-detail');
    expect(element).toHaveClass('hydrated');
  });
});
