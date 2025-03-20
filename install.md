# SMS Integration for Home Assistant

This guide walks you through setting up SMS functionality in Home Assistant with custom cards for sending and displaying messages.

## Prerequisites

- Home Assistant installation (version 2021.12 or newer recommended)
- Access to your Home Assistant configuration files
- An SMS API provider account (e.g., Twilio, Vonage, MessageBird)
- A publicly accessible URL for your Home Assistant instance (for receiving webhooks)

## Installation Steps

### 1. Install HACS (Home Assistant Community Store)

If you don't have HACS installed yet:
1. Follow the [HACS installation guide](https://hacs.xyz/docs/installation/manual)
2. Restart Home Assistant after installation

### 2. Create Custom Card Files

1. Create a new directory in your Home Assistant config directory:
```
mkdir -p /config/www/community/sms-cards
```

2. Create the SMS sender card file:
```
nano /config/www/community/sms-cards/sms-sender-card.js
```
Copy and paste the contents of the SMS Sender Card file.

3. Create the SMS display card file:
```
nano /config/www/community/sms-cards/sms-display-card.js
```
Copy and paste the contents of the SMS Display Card file.

### 3. Update Configuration Files

1. Add the REST command configuration to your `configuration.yaml`:
```
nano /config/configuration.yaml
```
Add the REST command configuration, updating the URL and API key with your SMS provider details.

2. Add the webhook and sensor configuration to your configuration files.

3. Create the Python script for processing incoming SMS:
```
mkdir -p /config/python_scripts
nano /config/python_scripts/process_incoming_sms.py
```
Copy and paste the Python script content.

### 4. Configure Your Lovelace Dashboard

1. Go to your Home Assistant dashboard
2. Click the three dots menu (⋮) in the top right
3. Select "Edit Dashboard"
4. Click the "+" button to add a new card
5. Scroll down to "Manual" and add the following YAML:

```yaml
# For SMS Sender Card
type: 'custom:sms-sender-card'

# For SMS Display Card
type: 'custom:sms-display-card'
entity: sensor.sms_messages
```

### 5. Configure Your SMS Provider

1. Log in to your SMS provider's account
2. Set up a webhook endpoint for incoming SMS
3. Configure it to forward to your Home Assistant webhook URL:
```
https://your-home-assistant-url/api/webhook/incoming_sms
```

### 6. Restart Home Assistant

After making all these changes, restart Home Assistant to apply them:
1. Go to Configuration > Server Controls
2. Click "Restart"

## Troubleshooting

### Card Not Loading
- Check browser console for JavaScript errors
- Verify file paths and permissions
- Try clearing browser cache

### SMS Not Sending
- Verify your API key and URL in the REST command
- Check Home Assistant logs for service call errors
- Test your SMS API directly to ensure it's working

### SMS Not Receiving
- Ensure your webhook is publicly accessible
- Verify your SMS provider is correctly configured
- Check Home Assistant logs for webhook triggers

## Customization Options

### SMS Sender Card
- Customize the card styling by modifying the CSS in the JavaScript file
- Add additional fields like templates or quick-send buttons

### SMS Display Card
- Modify the display format in the `_renderMessages` function
- Add sorting options or search functionality

## Advanced: Adding Authentication

For added security when receiving webhook calls:

1. Generate a secret token
2. Add it to your webhook configuration
3. Configure your SMS provider to include this token
4. Modify the Python script to validate the token