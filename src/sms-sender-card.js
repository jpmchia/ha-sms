class SmsSenderCard extends HTMLElement {
    set hass(hass) {
      if (!this.content) {
        // Initialize the card content
        this.innerHTML = `
          <ha-card header="Send SMS">
            <div class="card-content">
              <paper-input label="Phone Number" id="phone-number"></paper-input>
              <paper-textarea label="Message" id="message"></paper-textarea>
            </div>
            <div class="card-actions">
              <mwc-button id="send-button">Send</mwc-button>
            </div>
          </ha-card>
        `;
        
        this.content = true;
        
        // Add event listener for the send button
        this.querySelector('#send-button').addEventListener('click', () => {
          const phoneNumber = this.querySelector('#phone-number').value;
          const message = this.querySelector('#message').value;
          
          if (!phoneNumber || !message) {
            this._showToast('Please enter both phone number and message');
            return;
          }
          
          this._sendSms(hass, phoneNumber, message);
        });
      }
    }
    
    // Method to show toast notification
    _showToast(message) {
      const event = new CustomEvent('hass-notification', {
        detail: { message }
      });
      window.dispatchEvent(event);
    }
    
    // Method to send SMS via Home Assistant service
    _sendSms(hass, phoneNumber, message) {
      // This will call your custom service in Home Assistant
      hass.callService('rest_command', 'send_sms', {
        phone_number: phoneNumber,
        message: message
      }).then(() => {
        this._showToast('SMS sent successfully');
        // Clear the form
        this.querySelector('#phone-number').value = '';
        this.querySelector('#message').value = '';
      }).catch(error => {
        this._showToast(`Error sending SMS: ${error.message}`);
      });
    }
    
    // Define card configuration
    static getConfigElement() {
      return document.createElement('sms-sender-card-editor');
    }
    
    static getStubConfig() {
      return {};
    }
  }
  
  customElements.define('sms-sender-card', SmsSenderCard);
  
  // Add editor if needed for configuration
  class SmsSenderCardEditor extends HTMLElement {
    setConfig(config) {
      this.config = config;
    }
    
    get value() {
      return this.config;
    }
    
    render() {
      // Simple editor with no configuration options for now
      return html`<p>No configuration options available</p>`;
    }
  }
  
  customElements.define('sms-sender-card-editor', SmsSenderCardEditor);
  
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'sms-sender-card',
    name: 'SMS Sender Card',
    description: 'A card that allows sending SMS messages'
  });