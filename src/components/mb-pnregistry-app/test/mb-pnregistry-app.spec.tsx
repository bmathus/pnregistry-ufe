import { newSpecPage } from '@stencil/core/testing';
import { MbPnregistryApp } from '../mb-pnregistry-app';

describe('mb-pnregistry-app', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbPnregistryApp],
      html: `<mb-pnregistry-app></mb-pnregistry-app>`,
    });
    expect(page.root);
  });
});
