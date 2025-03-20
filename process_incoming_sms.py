
 import datetime
    
# Get the webhook payload from Twilio
# Twilio sends form data, not JSON
payload = data.get('payload', {})

# Extract SMS details from Twilio format
phone_number = payload.get('From', 'Unknown')
message_content = payload.get('Body', '')
# Twilio uses SmsStatus and DateCreated fields
sms_status = payload.get('SmsStatus', 'received')
# Use current time if DateCreated isn't provided
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