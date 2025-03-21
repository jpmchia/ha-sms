class SmsSenderCard extends HTMLElement {
  // Define default configuration
  static get properties() {
    return {
      config: { type: Object },
      hass: { type: Object }
    };
  }
  
  constructor() {
    super();
    this.config = {
      title: "Send SMS",
      twilio_sid: "",
      twilio_token: "",
      twilio_number: "",
      use_service: true // If true, use rest_command; if false, use direct API call
    };
  }
  
  set hass(hass) {
    this._hass = hass;
    
    if (!this.content) {
      // Initialize the card content
      this._createCard();
      this.content = true;
    }
  }
  
  setConfig(config) {
    if (config.title) this.config.title = config.title;
    if (config.twilio_sid) this.config.twilio_sid = config.twilio_sid;
    if (config.twilio_token) this.config.twilio_token = config.twilio_token;
    if (config.twilio_number) this.config.twilio_number = config.twilio_number;
    if (config.use_service !== undefined) this.config.use_service = config.use_service;
    
    this.config = { ...this.config, ...config };
    
    // If we've already created the card, update it with new config
    if (this.content) {
      this._createCard();
    }
  }
  
  _createCard() {
    this.innerHTML = `
      <ha-card header="${this.config.title}">
        <div class="card-content">
          <paper-input label="Phone Number" id="phone-number"></paper-input>
          <paper-textarea label="Message" id="message"></paper-textarea>
        </div>
        <div class="card-actions">
          <mwc-button id="send-button">Send</mwc-button>
        </div>
      </ha-card>
    `;
    
    // Add event listener for the send button
    this.querySelector('#send-button').addEventListener('click', () => {
      const phoneNumber = this.querySelector('#phone-number').value;
      const message = this.querySelector('#message').value;
      
      if (!phoneNumber || !message) {
        this._showToast('Please enter both phone number and message');
        return;
      }
      
      this._sendSms(phoneNumber, message);
    });
  }
  
  // Method to show toast notification
  _showToast(message) {
    const event = new CustomEvent('hass-notification', {
      detail: { message }
    });
    window.dispatchEvent(event);
  }
  
  // Method to send SMS either via service or direct API call
  _sendSms(phoneNumber, message) {
    if (this.config.use_service) {
      this._sendViaTwilioService(phoneNumber, message);
    } else {
      this._sendViaTwilioApi(phoneNumber, message);
    }
  }
  
  // Use Home Assistant's rest_command service
  _sendViaTwilioService(phoneNumber, message) {
    this._hass.callService('rest_command', 'send_sms', {
      phone_number: phoneNumber,
      message: message
    }).then(() => {
      this._showToast('SMS sent successfully');
      this._clearForm();
    }).catch(error => {
      this._showToast(`Error sending SMS: ${error.message}`);
    });
  }
  
  // Direct API call to Twilio
  _sendViaTwilioApi(phoneNumber, message) {
    // Validate Twilio credentials
    if (!this.config.twilio_sid || !this.config.twilio_token || !this.config.twilio_number) {
      this._showToast('Twilio credentials not configured. Please update card configuration.');
      return;
    }
    
    // Format phone number if needed
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }
    
    // Create the form data
    const formData = new URLSearchParams();
    formData.append('To', phoneNumber);
    formData.append('From', this.config.twilio_number);
    formData.append('Body', message);
    
    // API endpoint
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.config.twilio_sid}/Messages.json`;
    
    // Basic auth credentials
    const auth = btoa(`${this.config.twilio_sid}:${this.config.twilio_token}`);
    
    // Send the request
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || `HTTP error ${response.status}`);
        });
      }
      return response.json();
    })
    .then(data => {
      this._showToast('SMS sent successfully');
      this._clearForm();
    })
    .catch(error => {
      this._showToast(`Error sending SMS: ${error.message}`);
    });
  }
  
  _clearForm() {
    // Clear the form
    this.querySelector('#phone-number').value = '';
    this.querySelector('#message').value = '';
  }
  
  // Define card configuration
  static getConfigElement() {
    return document.createElement('sms-sender-card-editor');
  }
  
  static getStubConfig() {
    return {
      title: "Send SMS",
      twilio_sid: "",
      twilio_token: "",
      twilio_number: "",
      use_service: true
    };
  }
}

customElements.define('sms-sender-card', SmsSenderCard);

// Add editor for configuration
class SmsSenderCardEditor extends HTMLElement {
  setConfig(config) {
    this.config = {
      title: "Send SMS",
      twilio_sid: "",
      twilio_token: "",
      twilio_number: "",
      use_service: true,
      ...config
    };
  }
  
  get value() {
    return this.config;
  }
  
  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
  
  render() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    
    this.shadowRoot.innerHTML = `
      <style>
        .form-container {
          display: grid;
          grid-template-columns: 1fr;
          grid-gap: 8px;
        }
        .values {
          padding: 16px;
        }
        ha-switch {
          margin-right: 8px;
        }
        .switch-container {
          display: flex;
          align-items: center;
          margin-top: 8px;
        }
      </style>
      <div class="form-container">
        <paper-input 
          label="Card Title" 
          .value="${this.config.title}" 
          @value-changed="${this._valueChanged}" 
          .configValue="${'title'}">
        </paper-input>
        
        <div class="switch-container">
          <ha-switch
            .checked=${this.config.use_service}
            @change="${this._toggleService}"
          ></ha-switch>
          <span>Use Home Assistant service (requires rest_command setup)</span>
        </div>
        
        <div class="values" style="display: ${this.config.use_service ? 'none' : 'block'}">
          <paper-input 
            label="Twilio Account SID" 
            .value="${this.config.twilio_sid}" 
            @value-changed="${this._valueChanged}" 
            .configValue="${'twilio_sid'}">
          </paper-input>
          
          <paper-input 
            label="Twilio Auth Token" 
            .value="${this.config.twilio_token}" 
            @value-changed="${this._valueChanged}" 
            .configValue="${'twilio_token'}"
            type="password">
          </paper-input>
          
          <paper-input 
            label="Twilio Phone Number" 
            .value="${this.config.twilio_number}" 
            @value-changed="${this._valueChanged}" 
            .configValue="${'twilio_number'}"
            placeholder="+12025551234">
          </paper-input>
        </div>
      </div>
    `;
  }
  
  _toggleService(ev) {
    if (!this.config) {
      return;
    }
    
    const checked = ev.target.checked;
    
    this.config = {
      ...this.config,
      use_service: checked
    };
    
    // Show/hide Twilio credential fields
    this.shadowRoot.querySelector('.values').style.display = checked ? 'none' : 'block';
    
    this._fireEvent();
  }
  
  _valueChanged(ev) {
    if (!this.config || !ev.target) {
      return;
    }
    
    const target = ev.target;
    const configValue = target.configValue;
    
    if (!configValue) {
      return;
    }
    
    this.config = {
      ...this.config,
      [configValue]: ev.detail.value
    };
    
    this._fireEvent();
  }
  
  _fireEvent() {
    const event = new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}

customElements.define('sms-sender-card-editor', SmsSenderCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'sms-sender-card',
  name: 'SMS Sender Card',
  description: 'A configurable card that allows sending SMS messages via Twilio'
});