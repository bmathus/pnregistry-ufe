import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'mb-pnregistry-list',
  styleUrl: 'mb-pnregistry-list.css',
  shadow: true,
})
export class MbPnregistryList {
  waitingPatients: any[];

  async componentWillLoad() {
    this.waitingPatients = await this.getPnListAsync();
  }

  private async getPnListAsync() {
    return await Promise.resolve([
      {
        name: 'Jožko Púčik',
        patientId: '10001',
        since: new Date(Date.now() - 10 * 60).toISOString(),
        estimatedStart: new Date(Date.now() + 65 * 60).toISOString(),
        estimatedDurationMinutes: 15,
        condition: 'Kontrola',
      },
      {
        name: 'Bc. August Cézar',
        patientId: '10096',
        since: new Date(Date.now() - 30 * 60).toISOString(),
        estimatedStart: new Date(Date.now() + 30 * 60).toISOString(),
        estimatedDurationMinutes: 20,
        condition: 'Teploty',
      },
      {
        name: 'Ing. Ferdinand Trety',
        patientId: '10028',
        since: new Date(Date.now() - 72 * 60).toISOString(),
        estimatedStart: new Date(Date.now() + 5 * 60).toISOString(),
        estimatedDurationMinutes: 15,
        condition: 'Bolesti hrdla',
      },
    ]);
  }

  private isoDateToLocale(iso: string) {
    if (!iso) return '';
    return new Date(Date.parse(iso)).toLocaleTimeString();
  }

  render() {
    return (
      <Host>
        <h3>Evidenčný systém PN</h3>
        <md-divider></md-divider>
        <md-tabs>
          <md-secondary-tab>
            <md-icon slot="icon">flight</md-icon>
            Aktívne
          </md-secondary-tab>
          <md-secondary-tab>
            <md-icon slot="icon">hotel</md-icon>
            Neaktívne
          </md-secondary-tab>
          <md-secondary-tab>
            <md-icon slot="icon">hiking</md-icon>
            Všetky
          </md-secondary-tab>
        </md-tabs>
        <md-list>
          {this.waitingPatients.map(patient => (
            <md-list-item>
              <div slot="headline">{patient.name}</div>
              <div slot="supporting-text">{'Predpokladaný vstup: ' + this.isoDateToLocale(patient.estimatedStart)}</div>
              <md-icon slot="start">person</md-icon>
            </md-list-item>
          ))}
        </md-list>
      </Host>
    );
  }
}
