# alexa-skills-kit-skill-validator

## Introduction
The Skill Validator is a skill validation tool that checks for errors and warnings in an Alexa custom skill’s language model and skill metadata. It can be used from the developer dashboard (https://developer.amazon.com). While it can’t check for everything that will cause a skill to fail certification or all factors that create a poor customer experience, it checks for the low-hanging fruit.

The goal for this project is to add more transparency to the developer process and add another self-service tool to a developer's toolbelt while they create custom Alexa skills. A skill is not required to pass all these tests to be submitted for certification.

Most of the tests come from the [Ask Submission Checklist](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-submission-checklist).

## Installation
### GreaseMonkey/TamperMonkey (Easiest)
Copy and paste this code into a new GreaseMonkey user script:
https://github.com/alexa/alexa-skills-kit-skill-validator/blob/mainline/output/greasemonkey.js

### Browser Extensions
#### Chrome (this will be disabled every time you restart Chrome)
* Download the extension: https://github.com/alexa/alexa-skills-kit-skill-validator/blob/mainline/output/chrome_ask_validator.crx
* Navigate to `chrome://extensions/`
* Drag and drop the .crx file into the tab
* Accept the permissions 
#### Firefox
* Download the extension: https://github.com/alexa/alexa-skills-kit-skill-validator/blob/mainline/output/firefox_ask_validator.xpi
* Navigate to `about:config`
* Search for xpinstall.signatures.required and set to “false”
* Navigate to Menu > Add-ons
* Drag and drop the .xpi file into the tab
* Accept the permissions

## Usage
* In the developer portal, when editing a skill, a button appears bottom right with the text “Validate Skill.”
* As the tests, run a modal will pop up with progress status.
* Check the detailed results against your language model and metadata.
* Errors may cause a skill to fail certification; fixed warnings will generally improve the customer experience.

## Known Issues
* False positives are possible across tests, verify against documentation where available--open an issue with examples.
* Limited support for non-English skills (can you help write these REGEX?).
* No checking for built-in slot and custom slot utterance collision—or for where slots collide with utterance plain text.
* This is not a complete battery of tests.

## Additions/Fixes/Bug Reports/Questions
* If you know how to fix an issue that you run into and/or would like to add an SLU/other test, submit a pull request for the code base.
* Otherwise [open an issue](https://github.com/alexa/alexa-skills-kit-skill-validator/issues/new)