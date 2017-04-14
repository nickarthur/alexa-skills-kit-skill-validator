//if they've already been loaded, don't load them again
if(!getHashOfIntents){
    /*
     * Clean up an utterance
     */
    function normalizeUtterance(utterance){
        //replace all whitespace with spaces
        utterance = utterance.replaceAll(/\s{2,}/, " ");
        //remove all non-word items
        utterance = utterance.replace(/[^\w\s{}]/gi, "");
        utterance = utterance.trim();
        return utterance;
    }

    /*
     * Function to see if a GET request to a URL resolves correctly.
     * url: URL of get request
     * callback: function(bool success, str err);
     */
    function getRequestResolves(url, callback){
        url = url.trim();
        url ="www.google.com";
        if(!url.toLowerCase().startsWith("http")){
            url = "https://" + url;
        }
        url = url.replace("http://","https://");

        console.log("    URL: '" + url + "'");

        var req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.onreadystatechange = function() {
          if (req.readyState == 4) {
            if (req.status == 200) {
                mCallback(true, null);
            }else{
                callback(false, "Non-200 status code: " + req.status);
            }
          }
        };
        req.send();
    }

    /*
     * Get a hash (object) of all intents with the model:
     * IntentName : { <INTENT> };
     */
    function getHashOfIntents(interactionModel){
        let intents = interactionModel.intents;
        let output = {};
        if(intents){
            for(let i = 0; i < intents.length; i++){
                let intent = intents[i];
                output[intent.intent] = intent;
            }
        }
        return output;
    }

    /*
     * Get a hash (object) of all utterances with the model:
     * IntentName : [ <UTTERANCES> ]
     */
    function getHashOfUtterances(interactionModel){
        let utterances = interactionModel.utterances;
        let output = {};
        if(utterances){
            for(let i = 0; i < utterances.length; i++){
                let str = utterances[i];
                str = str.trim();
                [key, value] = str.match(/^(\S+)\s(.*)/).slice(1);
                key = key.trim();
                value = value.trim();
                if(!output[key]){
                    output[key] = [];
                }
                output[key].push(value);
            }
        }
        return output;
    }

    /*
     * Get an array of all utterances
     * 
     */
    function getArrayOfUtterances(interactionModel){
        let utterances = interactionModel.utterances;
        let output = [];
        if(utterances){
            for(let i = 0; i < utterances.length; i++){
                let str = utterances[i];
                str = str.trim();
                let value = str.substr(str.indexOf(' ')+1).trim(); // Utterance
                output.push(value);
            }
        }
        return output;
    }

    /*
     * Get the utterances by intent with their slot type replaced with slot name
     *
     */
    function getSlotReplacedHashOfUtterances(interactionModel){
        let intents = getHashOfIntents(interactionModel);
        let utterances = getHashOfUtterances(interactionModel);
        //go through each one of the intents, check if they match in utterances based on the calculations above
        for(let intentProp in intents){
            if(!intents.hasOwnProperty(intentProp)){ continue; } //property is from prototype, skip
            let intent = intents[intentProp];
            let intentSlots = intent.slots;
            let intentUtterances = utterances[intentProp];
            if(intentUtterances){
                for(let i = 0; i < intentUtterances.length; i++){
                    let utterance = intentUtterances[i];

                    let replacedUtterance = utterance;
                    //if we have intent slots, replace all the SlotNames with SlotTypes
                    if(intentSlots){
                        for(let j = 0; j < intentSlots.length; j++){
                            let slot = intentSlots[j];
                            replacedUtterance = replacedUtterance.replaceAll("{" + slot.name + "}","{" + slot.type + "}");
                        }
                        intentUtterances[i] = replacedUtterance;
                    }
                }
            }
        }
        return utterances;            
    }

    /*
     * Get the slot replaced sorted utterances without intent name
     *
     */
     function getSlotReplacedArrayOfUtterances(interactionModel){
        let intents = getSlotReplacedHashOfUtterances(interactionModel);
        let output = [];
        for(let intentProp in intents){
            if(!intents.hasOwnProperty(intentProp)){ continue; } //property is from prototype, skip
            let intent = intents[intentProp];
            for(let i = 0; i < intent.length; i++){
                output.push(intent[i]);
            }
        }
        return output;
     }

    /*
     * Get a hash (object) of all slots with the model:
     * SlotType : [ <VALUES> ]
     */
    function getHashOfSlots(interactionModel){
        let slots = interactionModel.slots;
        let output = {};
        for(let i = 0; i < slots.length; i++){
            let slot = slots[i];
            output[slot.name] = slot;
        }
        return output;
    }

    /*
     * Check whether the skill has account linking
     * true/false
     */
    function skillHasAccountLinking(skillInformation){
        return (skillInformation.metadata &&
            skillInformation.metadata.skillDefinition &&
            skillInformation.metadata.skillDefinition.accountLinkingInfo &&
            skillInformation.metadata.skillDefinition.accountLinkingInfo.supportsLinking);
    }

     function getUtteranceValidCharactersRegex(locale){
        //this can be extended to support other locales
        switch(locale.toLowerCase()){
            case "de_de":
                return /[^\w'.,\-{}\sßäëïöü]/;
            default:
                return /[^\w'.,\-{}\s]/;
        }

    }

    function getExamplePhraseValidCharactersRegex(locale){
        //this can be extended to support other locales
        switch(locale.toLowerCase()){
            case "de_de":
                return /[^\w\s.?:,'-ßäëïöü]/gmi;
            default:
                return /[^\w\s.?:,'-]/gmi;
        }

    }

    function getConnectorWordRegex(locale){
        //this can be extended to support other locales
        switch(locale.toLowerCase()){
            default:
                return /^(from|to|about|for|if|whether|that|and)/i;
        }
        
    }
    function getWakeWordRegex(locale){
        //this can be extended to support other locales
        switch(locale.toLowerCase()){
            default:
                return /Alexa|Echo|Computer|Amazon/gi;
        }
    }

    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };
}
