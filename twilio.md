# Setting Up Twilio with Home Assistant

This guide covers how to integrate your existing Twilio account with the Home Assistant SMS cards.

## Configuring Twilio for SMS in Home Assistant

### Step 1: Get Your Twilio Credentials

1. Log in to your Twilio account at [https://www.twilio.com/console](https://www.twilio.com/console)
2. Note down your **Account SID** and **Auth Token** from the dashboard
3. Find or purchase a phone number that supports SMS

### Step 2: Update Home Assistant Configuration

Replace the placeholders in your `configuration.yaml` with your actual Twilio credentials:

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

### Step 3: Configure Webhook for Incoming SMS

1. In your Twilio console, navigate to Phone Numbers > Manage > Active Numbers
2. Click on your SMS-enabled phone number
3. Scroll down to the "Messaging" section
4. Under "A MESSAGE COMES IN", set the webhook URL to:
   ```
   https://your-home-assistant-url/api/webhook/incoming_sms
   ```
   
   Make sure to use your actual Home Assistant URL. If you're using Nabu Casa, your URL will look like:
   ```
   https://[your-id].ui.nabu.casa/api/webhook/incoming_sms
   ```

5. Set the HTTP method to **POST**

### Step 4: (Optional) Enable Webhook Validation

For added security, you can validate that incoming webhooks are actually from Twilio:

1. Install the `twilio-python` helper library in Home Assistant:
   ```bash
   pip3 install twilio
   ```

2. Modify your Python script to validate the request signature:
   ```python
   from twilio.request_validator import RequestValidator
   
   # Twilio Auth Token
   auth_token = 'YOUR_AUTH_TOKEN'
   validator = RequestValidator(auth_token)
   
   # Validate the request
   request_valid = validator.validate(
       url,
       payload,  # Form data from the request
       signature  # The X-Twilio-Signature header
   )
   
   if not request_valid:
       logger.error("Invalid Twilio request signature")
       return
   
   # Process the message as normal
   ```

## Testing Your Integration

### Test Sending SMS

1. Add the SMS Sender Card to your dashboard
2. Enter a phone number (including country code, e.g., +12025551234)
3. Type a message and click "Send"

### Test Receiving SMS

1. Send a text message to your Twilio phone number
2. The message should appear in your SMS Display Card within a few seconds

## Troubleshooting Twilio-Specific Issues

### SMS Not Sending

- Check your Twilio console for error messages
- Verify your Twilio account has sufficient credit
- Ensure the destination number is in a supported format (e.g., +12025551234)
- Check that your Twilio number has SMS capabilities enabled

### SMS Not Receiving

- Verify the webhook URL in Twilio is correctly pointing to your Home Assistant instance
- Ensure your Home Assistant instance is publicly accessible
- Check Twilio logs for webhook delivery failures
- If using NAT, ensure proper port forwarding is set up

## Integrating with Existing SIP Service

Since you already have a Twilio SIP service, you might want to extend this integration:

1. For call notifications, create a similar webhook for incoming calls
2. You can use Twilio's TwiML to direct calls to your SIP infrastructure
3. Consider using Home Assistant automations to:
   - Flash lights when calls come in
   - Announce calls over media players
   - Log call history in a similar display card

## Advanced: Sending MMS with Twilio

To send MMS (picture messages):

1. Modify the REST command to include media URLs:
   ```yaml
   rest_command:
     send_mms:
       url: "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json"
       method: POST
       content_type: "application/x-www-form-urlencoded"
       username: "YOUR_ACCOUNT_SID"
       password: "YOUR_AUTH_TOKEN"
       payload: "To={{ phone_number }}&From=YOUR_TWILIO_PHONE_NUMBER&Body={{ message }}&MediaUrl={{ media_url }}"
   ```

2. Create a new card or modify the existing one to support uploading or specifying media URLs