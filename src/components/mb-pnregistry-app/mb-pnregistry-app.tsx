import { Component, Host, Prop, State, h } from '@stencil/core';

declare global {
  interface Window {
    navigation: any;
  }
}

@Component({
  tag: 'mb-pnregistry-app',
  styleUrl: 'mb-pnregistry-app.css',
  shadow: true,
})
export class MbPnregistryApp {
  @State() private relativePath = '';
  @Prop() basePath: string = '';

  componentWillLoad() {
    const baseUri = new URL(this.basePath, document.baseURI || '/').pathname;

    const toRelative = (path: string) => {
      if (path.startsWith(baseUri)) {
        this.relativePath = path.slice(baseUri.length);
      } else {
        this.relativePath = '';
      }
      console.log('This is relative:', this.relativePath);
    };

    window.navigation?.addEventListener('navigate', (ev: Event) => {
      if ((ev as any).canIntercept) {
        (ev as any).intercept();
      }
      let path = new URL((ev as any).destination.url).pathname;
      toRelative(path);
    });

    toRelative(location.pathname);
  }

  render() {
    let element = 'list';
    let entryId = '@new';

    if (this.relativePath.startsWith('entry/')) {
      element = 'editor';
      entryId = this.relativePath.split('/')[1];
      console.log('Entry id:', entryId);
    }

    const navigate = (path: string) => {
      const absolute = new URL(path, new URL(this.basePath, document.baseURI)).pathname;
      window.navigation.navigate(absolute);
    };

    return (
      <Host>
        <h2>Evidenčný systém PN</h2>
        <md-divider></md-divider>
        <div class="app-content">
          {element === 'editor' ? (
            <mb-pnregistry-detail entry-id={entryId} oneditor-closed={() => navigate('./list')}></mb-pnregistry-detail>
          ) : (
            <mb-pnregistry-list></mb-pnregistry-list>
          )}
        </div>
      </Host>
    );
  }
}