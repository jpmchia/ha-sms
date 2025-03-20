# SMS Cards for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Custom Lovelace cards to send and display SMS messages in Home Assistant, with built-in Twilio integration.

## Features

- **SMS Sender Card**: Send SMS messages directly from your Home Assistant dashboard
- **SMS Display Card**: View received SMS messages in a clean, organized interface
- **Twilio Integration**: Works seamlessly with Twilio's SMS API
- **Customizable**: Style and configure the cards to match your dashboard

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
4. Add the cards to your dashboard

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

### Twilio Setup

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

2. Set up a webhook in Twilio pointing to:
   ```
   https://your-home-assistant-url/api/webhook/incoming_sms
   ```

3. Configure the webhook automation as described in the documentation

### Card Configuration

#### SMS Sender Card
```yaml
type: 'custom:sms-sender-card'
```

#### SMS Display Card
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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Home Assistant community
- Twilio API documentation