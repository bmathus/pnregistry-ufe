import { Component, Host, h, Prop, EventEmitter, Event, State } from '@stencil/core';
import { Record, PnRegistryRecordsApiFactory } from '../../api/pnregistry';

interface ErrorResponse {
  error?: string;
  message: string;
  status: number;
}

@Component({
  tag: 'mb-pnregistry-detail',
  styleUrl: 'mb-pnregistry-detail.css',
  shadow: true,
})
export class MbPnregistryDetail {
  @Prop() recordId: string;
  @Prop() apiBase: string;

  @State() record: Record;
  @State() isDialogOpen: boolean = false; // Track the state of the dialog
  @State() loading: boolean = false;
  @State() responseMessage: string;

  @State() isValid: boolean = false;
  @State() newPacient: boolean;

  private patientForm: HTMLFormElement;
  private detailForm: HTMLFormElement;
  private responseSuccess: boolean = false;

  @Event({ eventName: 'detail-closed' }) detailClosed: EventEmitter<string>;

  // Function to open the dialog
  private openDialog() {
    this.isDialogOpen = true;
  }

  // Function to close the dialog
  private closeDialog() {
    this.isDialogOpen = false;
  }

  async componentWillLoad() {
    this.getPnRecordAsync();
  }

  private createEmptyRecord() {
    this.record = {
      id: '@new',
      patientId: '',
      employer: '',
      reason: '',
      issued: new Date().toISOString().split('T')[0],
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: this.createIsoDateAfterWeek(),
    };
  }

  private createIsoDateAfterWeek() {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split('T')[0];
  }

  private async getPnRecordAsync() {
    if (this.recordId === '@new') {
      this.isValid = false;
      this.createEmptyRecord();
      return;
    }
    if (!this.recordId) {
      this.isValid = false;
      return;
    }
    this.loading = true;
    this.responseMessage = '';
    try {
      const response = await PnRegistryRecordsApiFactory(undefined, this.apiBase).getRecord(this.recordId);

      if (response.status < 299) {
        this.record = response.data;
        //this.isValid = true;
      } else {
        const errorResponse = response.data as unknown as ErrorResponse;
        this.responseMessage = `Chyba pri načítaní PN záznamu: ${errorResponse?.message || response.statusText}`;
      }
    } catch (err: any) {
      this.responseMessage = `Chyba pri načítaní PN záznamu - ${err.response?.status}: ${err.response?.data.message || err.message || 'unknown'}`;
    }
    this.loading = false;
  }

  private async createUpdateRecord() {
    this.isValid = false;
    if (this.record) {
      this.isValid = true;
      this.checkFormValidity(this.patientForm);
      this.checkFormValidity(this.detailForm);
      if (this.record.checkUp == '') {
        delete this.record.checkUp;
      }
    }

    if (!this.isValid) {
      console.log('Updated/posted record is not valid');
      return;
    }

    this.loading = true;
    this.responseMessage = '';
    this.responseSuccess = false;
    try {
      const api = PnRegistryRecordsApiFactory(undefined, this.apiBase);

      const response = this.recordId === '@new' ? await api.createRecord(this.record) : await api.updateRecord(this.recordId, this.record);

      if (response.status < 299) {
        console.log('Stored succesfully');
        this.record = response.data;
        this.responseSuccess = true;
        this.responseMessage = `PN záznam bol úspešne uložený - ${response?.status}`;
      } else {
        const errorResponse = response.data as unknown as ErrorResponse;
        this.responseMessage = `Chyba pri ukladaní PN záznamu: ${errorResponse?.message || response.statusText}`;
      }
    } catch (err: any) {
      this.responseMessage = `Chyba pri ukladaní PN záznamu - ${err.response?.status}: ${err.response?.data.message || err.message || 'unknown'}`;
    }

    this.loading = false;
  }

  private async deleteRecord() {
    this.closeDialog();
    this.loading = true;
    this.responseMessage = '';
    try {
      const response = await PnRegistryRecordsApiFactory(undefined, this.apiBase).deleteRecord(this.recordId);
      if (response.status < 299) {
        this.detailClosed.emit('back');
        console.log('Deleted succesfully');
      } else {
        const errorResponse = response.data as unknown as ErrorResponse;
        this.responseMessage = `Chyba pri odstraňovaní PN záznamu: ${errorResponse?.message || response.statusText}`;
      }
    } catch (err: any) {
      this.responseMessage = `Chyba pri odstraňovaní PN záznamu - ${err.response?.status}: ${err.response?.data.message || err.message || 'unknown'}`;
    }
    this.loading = false;
  }

  render() {
    return (
      <Host>
        <h3 class="detail-heading">{this.recordId === '@new' ? 'Vytvoriť záznam o PN' : 'Detail záznamu PN'}</h3>
        <div class="horizontal-box">
          <form ref={el => (this.patientForm = el)} class="input-form">
            <div class="pacient-heading form-heading">
              <h3>Pacient</h3>
              {this.recordId === '@new' && (
                <div>
                  <label htmlFor="check">Nový:</label>
                  <md-checkbox
                    id="check"
                    checked={this.newPacient}
                    onChange={(ev: Event) => {
                      this.record.fullName = '';
                      this.newPacient = (ev.target as HTMLInputElement).checked;
                    }}
                  ></md-checkbox>
                </div>
              )}
            </div>

            <md-outlined-text-field
              key={this.newPacient}
              id="fullname"
              label="Meno a Priezvisko"
              class="form-item"
              value={this.record?.fullName}
              disabled={!this.newPacient}
              required
              oninput={(ev: InputEvent) => this.handleInputEvent(ev, 'fullName')}
            >
              <md-icon slot="leading-icon">id_card</md-icon>
            </md-outlined-text-field>

            <md-outlined-text-field
              id="pacientid"
              label="Rodné číslo"
              class="form-item"
              type="text"
              maxlength="10"
              required
              pattern="\d*"
              value={this.record?.patientId}
              oninput={(ev: InputEvent) => {
                this.handleInputEvent(ev, 'patientId');
                if (this.recordId !== '@new') {
                  this.record.fullName = '';
                }
              }}
            >
              <md-icon slot="leading-icon">fingerprint</md-icon>
            </md-outlined-text-field>

            <md-outlined-text-field
              id="employer"
              label="Názov zamestnávateľa"
              class="form-item"
              required
              value={this.record?.employer}
              oninput={(ev: InputEvent) => this.handleInputEvent(ev, 'employer')}
            >
              <md-icon slot="leading-icon">corporate_fare</md-icon>
            </md-outlined-text-field>

            <h3 class="form-heading">Plánovaná kontrola</h3>

            <div class="form-heading">
              <label htmlFor="check">Vybavená:</label>
              <md-checkbox
                id="check"
                checked={this.record?.checkUpDone}
                onChange={(ev: Event) => {
                  if (this.record) {
                    this.record.checkUpDone = (ev.target as HTMLInputElement).checked;
                  }
                }}
              ></md-checkbox>
            </div>

            <md-outlined-text-field
              id="checkup"
              label="Dátum kontroly"
              class="form-item"
              type="date"
              value={!this.record?.checkUp ? '' : this.record?.checkUp}
              oninput={(ev: InputEvent) => {
                if (this.record) {
                  this.record.checkUp = (ev.target as HTMLInputElement).value;
                }
              }}
            >
              <md-icon slot="leading-icon">edit_calendar</md-icon>
            </md-outlined-text-field>

            <md-outlined-button type="button" class="alight-left button" onClick={() => this.detailClosed.emit('back')}>
              <md-icon slot="icon">arrow_back</md-icon>
              Späť
            </md-outlined-button>
          </form>

          <form ref={el => (this.detailForm = el)} class="input-form">
            <h3 class="form-heading">Detail práceneschopnosti</h3>

            <md-outlined-text-field type="text" label="PN ID" class="form-item" value={this.record?.id} disabled>
              <md-icon slot="leading-icon">fingerprint</md-icon>
            </md-outlined-text-field>

            <md-outlined-text-field type="date" label="Dátum vzniku PN" class="form-item" value={this.record?.issued} disabled>
              <md-icon slot="leading-icon">calendar_month</md-icon>
            </md-outlined-text-field>

            <md-outlined-select
              label="Dôvod"
              class="form-item"
              required
              value={this.record?.reason}
              onChange={(ev: InputEvent) => {
                this.handleInputEvent(ev, 'reason');
              }}
            >
              <md-icon slot="leading-icon">sick</md-icon>
              <md-select-option value="choroba">
                <div>choroba</div>
              </md-select-option>
              <md-select-option value="úraz">
                <div>úraz</div>
              </md-select-option>
              <md-select-option value="choroba z povolania">
                <div>choroba z povolania</div>
              </md-select-option>
              <md-select-option value="karantenne opatrenie/izolácia">
                <div>karantenne opatrenie/izolácia</div>
              </md-select-option>
              <md-select-option value="pracovný úraz">
                <div>pracovný úraz</div>
              </md-select-option>
              <md-select-option value="iné">
                <div>iné</div>
              </md-select-option>
            </md-outlined-select>

            <md-outlined-text-field
              id="valid-from"
              type="date"
              label="Začiatok platnosti"
              class="form-item"
              required
              value={this.record?.validFrom}
              oninput={(ev: InputEvent) => this.handleInputEvent(ev, 'validFrom')}
            >
              <md-icon slot="leading-icon">calendar_month</md-icon>
            </md-outlined-text-field>

            <md-outlined-text-field
              id="valid-until"
              type="date"
              label="Predpokladané trvanie do"
              class="form-item"
              required
              supporting-text="*PN platí aj vrátane tohto dňa"
              value={this.record?.validUntil}
              oninput={(ev: InputEvent) => this.handleInputEvent(ev, 'validUntil')}
            >
              <md-icon slot="leading-icon">calendar_month</md-icon>
            </md-outlined-text-field>

            <div class="alight-right">
              {this.recordId !== '@new' && (
                <md-outlined-button type="button" class="button" onClick={() => this.openDialog()}>
                  <md-icon slot="icon">delete</md-icon>
                  Zmazať
                </md-outlined-button>
              )}

              <md-filled-tonal-button
                disabled={this.responseSuccess && this.recordId === '@new'}
                type="button"
                class="button save-button"
                onClick={() => this.createUpdateRecord()}
              >
                <md-icon slot="icon">save</md-icon>
                Uložiť
              </md-filled-tonal-button>
            </div>
          </form>
        </div>

        {this.loading && <md-linear-progress indeterminate class="loading"></md-linear-progress>}

        {this.responseMessage && !this.responseSuccess && (
          <div class="response-card">
            <md-icon class="icon negative" slot="icon">
              error
            </md-icon>
            <div class="negative">{this.responseMessage}</div>
          </div>
        )}

        {this.responseMessage && this.responseSuccess && (
          <div class="response-card">
            <md-icon class="icon positive" slot="icon">
              done_outline
            </md-icon>
            <div class="positive">PN záznam bol úspešne uložený</div>
          </div>
        )}

        <md-dialog type="alert" open={this.isDialogOpen} class="dialog">
          <div slot="headline">Potvrdenie zmazania</div>
          <form slot="content" id="form-id" method="dialog">
            <div>Naozaj si prajete zmazať záznam o PN?</div>
            <div> Akcia nieje navrátitelná</div>
          </form>
          <div slot="actions">
            <md-outlined-button class="button" form="form-id" value="cancel" onClick={() => this.closeDialog()}>
              Zrušiť
            </md-outlined-button>
            <md-outlined-button class="button" form="form-id" value="delete" onClick={() => this.deleteRecord()}>
              <md-icon slot="icon">delete</md-icon>
              Zmazať
            </md-outlined-button>
          </div>
        </md-dialog>
      </Host>
    );
  }

  private handleInputEvent(ev: InputEvent, recordAtribute: string) {
    if (this.record) {
      const target = ev.target as HTMLInputElement;
      this.checkInputValidity(target);
      this.record[recordAtribute] = target.value;
    }
  }

  private checkFormValidity(formElement: HTMLFormElement) {
    let valid = true;

    // check validity of elements
    for (let i = 0; i < formElement.children.length; i++) {
      const element = formElement.children[i] as HTMLInputElement;
      let elementValid = true;

      if (element.id != 'checkup') {
        valid = this.checkInputValidity(element);
        elementValid &&= valid;
      }

      if (element.id === 'checkup') {
        valid = this.checkDatesValidity(element, this.record.checkUp, 'Dátum kontroly PN nesmie byť skôr ako začiatok platnosti');
        elementValid &&= valid;

        valid = this.checkDateRange(element, this.record.checkUp);
        elementValid &&= valid;
      } else if (element.id === 'valid-until') {
        valid = this.checkDatesValidity(element, this.record.validUntil, 'Dátum exspirácie PN nesmie byť skôr ako začiatok platnosti');
        elementValid &&= valid;

        valid = this.checkDateRange(element, this.record.validUntil);
        elementValid &&= valid;
      } else if (element.id === 'valid-from') {
        valid = this.checkDateRange(element, this.record.validFrom);
        elementValid &&= valid;
      }

      if (elementValid) this.clearValidityError(element);

      this.isValid &&= elementValid;
    }
  }

  private clearValidityError(inputElement: HTMLInputElement) {
    if ('reportValidity' in inputElement) {
      inputElement.setCustomValidity('');

      // Suppress default validation messages for empty or invalid dates
      if (inputElement.id == 'checkup' && (inputElement.validity.badInput || inputElement.validity.valueMissing)) {
        inputElement.valueAsDate = new Date();
        inputElement.reportValidity();
        inputElement.valueAsDate = undefined;
        return;
      }
      console.log('reseting element', inputElement.id);
      inputElement.reportValidity();
    }
  }

  private checkInputValidity(inputElement: HTMLInputElement): boolean {
    // Directly check and report validity for the target element
    if ('reportValidity' in inputElement) {
      inputElement.setCustomValidity('');
      if (inputElement.validity.valueMissing) {
        inputElement.setCustomValidity('Pole je povinné');
      }
      if (inputElement.validity.patternMismatch) {
        inputElement.setCustomValidity('Pole može obsahovať len číselné znaky');
      }
      if (inputElement.validity.badInput) {
        inputElement.setCustomValidity('Zadajte validný dátum');
      }
      return inputElement.reportValidity();
    }
    return true;
  }

  private checkDateRange(inputElement: HTMLInputElement, date: string) {
    const dateToValid = new Date(date).setHours(0, 0, 0, 0);
    const maxDate = new Date('9999-12-31T00:00:00Z').setHours(0, 0, 0, 0);
    const minDate = new Date('0001-01-01T00:00:00Z').setHours(0, 0, 0, 0);

    console.log('validating range:', inputElement.id);
    if (date && dateToValid > maxDate) {
      inputElement.setCustomValidity('Maximalny povolený dátum je 31/12/9999');
      inputElement.reportValidity();
      return false;
    } else if (date && dateToValid <= minDate) {
      inputElement.setCustomValidity('Minimálny povolený dátum je 02/01/0001');
      inputElement.reportValidity();
      return false;
    }

    return true;
  }

  private checkDatesValidity(inputElement: HTMLInputElement, date: string, validityMessage: string): boolean {
    const validFrom = new Date(this.record.validFrom).setHours(0, 0, 0, 0);
    const dateToValid = new Date(date).setHours(0, 0, 0, 0);

    if (validFrom > dateToValid) {
      console.log('invalid');
      inputElement.setCustomValidity(validityMessage);
      inputElement.reportValidity();
      return false;
    }
    return true;
  }
}
