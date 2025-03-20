HACS Repository Structure

home-assistant-sms-cards/
├── dist/
│   ├── sms-sender-card.js       # Production/minified version
│   └── sms-display-card.js      # Production/minified version
├── src/
│   ├── sms-sender-card.js       # Source code
│   └── sms-display-card.js      # Source code
├── .github/
│   └── workflows/
│       └── validate.yml         # Optional: CI validation
├── .gitignore
├── LICENSE                      # Required: License file (MIT, Apache, etc.)
├── README.md                    # Required: Documentation
├── hacs.json                    # Required: HACS manifest
└── info.md                      # Optional: Info displayed in HACS