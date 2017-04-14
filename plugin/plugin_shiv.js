

(function() {
    
    $(window).bind('hashchange', function() {
        showHideButton();
    });

    let overlay = undefined;

    function showHideButton() {
        $(".validateButton").remove();
        let url = window.location.href;
        if (url.startsWith("https://developer.amazon.com/edw/home.html#/skill/")) {
            $("body").append(validateButton);
        }
        console.log(url);
    }

    
    let validateButton = $('<button class="validateButton">Validate Skill</button>');


    $(validateButton).click(function() {
        getAllSkills(function(data) {

            let status = [];

            let skills = data;
            console.log(skills);

            let skillInfo = getSkillAndLocale();
            let type = skillInfo.type;

            console.log(skillInfo);


            let skill = undefined;
            for (let i = 0; i < skills.length; i++) {
                if (skills[i].skillId === skillInfo.skillId && skills[i].stage.toLowerCase() === type.toLowerCase()) {
                    skill = skills[i];
                    break;
                }
            }
            if (skill) {
                console.log("Skill Found: " + skill.skillId);
                console.log(skill);

                let invocationNames = getInvocationNames(skill);

                for (let locale in invocationNames) {
                    if (!invocationNames.hasOwnProperty(locale)) {
                        continue;
                    } //property is from prototype, skip

                    let localeTests = {
                        "name": locale,
                        "complete": false
                    }

                    status.push(localeTests);

                    getSkillDetails(skill.skillId, locale, function(data) {


                        let metadata = getMetadata(skill, locale);
                        let interactionModel = getInteractionModel(data);


                        setTimeout(function() {
                            validateInteractionModel(metadata, interactionModel, locale, null, function(result) {
                                    console.log(result);
                                    localeTests.complete = true;
                                    localeTests.result = result;
                                    showProgress(status);
                                },
                                function(current, total, name) {
                                    localeTests.current = current;
                                    localeTests.total = total;
                                    localeTests.currentTest = name;
                                    showProgress(status);
                                });
                        }, 1);
                    });



                }


            } else {
                throw new ReferenceError("Could not find skill.");
            }
        });



        function showProgress(status) {
            let html = "";

            for (let x = 0; x < status.length; x++) {

                

                let response = status[x].result;

                if (status[x].complete) {
                    html += "<h1>" + status[x].name.toUpperCase() + "</h1>\n";

                    html += "<h2>TESTS</h2>\n<ul>\n";
                    for (let i = 0; i < response.tests.length; i++) {
                        let test = response.tests[i];
                        let status = "pass";
                        if (test.toLowerCase().indexOf("warn") > -1) {
                            status = "warn";
                        } else if (test.toLowerCase().indexOf("fail") > -1) {
                            status = "fail";
                        }
                        html += "<li class='" + status + "'>" + response.tests[i] + "</li>\n";
                    }
                    html += "</ul>";

                    html += "<h2>ERRORS</h2>";
                    for (let i = 0; i < response.errors.length; i++) {
                        let error = response.errors[i];
                        html += "<h3>" + error.name + "</h3>\n";
                        html += "<i>" + error.description + "</i><br>\n";
                        html += "\n<ul>\n";
                        for (let j = 0; j < error.items.length; j++) {
                            html += "<li>" + error.items[j] + "</li>\n";
                        }
                        html += "</ul>\n";
                    }
                    html += "<h2>WARNINGS</h2>\n";
                    for (let i = 0; i < response.warnings.length; i++) {
                        let warning = response.warnings[i];
                        html += "<h3>" + warning.name + "</h3>\n";
                        html += "<i>" + warning.description + "</i><br>\n";
                        html += "\n<ul>\n";
                        for (let j = 0; j < warning.items.length; j++) {
                            html += "<li>" + warning.items[j] + "</li>\n";
                        }
                        html += "</ul>\n";
                    }
                } else {
                    let addition = "<h1>" + status[x].name.toUpperCase() + "</h1>\n";
                    addition += "Running: " + status[x].currentTest + "<br>\n";
                    let percent = (status[x].total > 0) ? status[x].current / status[x].total * 100 : 0;
                    addition += "<div class = 'percentBarHolder'><div style='width: " + percent + "%;' class = 'percentBar'></div></div><br>";
                    html = addition + html;
                }

            }

            showDialog(html);
        }

        function showDialog(html) {
            if ($("#testResults").length < 1) {
                let overlay = $('<div id="validateModal">' +
                    '<div onClick="event.stopPropagation();" id = "backing">' +
                    '<span id = "closeButton">X</span>' +
                    '<button id = "copyButton">Copy</button>' +
                    '<div id = "testResults"></div></div></div>');

                $(overlay).click(function(event) {
                    running = false;
                    $("#validateModal").remove();
                    event.stopPropagation();
                });

                $(overlay).find("#closeButton").click(function(event) {
                    running = false;
                    $("#validateModal").remove();
                    event.stopPropagation();
                });


                $(overlay).find("#copyButton").click(function(event) {

                    let selectText = function(element) {
                        var doc = document,
                            text = doc.getElementById(element),
                            range, selection;

                        if (doc.body.createTextRange) {
                            range = document.body.createTextRange();
                            range.moveToElementText(text);
                            range.select();
                        } else if (window.getSelection) {
                            selection = window.getSelection();
                            range = document.createRange();
                            range.selectNodeContents(text);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }
                    };

                    selectText("testResults");
                    document.execCommand("copy");
                    alert("Results Copied");
                    if (window.getSelection) {
                        selection = window.getSelection();
                        selection.removeAllRanges();
                    }

                    event.stopPropagation();
                });

                $("body").append(overlay);
            }
            $("#testResults").html(html);
        }

        function getSkillAndLocale() {

            let urlRegexDevelopment = /skill\/([^/]+)\/([^/?]+)\//g;
            let urlRegexLive = /skill\/live\/([^/]+)\/([^/?]+)\//g;
            let urlRegexCert = /skill\/cert\/([^/]+)\/([^/?]+)\//g;
            let url = window.location.href;
            let matches = urlRegexLive.exec(url);
            let type = "Live";
            if(!matches){
                matches = urlRegexCert.exec(url);
                if(matches){
                    type = "Certification";
                }
            }
            if (!matches) {
                matches = urlRegexDevelopment.exec(url);
                if(matches){
                    type = "Development";
                }
            }
            if (!matches) {
                throw Error("URL doesn't match expected value.");
            }
            if (matches.length > 2) {
                return {
                    "skillId": matches[1],
                    "locale": matches[2],
                    "type": type
                }
            }

            return null;
        }

        function getAllSkills(callback) {
            $.get("https://developer.amazon.com/edw/ajax/ask/getApps", function(data) {
                callback(data);
            });
        }

        function getSkillDetails(skillId, locale, callback) {
            $.get("https://developer.amazon.com/edw/ajax/ask/getLastSavedModelDef" +
                "?appId=" + skillId +
                "&locale=" + locale +
                "&stage=Development",
                function(data) {
                    callback(data);
                });
        }

        function getInvocationNames(skill) {
            if(skill.skillDefinition.customInteractionModelInfo){
                return skill.skillDefinition.customInteractionModelInfo.invocationNameByLocale ||
                skill.skillDefinition.smartHomeInfo.partnerSpokenName;
            }
            return null;
        }


        function getMetadata(skill, locale) {
            let metadata = {
                "invocationName": skill.skillDefinition.customInteractionModelInfo.invocationNameByLocale[locale]
            };
            let publishingInfo = skill.skillDefinition.multinationalPublishingInfo.publishingInfoByLocale[locale];
            for (let prop in publishingInfo) {
                if (!publishingInfo.hasOwnProperty(prop)) {
                    continue;
                } //property is from prototype, skip
                metadata[prop] = publishingInfo[prop];
            }
            metadata.accountLinkingInfo = skill.skillDefinition.accountLinkingInfo || {};
            return metadata;
        }

        function getInteractionModel(skillDetails) {
            let interactionModel = {};
            try {
                interactionModel.intents = JSON.parse(skillDetails.modelDef.models).intents;
            } catch (e) {
                interactionModel.intents = [];
                console.warn(e);
            }
            interactionModel.utterances = skillDetails.modelDef.testCases.trim().split("\n") || [];
            for(let i = interactionModel.utterances.length - 1; i >= 0; i--){
                let utterance = interactionModel.utterances[i];
                if(!utterance || utterance.length < 1){
                    interactionModel.utterances.splice(i, 1);
                }
            }
            interactionModel.slots = skillDetails.modelDef.catalogs || [];
            for (let i = 0; i < interactionModel.slots.length; i++) {
                let slot = interactionModel.slots[i];
                let newSlot = {
                    "name": slot.name,
                    "values": []
                };
                for (let j = 0; j < slot.values.length; j++) {
                    newSlot.values.push(slot.values[j].name.value);
                }
                interactionModel.slots[i] = newSlot;
            }

            return interactionModel;
        }
    });


})();