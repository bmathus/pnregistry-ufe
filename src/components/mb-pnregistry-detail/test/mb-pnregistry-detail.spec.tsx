import { newSpecPage } from '@stencil/core/testing';
import { MbPnregistryDetail } from '../mb-pnregistry-detail';

describe('mb-pnregistry-detail', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbPnregistryDetail],
      html: `<mb-pnregistry-detail></mb-pnregistry-detail>`,
    });
    // expect(page.root).toEqualHtml(`
    //   <mb-pnregistry-detail>
    //     <mock:shadow-root>
    //       <slot></slot>
    //     </mock:shadow-root>
    //   </mb-pnregistry-detail>
    // `);
  });
});
