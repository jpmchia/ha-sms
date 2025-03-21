const path = require('path');

module.exports = {
  entry: {
    'ha-sms': './src/index.js',
    'sms-sender-card': './src/sms-sender-card.js',
    'sms-display-card': './src/sms-display-card.js'
  },
  mode: 'production',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};