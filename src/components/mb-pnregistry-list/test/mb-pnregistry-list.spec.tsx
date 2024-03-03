import { newSpecPage } from '@stencil/core/testing';
import { MbPnregistryList } from '../mb-pnregistry-list';

describe('mb-pnregistry-list', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbPnregistryList],
      html: `<mb-pnregistry-list></mb-pnregistry-list>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-pnregistry-list>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-pnregistry-list>
    `);
  });
});
