import { Component, Host, h, Prop, EventEmitter, Event, State } from '@stencil/core';
import { Record } from '../../api/pnregistry';
import { MdOutlinedField } from '@material/web/field/outlined-field';

@Component({
  tag: 'mb-pnregistry-detail',
  styleUrl: 'mb-pnregistry-detail.css',
  shadow: true,
})
export class MbPnregistryDetail {
  @Prop() recordId: string;
  @Prop() apiBase: string;

  @Event({ eventName: 'detail-closed' }) detailClosed: EventEmitter<string>;

  @State() record: Record;
  @State() isDialogOpen: boolean = false; // Track the state of the dialog
  @State() loading: boolean = true;
  @State() errorMessage: string;
  @State() isValid: boolean;
  @State() newPacient: boolean;

  private formElement: HTMLFormElement;
  private formSecond: HTMLFormElement;

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
    };
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

  private checkFormValidity() {
    // check validity of elements
    for (let i = 0; i < this.formElement.children.length; i++) {
      const element = this.formElement.children[i] as HTMLInputElement;
      this.checkInputValidity(element);
    }
  }

  private checkInputValidity(inputElement: HTMLInputElement) {
    // Directly check and report validity for the target element
    let valid = true;
    this.isValid = true;
    if ('reportValidity' in inputElement) {
      inputElement.setCustomValidity('');
      if (inputElement.validity.valueMissing) {
        inputElement.setCustomValidity('Pole je povinné');
      }
      if (inputElement.validity.patternMismatch) {
        inputElement.setCustomValidity('Pole može obsahovať len číselné znaky');
      }

      const valid = inputElement.reportValidity();
      this.isValid &&= valid;
    }
  }

  private handleInputEvent(ev: InputEvent): string {
    const target = ev.target as HTMLInputElement;
    this.checkInputValidity(target);
    return target.value;
  }

  render() {
    console.log('render triggered:', this.record);
    return (
      <Host>
        <div class="horizontal-box">
          <div class="vertical-box">
            <div class="pacient-heading">
              <h3>Pacient</h3>
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
            </div>

            <form ref={el => (this.formElement = el)} class="input-form">
              <md-outlined-text-field
                key={this.newPacient}
                id="fullname"
                label="Meno a Priezvisko"
                class="input-size"
                value={this.record.fullName}
                disabled={this.newPacient}
                required
                oninput={(ev: InputEvent) => {
                  if (this.record) {
                    this.record.fullName = this.handleInputEvent(ev);

                    console.log('record po handle:', this.record.fullName);
                  }
                }}
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
                value={this.record.patientId}
                oninput={(ev: InputEvent) => {
                  if (this.record) {
                    this.record.patientId = this.handleInputEvent(ev);
                  }
                }}
              >
                <md-icon slot="leading-icon">fingerprint</md-icon>
              </md-outlined-text-field>

              <md-outlined-text-field
                id="employer"
                label="Názov zamestnávateľa"
                class="input-size"
                required
                value={this.record.employer}
                oninput={(ev: InputEvent) => {
                  if (this.record) {
                    this.record.employer = this.handleInputEvent(ev);
                  }
                }}
              >
                <md-icon slot="leading-icon">corporate_fare</md-icon>
              </md-outlined-text-field>

              <h3>Plánovaná kontrola</h3>

              <div>
                <label htmlFor="check">Vybavená:</label>
                <md-checkbox
                  id="check"
                  checked={this.record.checkUpDone}
                  onChange={(ev: Event) => {
                    const target = ev.target as HTMLInputElement;
                    this.record.checkUpDone = target.checked;
                  }}
                ></md-checkbox>
              </div>

              <md-outlined-text-field
                id="checkup"
                label="Dátum kontroly"
                class="input-size"
                type="date"
                value={this.record.checkUp}
                oninput={(ev: InputEvent) => {
                  if (this.record) {
                    this.record.checkUp = this.handleInputEvent(ev);
                  }
                }}
              >
                <md-icon slot="leading-icon">edit_calendar</md-icon>
              </md-outlined-text-field>
            </form>

            <md-outlined-button class="button" onClick={() => this.openDialog()}>
              <md-icon slot="icon">delete</md-icon>
              Zmazať
            </md-outlined-button>
          </div>

          <div class="vertical-box">
            <h3>Detail práceneschopnosti</h3>
            <form ref={el => (this.formSecond = el)} class="input-form">
              <md-outlined-text-field label="PN ID" value={this.record.id} class="input-size" disabled>
                <md-icon slot="leading-icon">fingerprint</md-icon>
              </md-outlined-text-field>

              <md-outlined-text-field type="datetime-local" label="Dátum a čas vzniku PN" value={this.record.issued} class="input-size">
                <md-icon slot="leading-icon">calendar_month</md-icon>
              </md-outlined-text-field>

              <md-outlined-select label="Dôvod">
                <md-icon slot="leading-icon">sick</md-icon>
                <md-select-option selected value="choroba">
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
                value={this.record.validFrom}
                oninput={(ev: InputEvent) => {
                  if (this.record) {
                    const target = ev.target as HTMLInputElement;
                    this.record.validFrom = target.value;
                  }
                }}
              >
                <md-icon slot="leading-icon">calendar_month</md-icon>
              </md-outlined-text-field>

              <md-outlined-text-field type="date" label="Predpokladané trvanie do" class="input-size">
                <md-icon slot="leading-icon">calendar_month</md-icon>
              </md-outlined-text-field>
            </form>

            <div class="save-cancel">
              <md-outlined-button class="button" onClick={() => this.detailClosed.emit('cancel')}>
                Zrušiť
              </md-outlined-button>
              <md-filled-tonal-button class="button save-button" onClick={() => console.log(this.record)}>
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
