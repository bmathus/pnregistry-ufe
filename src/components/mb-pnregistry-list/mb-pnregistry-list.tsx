import { Component, Host, h, State } from '@stencil/core';

@Component({
  tag: 'mb-pnregistry-list',
  styleUrl: 'mb-pnregistry-list.css',
  shadow: true,
})
export class MbPnregistryList {
  @State() selectedChip: string = 'all'; // Default selected chip

  waitingPatients: any[];

  async componentWillLoad() {
    this.waitingPatients = await this.getPnListAsync();
  }

  private async getPnListAsync() {
    return await Promise.resolve([
      {
        name: 'Matúš Bojko',
        patientId: '10001',
        since: new Date(Date.now() - 3 * 86400000),
        condition: 'Kontrola',
      },
      {
        name: 'Bc. August Cézar',
        patientId: '10096',
        since: new Date(Date.now() - 5 * 86400000),
        condition: 'Teploty',
      },
      {
        name: 'Ing. Ferdinand Trety',
        patientId: '10028',
        since: new Date(Date.now() - 10 * 86400000),
        condition: 'Bolesti hrdla',
      },
    ]);
  }

  private chipClicked(chipLabel: string) {
    this.selectedChip = chipLabel;
  }

  render() {
    return (
      <Host>
        <h2>Evidenčný systém PN</h2>
        <md-divider></md-divider>
        <div class="list-header">
          <md-chip-set>
            <md-filter-chip class="filter-chips-item" label="Všetky" onClick={() => this.chipClicked('all')} selected={this.selectedChip === 'all'}></md-filter-chip>
            <md-filter-chip class="filter-chips-item" label="Aktívne" onClick={() => this.chipClicked('active')} selected={this.selectedChip === 'active'}></md-filter-chip>
            <md-filter-chip class="filter-chips-item" label="Neaktívne" onClick={() => this.chipClicked('inactive')} selected={this.selectedChip === 'inactive'}></md-filter-chip>
          </md-chip-set>
          <md-filled-tonal-button class="add-pn-button">
            <md-icon slot="icon">add</md-icon>
            Pridať PN
          </md-filled-tonal-button>
        </div>

        <md-list>
          {this.waitingPatients.map(patient => (
            <md-list-item type="button">
              <div slot="headline">{patient.name}</div>
              <div slot="supporting-text">
                <p class="item">{'Začiatok: ' + patient.since.toLocaleDateString('sk-SK')}</p>
              </div>
              <md-icon slot="start">sick</md-icon>
              <md-icon slot="end">navigate_next</md-icon>
            </md-list-item>
          ))}
        </md-list>
      </Host>
    );
  }
}
