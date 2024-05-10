import { newSpecPage } from '@stencil/core/testing';
import { MbPnregistryList } from '../mb-pnregistry-list';

describe('mb-pnregistry-list', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbPnregistryList],
      html: `<mb-pnregistry-list></mb-pnregistry-list>`,
    });
    const pnRegistryList = page.rootInstance as MbPnregistryList;
    const pacientList = Array.from(pnRegistryList?.pnRecordsByPatient);

    const items = page.root.shadowRoot.querySelectorAll('md-list-item');
    expect(items.length).toEqual(pacientList.length);
  });
});
