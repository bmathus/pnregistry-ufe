import { Component, Host, h, Prop, EventEmitter, Event, State } from '@stencil/core';
import { Record } from '../../api/pnregistry';

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
  @State() loading: boolean = true;
  @State() errorMessage: string;
  @State() isValid: boolean = false;
  @State() newPacient: boolean;

  private patientForm: HTMLFormElement;
  private detailForm: HTMLFormElement;

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
      checkUpDone: false,
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
  }

  private checkFormValidity(formElement: HTMLFormElement) {
    let valid = false;
    // check validity of elements
    for (let i = 0; i < formElement.children.length; i++) {
      const element = formElement.children[i] as HTMLInputElement;

      if (element.id === 'checkup') {
        console.log('vykonam sa');
        valid = this.checkDatesValidity(element, this.record.checkUp, 'Dátum kontroly PN nesmie byť skôr ako začiatok platnosti');
        this.isValid &&= valid;
        continue;
      }

      valid = this.checkInputValidity(element);
      this.isValid &&= valid;

      if (element.id === 'valid-until') {
        valid = this.checkDatesValidity(element, this.record.validUntil, 'Dátum exspirácie PN nesmie byť skôr ako začiatok platnosti');
        this.isValid &&= valid;
      }
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
  //

  private checkDatesValidity(inputElement: HTMLInputElement, date: string, validityMessage: string): boolean {
    const validFrom = new Date(this.record.validFrom);
    const dateToValid = new Date(date);

    if (validFrom > dateToValid) {
      inputElement.setCustomValidity(validityMessage);
      inputElement.reportValidity();
      return false;
    }

    inputElement.setCustomValidity('');
    inputElement.reportValidity();
    return true;

    //console.log(isNaN(validFrom.valueOf()));
  }

  private handleInputEvent(ev: InputEvent, recordAtribute: string) {
    if (this.record) {
      const target = ev.target as HTMLInputElement;
      this.checkInputValidity(target);
      this.record[recordAtribute] = target.value;
    }
  }

  render() {
    return (
      <Host>
        <div class="horizontal-box">
          <div class="vertical-box">
            <div class="pacient-heading">
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

            <form ref={el => (this.patientForm = el)} class="input-form">
              <md-outlined-text-field
                key={this.newPacient}
                id="fullname"
                label="Meno a Priezvisko"
                class="input-size"
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
                class="input-size"
                type="text"
                maxlength="10"
                required
                pattern="\d*"
                value={this.record?.patientId}
                oninput={(ev: InputEvent) => this.handleInputEvent(ev, 'patientId')}
              >
                <md-icon slot="leading-icon">fingerprint</md-icon>
              </md-outlined-text-field>

              <md-outlined-text-field
                id="employer"
                label="Názov zamestnávateľa"
                class="input-size"
                required
                value={this.record?.employer}
                oninput={(ev: InputEvent) => this.handleInputEvent(ev, 'employer')}
              >
                <md-icon slot="leading-icon">corporate_fare</md-icon>
              </md-outlined-text-field>

              <h3>Plánovaná kontrola</h3>

              <div>
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
                class="input-size"
                type="date"
                value={this.record?.checkUp}
                oninput={(ev: InputEvent) => {
                  if (this.record) {
                    this.record.checkUp = (ev.target as HTMLInputElement).value;
                  }
                }}
              >
                <md-icon slot="leading-icon">edit_calendar</md-icon>
              </md-outlined-text-field>
            </form>

            <md-outlined-button class="button" onClick={() => this.detailClosed.emit('back')}>
              <md-icon slot="icon">arrow_back</md-icon>
              Späť
            </md-outlined-button>
          </div>

          <div class="vertical-box">
            <h3>Detail práceneschopnosti</h3>

            <form ref={el => (this.detailForm = el)} class="input-form">
              <md-outlined-text-field type="text" label="PN ID" class="input-size" value={this.record?.id} disabled>
                <md-icon slot="leading-icon">fingerprint</md-icon>
              </md-outlined-text-field>

              <md-outlined-text-field type="date" label="Dátum vzniku PN" class="input-size" value={this.record?.issued} disabled>
                <md-icon slot="leading-icon">calendar_month</md-icon>
              </md-outlined-text-field>

              <md-outlined-select
                label="Dôvod"
                class="input-size"
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
                type="date"
                label="Začiatok platnosti"
                class="input-size"
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
                class="input-size"
                required
                supporting-text="*PN platí aj vrátane tohto dňa"
                value={this.record?.validUntil}
                oninput={(ev: InputEvent) => this.handleInputEvent(ev, 'validUntil')}
              >
                <md-icon slot="leading-icon">calendar_month</md-icon>
              </md-outlined-text-field>
            </form>

            <div class="save-cancel">
              <md-outlined-button class="button" onClick={() => this.openDialog()}>
                <md-icon slot="icon">delete</md-icon>
                Zmazať
              </md-outlined-button>

              <md-filled-tonal-button
                class="button save-button"
                onClick={() => {
                  if (this.record) {
                    this.isValid = true;
                    this.checkFormValidity(this.patientForm);
                    this.checkFormValidity(this.detailForm);
                  }
                }}
              >
                <md-icon slot="icon">save</md-icon>
                Uložiť
              </md-filled-tonal-button>
            </div>
          </div>
        </div>

        {this.loading && <md-linear-progress indeterminate class="loading"></md-linear-progress>}

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
            <md-outlined-button class="button" form="form-id" value="delete" onClick={() => this.closeDialog()}>
              <md-icon slot="icon">delete</md-icon>
              Zmazať
            </md-outlined-button>
          </div>
        </md-dialog>
      </Host>
    );
  }
}
