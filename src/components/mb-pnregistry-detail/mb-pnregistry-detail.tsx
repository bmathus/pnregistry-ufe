import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'mb-pnregistry-detail',
  styleUrl: 'mb-pnregistry-detail.css',
  shadow: true,
})
export class MbPnregistryDetail {
  render() {
    return (
      <Host>
        <div class="horizontal-box">
          <div class="vertical-box">
            <div class="pacient-heading">
              <h3>Pacient</h3>
              <div>
                <label htmlFor="check">Nový:</label>
                <md-checkbox id="check"></md-checkbox>
              </div>
            </div>

            <div class="input-form">
              <md-outlined-text-field label="Meno a priezvisko" class="input-size">
                <md-icon slot="leading-icon">id_card</md-icon>
              </md-outlined-text-field>

              <md-outlined-text-field type="number" label="Rodné číslo" maxlength="10" class="input-size">
                <md-icon slot="leading-icon">fingerprint</md-icon>
              </md-outlined-text-field>

              <md-outlined-text-field label="Názov zamestnávateľa" class="input-size">
                <md-icon slot="leading-icon">corporate_fare</md-icon>
              </md-outlined-text-field>
            </div>

            <h3>Plánovaná kontrola</h3>
            <div class="input-form">
              <div>
                <label htmlFor="check">Vybavená:</label>
                <md-checkbox id="check"></md-checkbox>
              </div>
              <md-outlined-text-field type="date" label="Dátum kontroly" class="input-size">
                <md-icon slot="leading-icon">edit_calendar</md-icon>
              </md-outlined-text-field>
            </div>

            <md-outlined-button class="button">
              <md-icon slot="icon">delete</md-icon>
              Zmazať
            </md-outlined-button>
          </div>

          <div class="vertical-box">
            <h3>Detail práceneschopnosti</h3>
            <div class="input-form">
              <md-outlined-text-field label="PN ID">
                <md-icon slot="leading-icon">fingerprint</md-icon>
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
              <md-outlined-text-field type="date" label="Dátum vzniku PN" disabled class="input-size">
                <md-icon slot="leading-icon">fingerprint</md-icon>
              </md-outlined-text-field>

              <md-outlined-text-field type="date" label="Začiatok platnosti" class="input-size">
                <md-icon slot="leading-icon">calendar_month</md-icon>
              </md-outlined-text-field>

              <md-outlined-text-field type="date" label="Predpokladané trvanie do" class="input-size">
                <md-icon slot="leading-icon">calendar_month</md-icon>
              </md-outlined-text-field>
            </div>

            <div class="save-cancel">
              <md-outlined-button class="button">Zrušiť</md-outlined-button>
              <md-filled-tonal-button class="button save-button">
                <md-icon slot="icon">save</md-icon>
                Uložiť
              </md-filled-tonal-button>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
