class SmsDisplayCard extends HTMLElement {
    constructor() {
      super();
      this.messages = [];
    }
    
    set hass(hass) {
      this._hass = hass;
      
      if (!this.content) {
        this.innerHTML = `
          <ha-card header="SMS Messages">
            <div class="card-content">
              <div id="messages-container" style="max-height: 300px; overflow-y: auto;"></div>
            </div>
          </ha-card>
        `;
        this.content = true;
        this.messagesContainer = this.querySelector('#messages-container');
      }
      
      // Get messages from sensor data
      this._updateMessages(hass);
    }
    
    setConfig(config) {
      if (!config.entity) {
        throw new Error('You need to define an entity');
      }
      this.config = config;
    }
    
    _updateMessages(hass) {
      // Get the entity_id from config
      const entityId = this.config.entity;
      
      if (!entityId || !hass.states[entityId]) {
        this.messagesContainer.innerHTML = 'Entity not found';
        return;
      }
      
      try {
        // Get messages from entity state
        // Assuming messages are stored as JSON in the entity's state
        const messageData = JSON.parse(hass.states[entityId].state);
        
        if (!Array.isArray(messageData)) {
          this.messagesContainer.innerHTML = 'Invalid message data format';
          return;
        }
        
        // Only update the DOM if messages have changed
        if (JSON.stringify(messageData) !== JSON.stringify(this.messages)) {
          this.messages = messageData;
          this._renderMessages();
        }
      } catch (e) {
        this.messagesContainer.innerHTML = `Error parsing message data: ${e.message}`;
      }
    }
    
    _renderMessages() {
      // Clear container
      this.messagesContainer.innerHTML = '';
      
      if (this.messages.length === 0) {
        const emptyElement = document.createElement('div');
        emptyElement.innerText = 'No messages';
        this.messagesContainer.appendChild(emptyElement);
        return;
      }
      
      // Add messages in reverse order (newest first)
      this.messages.slice().reverse().forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.style.padding = '8px';
        messageElement.style.marginBottom = '8px';
        messageElement.style.borderLeft = '3px solid var(--primary-color)';
        messageElement.style.backgroundColor = 'var(--secondary-background-color)';
        
        messageElement.innerHTML = `
          <div style="font-weight: bold;">${message.from || 'Unknown'}</div>
          <div>${message.content}</div>
          <div style="font-size: 0.8em; color: var(--secondary-text-color);">
            ${new Date(message.timestamp).toLocaleString()}
          </div>
        `;
        
        this.messagesContainer.appendChild(messageElement);
      });
    }
    
    // Define card configuration
    static getConfigElement() {
      return document.createElement('sms-display-card-editor');
    }
    
    static getStubConfig() {
      return {
        entity: 'sensor.sms_messages'
      };
    }
  }
  
  customElements.define('sms-display-card', SmsDisplayCard);
  
  // Add editor for configuration
  class SmsDisplayCardEditor extends HTMLElement {
    setConfig(config) {
      this.config = config || {
        entity: ''
      };
    }
    
    get value() {
      return this.config;
    }
    
    render() {
      return html`
        <paper-input
          label="Entity ID"
          .value=${this.config.entity}
          @value-changed=${this._valueChanged}
        ></paper-input>
      `;
    }
    
    _valueChanged(ev) {
      if (!this.config) {
        return;
      }
      
      this.config = {
        ...this.config,
        entity: ev.target.value
      };
      
      const configEvent = new CustomEvent('config-changed', {
        detail: { config: this.config }
      });
      this.dispatchEvent(configEvent);
    }
  }
  
  customElements.define('sms-display-card-editor', SmsDisplayCardEditor);
  
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'sms-display-card',
    name: 'SMS Display Card',
    description: 'A card that displays received SMS messages'
  });