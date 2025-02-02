const LitElement = customElements.get("ha-panel-lovelace") ? Object.getPrototypeOf(customElements.get("ha-panel-lovelace")) : Object.getPrototypeOf(customElements.get("hc-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

const scoreColours = {
  1: "#d29ce3",
  2: "#a538c6",
  3: "#001eba",
  4: "#33a7c8",
  5: "#31d5c8",
  6: "#05fb00",
  7: "#fff500",
  8: "#ff6100",
  9: "#e90000"
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "swell-forecast-card",
  name: "Swell Forecast Card",
  description: "A custom card for Swell Forecast.",
  preview: true,
  documentationURL: "https://github.com/mrvautin/lovelace-swell-forecast-card",
});

const fireEvent = (node, type, detail, options) => {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

function hasConfigOrEntityChanged(element, changedProps) {
  if (changedProps.has("_config")) {
    return true;
  }

  const oldHass = changedProps.get("hass");
  if (oldHass) {
    return (
      oldHass.states[element._config.entity] !==
        element.hass.states[element._config.entity] ||
      oldHass.states["sun.sun"] !== element.hass.states["sun.sun"]
    );
  }

  return true;
}

class SwellForecastCard extends LitElement {
  static get properties() {
    return {
      _config: {},
      hass: {},
    };
  }

  setConfig(config) {
    if (!config.entities) {
      throw new Error("Please define a weather entity");
    }
    const updatedConfig = Object.assign({}, config); 
    updatedConfig.number_of_forecasts = config.entities.length;

    this.cardConfig = updatedConfig;
    this._config = config;
  }

  shouldUpdate(changedProps) {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  render() {
    if (!this._config || !this.hass) {
      return html``;
    }
    this.numberElements = 0;

    const lang = this.hass.selectedLanguage || this.hass.language;

    // Grab the states for the entities
    const entityStates = [];
    for(let i = 0; i < this.cardConfig.entities.length; i++) {
      entityStates.push(this.hass.states[this.cardConfig.entities[i]])
    }
    this.cardConfig.entityStates = entityStates;
    if(this._config.current){
      this.cardConfig.currentState= this.hass.states[this.cardConfig.current]
    }

    return html`
      <ha-card>
        ${this.renderTitle(this.cardConfig)}
        ${this.renderCurrentDay(this.cardConfig)}
        ${this.renderForecast(this.cardConfig, lang)}
      </ha-card>
    `;
  }

  renderTitle(config) {
    return html `
      ${config.title
      ? html` <div class="title box"> ${config.title} <img src="/hacsfiles/lovelace-swell-forecast-card/logo.png" class="title-icon" /></div>`
      : ""}
    `;
  }

  renderForecast(config, lang) {
    if (!config || config.entityStates.length === 0) {
      return html``;
    }

    // Setup the scale
    const scale = config.scale;
    const scales = [ 'face', 'douglas'];
    let scale_key = 'face_scale';
    if(scale){
      if(scales.includes(scale)){
        scale_key = `${scale}_scale`;
      }else{
        console.log('Invalid scale supplied. Allowed values: face, douglas')
      }
    }

    this.numberElements++;
    return html`
      
      <div class="forecast clear ${this.numberElements > 1 ? "spacer" : ""}">
        ${config.entityStates
          .slice(
            0,
            this._config.number_of_forecasts
              ? this._config.number_of_forecasts
              : 5
          )
          .map(
            (entity) => html`
              <div class="day" @click=${() => this._handleClick(entity)}>
                <div class="dayname">
                  ${
                    new Date(entity.attributes.updated).toLocaleDateString(undefined, { day: 'numeric', month: 'numeric' })}
                </div>
                <div class="score" style="background-color: ${this.getScoreColor(entity.attributes.optimal_wave.wave.score[scale_key].score)} !important;">
                  <div class="score_num">${entity.attributes.optimal_wave.wave.score[scale_key].score}</div></br>
                  <div class="score_desc">${entity.attributes.optimal_wave.wave.score[scale_key].description}</div>
                </div>
                <div class="wave-details">
                  ${entity.attributes.optimal_wave.max_wave}
                </div>
              </div>
            `
          )}
      </div>
    `;
  }

  renderCurrentDay(config, lang) {
    if (!config || !config.currentState) {
      return html``;
    }

    const options = {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
  
    const date = new Date(config.currentState.attributes.current_time);
    const localTime = date.toLocaleString('en-AU', options);

    return html`
      <div class="current_conditions_heading">
        Current conditions: 
      </div>
      <div class="current_conditions">
        <p><i>${localTime}</i> - <strong>Height: ${config.currentState.attributes.wave_height}${config.currentState.attributes.wave_metric}</strong></p>
      </div>
    `;
  }

  getMinMax(config, entity) {
    let metric = config.metric === 'm' ? 'm' : 'ft';
    if(metric === 'ft'){
     return `${entity.attributes.surfMinFt}ft / ${entity.attributes.surfMaxFt}ft`;
    }else{
      return `${entity.attributes.surfMinM}m / ${entity.attributes.surfMaxM}m`;
    }
  }

  getScoreColor(score) {
    const scoreColour = scoreColours[score];
    return scoreColour || "#dddddd";
  }

  _handleClick(entity) {
    fireEvent(this, "hass-more-info", { entityId: entity.entity_id });
  }

  getCardSize() {
    return 3;
  }

  static get styles() {
    return css`
      ha-card {
        cursor: pointer;
        margin: auto;
        overflow: hidden;
        padding-top: 1em;
        padding-bottom: 1em;
        padding-left: 1em;
        padding-right: 1em;
        position: relative;
      }

      .score {
        border-radius: 50%;
        height: 40px;
        margin-left: 5px;
        margin-right: 5px;
        line-height: 10px;
        padding-top: 15px;
        padding-bottom: 5px;
        color: white;
      }

      .score_num {
        font-size: 1.5em;
        color: white;
      }

      .score_desc {
        font-size: .7em;
      }

      .spacer {
        padding-top: 1em;
      }

      .clear {
        clear: both;
      }

      .title {
        left: 3em;
        font-weight: 400;
        font-size: 1.8em;
        color: var(--primary-text-color);
      }

      .box {
        display: flex;
        align-items:center;
      }

      .title-icon {
        padding-left: 10px;
        height: 35px;
      }

      @media (max-width: 460px) {
        .title {
          font-size: 2.2em;
          left: 4em;
        }
      }

      .labels {
        font-weight: 700;
      }

      .forecast {
        width: 100%;
        margin: 0 auto;
        display: flex;
      }

      .day {
        flex: 1;
        display: block;
        text-align: center;
        color: var(--primary-text-color);
        border-right: 0.1em solid #d9d9d9;
        line-height: 2;
        box-sizing: border-box;
      }

      .wave-details {
        padding-top: 5px;
        font-weight: 700;
        line-height: 20px;
      }

      .dayname {
        text-transform: uppercase;
      }

      .forecast .day:first-child {
        margin-left: 0;
      }

      .forecast .day:nth-last-child(1) {
        border-right: none;
        margin-right: 0;
      }

      .current_conditions_heading {
        padding-top: 10px;
        padding-bottom: 5px;
        text-align: left;
        font-weight: 700;
        font-size: 16px;
      }

      .current_conditions {
        text-align: left;
        font-size: 16px;
        padding-bottom: 10px;
      }

      .current_conditions p {
        margin: 0;
      } 
    `;
  }
}
customElements.define("swell-forecast-card", SwellForecastCard);