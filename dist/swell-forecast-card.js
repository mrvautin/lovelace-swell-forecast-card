const LitElement = customElements.get("ha-panel-lovelace") ? Object.getPrototypeOf(customElements.get("ha-panel-lovelace")) : Object.getPrototypeOf(customElements.get("hc-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

const scoreColours = {
  0: "#ef476f",
  1: "#ffd166",
  2: "#06d6a0",
  3: "#118ab2",
  4: "#073b4c",
  5: "#38b000"
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "swell-forecast-card",
  name: "Swell forecast Card",
  description: "A custom card for Swell forecast.",
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

    return html`
      <ha-card>
        ${this.renderForecast(this.cardConfig, lang)}
      </ha-card>
    `;

  }

  renderForecast(config, lang) {
    if (!config || config.entityStates.length === 0) {
      return html``;
    }

    this.numberElements++;
    return html`
      ${config.title
      ? html` <div class="title box"> ${config.title} <img src="/hacsfiles/lovelace-swell-forecast-card/logo.png" class="title-icon" /></div>`
      : ""}
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
                    new Date(entity.attributes.forecastDate).toLocaleDateString(undefined, { day: 'numeric', month: 'numeric' })}
                </div>
                <div class="score" style="color: ${this.getScoreColor(entity.attributes.optimalScore)} !important;">
                  ${entity.attributes.humanRelation}
                </div>
                <div class="labels">
                  Min / Max
                </div>
                <div class="max">
                  ${this.getMinMax(config, entity)}
                </div>
              </div>
            `
          )}
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
    const scoreColour = scoreColours[Math.floor(score)];
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
        font-size: 1em;
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
        font-size: 2em;
        padding-bottom: .5em;
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
    `;
  }
}
customElements.define("swell-forecast-card", SwellForecastCard);