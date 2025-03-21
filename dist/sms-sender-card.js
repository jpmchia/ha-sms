(()=>{class e extends HTMLElement{static get properties(){return{config:{type:Object},hass:{type:Object}}}constructor(){super(),this.config={title:"Send SMS",twilio_sid:"",twilio_token:"",twilio_number:"",use_service:!0}}set hass(e){this._hass=e,this.content||(this._createCard(),this.content=!0)}setConfig(e){e.title&&(this.config.title=e.title),e.twilio_sid&&(this.config.twilio_sid=e.twilio_sid),e.twilio_token&&(this.config.twilio_token=e.twilio_token),e.twilio_number&&(this.config.twilio_number=e.twilio_number),void 0!==e.use_service&&(this.config.use_service=e.use_service),this.config={...this.config,...e},this.content&&this._createCard()}_createCard(){this.innerHTML=`\n      <ha-card header="${this.config.title}">\n        <div class="card-content">\n          <paper-input label="Phone Number" id="phone-number"></paper-input>\n          <paper-textarea label="Message" id="message"></paper-textarea>\n        </div>\n        <div class="card-actions">\n          <mwc-button id="send-button">Send</mwc-button>\n        </div>\n      </ha-card>\n    `,this.querySelector("#send-button").addEventListener("click",(()=>{const e=this.querySelector("#phone-number").value,i=this.querySelector("#message").value;e&&i?this._sendSms(e,i):this._showToast("Please enter both phone number and message")}))}_showToast(e){const i=new CustomEvent("hass-notification",{detail:{message:e}});window.dispatchEvent(i)}_sendSms(e,i){this.config.use_service?this._sendViaTwilioService(e,i):this._sendViaTwilioApi(e,i)}_sendViaTwilioService(e,i){this._hass.callService("rest_command","send_sms",{phone_number:e,message:i}).then((()=>{this._showToast("SMS sent successfully"),this._clearForm()})).catch((e=>{this._showToast(`Error sending SMS: ${e.message}`)}))}_sendViaTwilioApi(e,i){if(!this.config.twilio_sid||!this.config.twilio_token||!this.config.twilio_number)return void this._showToast("Twilio credentials not configured. Please update card configuration.");e.startsWith("+")||(e="+"+e);const t=new URLSearchParams;t.append("To",e),t.append("From",this.config.twilio_number),t.append("Body",i);const n=`https://api.twilio.com/2010-04-01/Accounts/${this.config.twilio_sid}/Messages.json`,s=btoa(`${this.config.twilio_sid}:${this.config.twilio_token}`);fetch(n,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",Authorization:`Basic ${s}`},body:t}).then((e=>e.ok?e.json():e.json().then((i=>{throw new Error(i.message||`HTTP error ${e.status}`)})))).then((e=>{this._showToast("SMS sent successfully"),this._clearForm()})).catch((e=>{this._showToast(`Error sending SMS: ${e.message}`)}))}_clearForm(){this.querySelector("#phone-number").value="",this.querySelector("#message").value=""}static getConfigElement(){return document.createElement("sms-sender-card-editor")}static getStubConfig(){return{title:"Send SMS",twilio_sid:"",twilio_token:"",twilio_number:"",use_service:!0}}}customElements.define("sms-sender-card",e);class i extends HTMLElement{setConfig(e){this.config={title:"Send SMS",twilio_sid:"",twilio_token:"",twilio_number:"",use_service:!0,...e}}get value(){return this.config}connectedCallback(){this.rendered||(this.render(),this.rendered=!0)}render(){this.shadowRoot||this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`\n      <style>\n        .form-container {\n          display: grid;\n          grid-template-columns: 1fr;\n          grid-gap: 8px;\n        }\n        .values {\n          padding: 16px;\n        }\n        ha-switch {\n          margin-right: 8px;\n        }\n        .switch-container {\n          display: flex;\n          align-items: center;\n          margin-top: 8px;\n        }\n      </style>\n      <div class="form-container">\n        <paper-input \n          label="Card Title" \n          .value="${this.config.title}" \n          @value-changed="${this._valueChanged}" \n          .configValue="title">\n        </paper-input>\n        \n        <div class="switch-container">\n          <ha-switch\n            .checked=${this.config.use_service}\n            @change="${this._toggleService}"\n          ></ha-switch>\n          <span>Use Home Assistant service (requires rest_command setup)</span>\n        </div>\n        \n        <div class="values" style="display: ${this.config.use_service?"none":"block"}">\n          <paper-input \n            label="Twilio Account SID" \n            .value="${this.config.twilio_sid}" \n            @value-changed="${this._valueChanged}" \n            .configValue="twilio_sid">\n          </paper-input>\n          \n          <paper-input \n            label="Twilio Auth Token" \n            .value="${this.config.twilio_token}" \n            @value-changed="${this._valueChanged}" \n            .configValue="twilio_token"\n            type="password">\n          </paper-input>\n          \n          <paper-input \n            label="Twilio Phone Number" \n            .value="${this.config.twilio_number}" \n            @value-changed="${this._valueChanged}" \n            .configValue="twilio_number"\n            placeholder="+12025551234">\n          </paper-input>\n        </div>\n      </div>\n    `}_toggleService(e){if(!this.config)return;const i=e.target.checked;this.config={...this.config,use_service:i},this.shadowRoot.querySelector(".values").style.display=i?"none":"block",this._fireEvent()}_valueChanged(e){if(!this.config||!e.target)return;const i=e.target.configValue;i&&(this.config={...this.config,[i]:e.detail.value},this._fireEvent())}_fireEvent(){const e=new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0});this.dispatchEvent(e)}}customElements.define("sms-sender-card-editor",i),window.customCards=window.customCards||[],window.customCards.push({type:"sms-sender-card",name:"SMS Sender Card",description:"A configurable card that allows sending SMS messages via Twilio"})})();