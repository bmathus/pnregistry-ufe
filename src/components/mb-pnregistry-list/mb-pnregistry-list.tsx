import { Component, Host, h, State, EventEmitter, Event, Prop } from '@stencil/core';
import { PnRegistryRecordsApiFactory, Record } from '../../api/pnregistry';

@Component({
  tag: 'mb-pnregistry-list',
  styleUrl: 'mb-pnregistry-list.css',
  shadow: true,
})
export class MbPnregistryList {
  @Prop() apiBase: string;

  @State() expandedPatientId: string | null = null; //expand patient PN list when clicked
  @State() loading: boolean = true; // loading state when fetching API
  @State() pnRecordsByPatient: Map<string, Record[]> = new Map(); // grouped PN records by patient ID
  @State() errorMessage: string;

  @Event({ eventName: 'record-clicked' }) recordClicked: EventEmitter<string>;

  async componentWillLoad() {
    this.loadPnRecords();
  }

  private async getPnRecordsAsync(): Promise<Record[]> {
    let responseData: Record[] = [];
    this.loading = true;
    try {
      const response = await PnRegistryRecordsApiFactory(undefined, this.apiBase).getRecordAll();

      if (response.status < 299) {
        responseData = response.data ? response.data : [];
      } else {
        const errorResponse = response.data as unknown as ErrorResponse;
        this.errorMessage = `Chyba pri načítaní zoznamu PN záznamov - ${errorResponse?.message || response.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Chyba pri načítaní zoznamu PN záznamov - ${err.response?.status || ''}: ${err.response?.data.message || err.message || 'unknown'}`;
    }
    this.loading = false;

    return responseData;
  }

  private async loadPnRecords() {
    // fetch records from api
    const pnRecords = await this.getPnRecordsAsync();
    // group records by patient id
    this.pnRecordsByPatient = this.groupByPatientId(pnRecords);
  }

  private groupByPatientId(records: Record[]): Map<string, Record[]> {
    const grouped = new Map<string, Record[]>();

    records.forEach(record => {
      if (!grouped.has(record.patientId)) {
        // if no entry exists, create one with this record
        grouped.set(record.patientId, [record]);
      } else {
        const recordsList = grouped.get(record.patientId);
        if (record.validFrom > recordsList[0].validFrom) {
          // New record is more recent, so prepend
          recordsList.unshift(record);
        } else {
          // new record is not more recent, so append
          recordsList.push(record);
        }
      }
    });

    return grouped;
  }

  // expands list of records when patient item clicked
  private toggleExpand(patientId: string) {
    this.expandedPatientId = this.expandedPatientId === patientId ? null : patientId;
  }

  // calculates state of PN record - active or inactive
  private getRecordExpirationState(record: Record): string {
    const validUntil = new Date(record.validUntil).setHours(0, 0, 0, 0);
    const validFrom = new Date(record.validFrom).setHours(0, 0, 0, 0);

    const today = new Date().setHours(0, 0, 0, 0);
    console.log('today', new Date());
    if (today >= validFrom && today <= validUntil) {
      return 'aktívna';
    } else {
      return 'neaktívna';
    }
  }

  render() {
    return (
      <Host>
        <div class="list-header">
          <h3 class="title">Zoznam PN podľa pacientov:</h3>
          <md-filled-tonal-button class="add-button" onClick={() => this.recordClicked.emit('@new')}>
            <md-icon slot="icon">add</md-icon>
            Pridať PN
          </md-filled-tonal-button>
        </div>

        {this.loading ? (
          <md-linear-progress indeterminate></md-linear-progress>
        ) : (
          <div>
            {this.pnRecordsByPatient.size === 0 ? (
              this.errorMessage ? (
                <div class="empty-list-info">
                  <md-icon class="icon">warning</md-icon>
                  <h4>{this.errorMessage}</h4>
                </div>
              ) : (
                <div class="empty-list-info">
                  <md-icon class="icon">info</md-icon>
                  <h4>V systéme niesu žiadne záznamy o PN</h4>
                </div>
              )
            ) : (
              this.renderList()
            )}
          </div>
        )}
      </Host>
    );
  }

  // renders PN list
  private renderList() {
    return (
      <md-list>
        {Array.from(this.pnRecordsByPatient.entries()).map(([patientId, records]) => (
          <div>
            <md-list-item type="button" class="patient-item" onClick={() => this.toggleExpand(patientId)}>
              <div slot="headline">{records[0].fullName}</div>
              <div slot="supporting-text">{'Rodné číslo : ' + records[0].patientId}</div>
              <md-icon slot="start">fingerprint</md-icon>
              <md-icon slot="end">{this.expandedPatientId === patientId ? 'expand_less' : 'expand_more'}</md-icon>
            </md-list-item>

            {this.expandedPatientId === patientId && (
              <div class="pn-list">
                <md-list>
                  {records.map((record, index) => (
                    <md-list-item key={index} type="button" onClick={() => this.recordClicked.emit(record.id)}>
                      <md-icon slot="start">sick</md-icon>
                      <div>PN ID: {record.id}</div>
                      <div slot="supporting-text">
                        Stav: {this.getRecordExpirationState(record) == 'aktívna' ? <span class="active">aktívna</span> : <span class="inactive">neaktívna</span>}
                      </div>
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
