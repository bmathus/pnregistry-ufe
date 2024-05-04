import { Component, Host, h, State, EventEmitter, Event } from '@stencil/core';

@Component({
  tag: 'mb-pnregistry-list',
  styleUrl: 'mb-pnregistry-list.css',
  shadow: true,
})
export class MbPnregistryList {
  @Event({ eventName: 'record-clicked' }) recordClicked: EventEmitter<string>;

  @State() expandedPatientId: number | null = null;
  @State() loading: boolean = true;

  pnList: any[];
  @State() pnListByPatient: Map<number, any[]> = new Map();

  async componentWillLoad() {
    this.getPnListAsync();
  }

  private async getPnListAsync() {
    const data = [
      {
        id: 1,
        fullName: 'Matúš Bojko',
        patientId: 1043232,
        employer: 'Apple',
        cause: 'choroba',
        created: new Date(Date.now() - 2 * 86400000),
        validFrom: new Date(Date.now() - 2 * 86400000),
        validUntil: new Date(Date.now() - 3 * 86400000),
        checkUp: new Date(Date.now() - 3 * 86400000),
        checkUpDone: true,
      },
      {
        id: 2,
        fullName: 'Matúš Bojko',
        patientId: 1043232,
        employer: 'Apple',
        cause: 'choroba',
        created: new Date(Date.now() - 2 * 86400000),
        validFrom: new Date(Date.now() - 2 * 86400000),
        validUntil: new Date(Date.now() - 3 * 86400000),
        checkUp: new Date(Date.now() - 3 * 86400000),
        checkUpDone: true,
      },
      {
        id: 3,
        fullName: 'Lucka Bojko',
        patientId: 10432,
        employer: 'Apple',
        cause: 'choroba',
        created: new Date(Date.now() - 2 * 86400000),
        validFrom: new Date(Date.now() - 2 * 86400000),
        validUntil: new Date(Date.now() - 3 * 86400000),
        checkUp: new Date(Date.now() - 3 * 86400000),
        checkUpDone: true,
      },
    ];

    return new Promise((resolve, _) => {
      setTimeout(() => {
        // Simulated data response
        this.pnListByPatient = this.groupByPatientId(data);
        this.loading = false;
        resolve(data);
      }, 2000); // Simulating a delay of 2 seconds
    });
  }

  private groupByPatientId(records) {
    const grouped = new Map();

    records.forEach(record => {
      if (!grouped.has(record.patientId)) {
        // If no entry exists, create one with this record
        grouped.set(record.patientId, [record]);
      } else {
        const recordsList = grouped.get(record.patientId);
        if (record.validFrom > recordsList[0].validFrom) {
          // New record is more recent, so prepend
          recordsList.unshift(record);
        } else {
          // New record is not more recent, so append
          recordsList.push(record);
        }
      }
    });

    return grouped;
  }

  private toggleExpand(patientId: number) {
    this.expandedPatientId = this.expandedPatientId === patientId ? null : patientId;
  }

  render() {
    return (
      <Host>
        <div class="list-header">
          <h3 class="title">Zoznam pacientov a ich PN</h3>
          <md-filled-tonal-button class="add-button" onClick={() => this.recordClicked.emit('@new')}>
            <md-icon slot="icon">add</md-icon>
            Pridať PN
          </md-filled-tonal-button>
        </div>

        {this.loading ? (
          <md-linear-progress indeterminate></md-linear-progress>
        ) : (
          <div>
            {this.pnListByPatient.size === 0 ? (
              <div class="empty-list-info">
                <md-icon class="icon">info</md-icon>
                <h4>V systéme niesu žiadné záznami o PN</h4>
              </div>
            ) : (
              this.renderList()
            )}
          </div>
        )}
      </Host>
    );
  }

  private renderList() {
    return (
      <md-list>
        {Array.from(this.pnListByPatient.entries()).map(([patientId, records]) => (
          <div>
            <md-list-item type="button" class="patient-item" onClick={() => this.toggleExpand(patientId)}>
              <div slot="headline">{records[0].fullName}</div>
              <div slot="supporting-text">{'Najbližšia kontrola: ' + records[0].checkUp.toLocaleDateString('sk-SK')}</div>
              <md-icon slot="start">fingerprint</md-icon>
              <md-icon slot="end">{this.expandedPatientId === patientId ? 'expand_less' : 'expand_more'}</md-icon>
            </md-list-item>

            {this.expandedPatientId === patientId && (
              <div class="pn-item">
                <md-list>
                  {records.map((record, index) => (
                    <md-list-item key={index} type="button" onClick={() => this.recordClicked.emit(record.id)}>
                      <md-icon slot="start">sick</md-icon>
                      <div>PN č. {record.id}</div>
                      <div slot="supporting-text">Stav: trva</div>
                    </md-list-item>
                  ))}
                </md-list>
              </div>
            )}
            <md-divider></md-divider>
          </div>
        ))}
      </md-list>
    );
  }
}
