# SMS Cards for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Custom Lovelace cards to send and display SMS messages in Home Assistant, with built-in Twilio integration.

## Features

- **SMS Sender Card**: Send SMS messages directly from your Home Assistant dashboard
- **SMS Display Card**: View received SMS messages in a clean, organized interface
- **Twilio Integration**: Works seamlessly with Twilio's SMS API
- **Configurable**: Set up Twilio credentials directly in the card configuration
- **Flexible Usage**: Use either Home Assistant services or direct API calls to Twilio

## Screenshots

![SMS Sender Card](screenshots/sender-card.png)
![SMS Display Card](screenshots/display-card.png)

## Installation

### HACS Installation (Recommended)

1. Make sure you have [HACS](https://hacs.xyz/) installed
2. Add this repository as a custom repository in HACS:
    - Go to HACS > Frontend
    - Click the three dots in the top right corner
    - Select "Custom repositories"
    - Add the URL of this repository
    - Select "Lovelace" as the category
3. Click Install
4. Add the following to your Lovelace resources:
   ```yaml
   resources:
     - url: /hacsfiles/ha-sms/ha-sms.js
       type: module

### Manual Installation

1. Download the `sms-sender-card.js` and `sms-display-card.js` files from the `dist` folder
2. Upload them to your Home Assistant `config/www` directory
3. Add resource references to your Lovelace configuration:
   ```yaml
   resources:
     - url: /local/sms-sender-card.js
       type: module
     - url: /local/sms-display-card.js
       type: module
   ```
4. Add the cards to your dashboard

## Configuration

### Option 1: Direct Twilio API Configuration (Recommended)

Configure Twilio credentials directly in the card configuration:

```yaml
type: 'custom:sms-sender-card'
title: 'Send SMS'
use_service: false
twilio_sid: 'YOUR_ACCOUNT_SID'
twilio_token: 'YOUR_AUTH_TOKEN'
twilio_number: '+12025551234'
```

### Option 2: Home Assistant REST Command

1. Add the following to your `configuration.yaml`:
   ```yaml
   rest_command:
     send_sms:
       url: "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json"
       method: POST
       content_type: "application/x-www-form-urlencoded"
       username: "YOUR_ACCOUNT_SID"
       password: "YOUR_AUTH_TOKEN"
       payload: "To={{ phone_number }}&From=YOUR_TWILIO_PHONE_NUMBER&Body={{ message }}"
   ```

2. Use the card with the service option:
   ```yaml
   type: 'custom:sms-sender-card'
   title: 'Send SMS'
   use_service: true
   ```

### Receiving SMS Messages

To receive SMS messages:

1. Set up a webhook in Twilio pointing to:
   ```
   https://your-home-assistant-url/api/webhook/incoming_sms
   ```

2. Add the following to your `configuration.yaml`:
   ```yaml
   # Add to configuration.yaml
   webhook:

   # Create a sensor to store SMS messages
   sensor:
     - platform: template
       sensors:
         sms_messages:
           value_template: "{{ state_attr('sensor.sms_messages', 'messages') | tojson }}"
           attribute_templates:
             messages: "{{ state_attr('sensor.sms_messages', 'messages') or [] }}"

   # Automation to handle incoming SMS webhook
   automation:
     - alias: "Handle Incoming SMS"
       trigger:
         platform: webhook
         webhook_id: incoming_sms
       action:
         - service: python_script.process_incoming_sms
           data_template:
             payload: "{{ trigger.json }}"
   ```

3. Create the Python script for processing incoming SMS:
   ```python
   # In /config/python_scripts/process_incoming_sms.py
   import datetime
   
   # Get the webhook payload from Twilio
   payload = data.get('payload', {})
   
   # Extract SMS details from Twilio format
   phone_number = payload.get('From', 'Unknown')
   message_content = payload.get('Body', '')
   timestamp = payload.get('DateCreated', datetime.datetime.now().isoformat())
   
   # Get current messages
   current_messages = hass.states.get('sensor.sms_messages').attributes.get('messages', [])
   
   # Add new message
   new_message = {
       'from': phone_number,
       'content': message_content,
       'timestamp': timestamp
   }
   
   # Prepend to list (newest first)
   updated_messages = [new_message] + current_messages
   
   # Limit to last 50 messages to prevent excessive growth
   if len(updated_messages) > 50:
       updated_messages = updated_messages[:50]
   
   # Update the sensor
   hass.states.set('sensor.sms_messages', len(updated_messages), {
       'messages': updated_messages,
       'friendly_name': 'SMS Messages'
   })
   ```

4. Add the SMS Display Card to your dashboard:
   ```yaml
   type: 'custom:sms-display-card'
   entity: sensor.sms_messages
   ```

## Usage

### Sending SMS
1. Enter the recipient's phone number (including country code)
2. Type your message
3. Click "Send"

### Viewing SMS
The SMS Display Card will automatically show incoming messages once your webhook is properly configured.

## Configuration Options

### SMS Sender Card
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| title | string | "Send SMS" | Card title |
| use_service | boolean | true | Whether to use Home Assistant rest_command or direct API call |
| twilio_sid | string | "" | Your Twilio Account SID (only needed if use_service is false) |
| twilio_token | string | "" | Your Twilio Auth Token (only needed if use_service is false) |
| twilio_number | string | "" | Your Twilio Phone Number (only needed if use_service is false) |

### SMS Display Card
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| entity | string | "sensor.sms_messages" | Entity ID for the SMS messages sensor |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Home Assistant community
- Twilio API documentation