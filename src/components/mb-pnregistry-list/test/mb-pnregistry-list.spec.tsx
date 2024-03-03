import { newSpecPage } from '@stencil/core/testing';
import { MbPnregistryList } from '../mb-pnregistry-list';

describe('mb-pnregistry-list', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbPnregistryList],
      html: `<mb-pnregistry-list></mb-pnregistry-list>`,
    });
    const wlList = page.rootInstance as MbPnregistryList;
    const expectedPatients = wlList?.waitingPatients?.length;

    const items = page.root.shadowRoot.querySelectorAll('md-list-item');
    expect(items.length).toEqual(expectedPatients);
  });
});
