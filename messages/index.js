/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://aka.ms/abs-node-waterfall
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
// var pdfFiller = require('pdffiller');
var useEmulator = (process.env.NODE_ENV == 'development');
var dashbot = require('dashbot')('W8wcbHLZu8ECDLKqhPBfKRTf5prKYBtI7p3oQAn8').generic;

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
var userId;
var conversationId;

var promptChoices = {
    "yes": true,
    "no": false
};

var paymentFrequencyChoice = {
    "weekly": 1,
    "bi-weekly": 2,
    "month": 4
};

bot.localePath(path.join(__dirname, './locale'));
bot.set(`persistUserData`, true);
bot.dialog('/', [
    function (session) {
        logIncomingMessage(session.userData);
        var message = "What is your name?";
        logOutgoingMessage(message);
        builder.Prompts.text(session, message, {
            speak: message,
            retrySpeak: message
        });
    },
    function (session, results) {
        session.userData.name = results.response;
        logIncomingMessage(results.response);
        var message = "Hi " + session.userData.name + ". I'm here to help you with filling W-4 form! You just need to answer couple of quesitons!";
        logOutgoingMessage(message);
        session.send(message);
        var message = 'What is your lastname?';
        logOutgoingMessage(message);
        builder.Prompts.text(session, message);
    },
    function (session, results) {
        session.userData.lastname = results.response;
        logIncomingMessage(results.response);
        var message = "Is your name is different than on SSN?";
        var options = "yes |no";
        logOutgoingMessage(message);
        builder.Prompts.choice(session, message, promptChoices, {
            listStyle: builder.ListStyle.button
        });
        session.userData.isLastnameDiff = results.response;
    },
    function (session, results) {
        session.userData.isLastnameDiff = promptChoices[results.response.entity];
        logIncomingMessage(results.response.entity);
        var message = "What is your street addres?";
        logOutgoingMessage(message);
        builder.Prompts.text(session, message);
    },
    function (session, results) {
        session.userData.address = results.response;
        logIncomingMessage(results.response);
        var message = "What is your city?";
        logOutgoingMessage(message);
        builder.Prompts.text(session, message);
    },
    function (session, results) {
        session.userData.city = results.response;
        logIncomingMessage(results.response);
        var message = "What is your state?";
        logOutgoingMessage(message);
        builder.Prompts.text(session, message);
    },
    function (session, results) {
        session.userData.state = results.response;
        logIncomingMessage(results.response);
        var message = "What is your zipcode?";
        logOutgoingMessage(message);
        builder.Prompts.text(session, message);
    },
    function (session, results) {
        session.userData.zip = results.response;
        logIncomingMessage(results.response);
        var message = "How frequently are you paid?";
        builder.Prompts.choice(session, message, paymentFrequencyChoice, {
            listStyle: builder.ListStyle.button
        });
        logOutgoingMessage(message);
    },
    function (session, results) {
        session.userData.paymentFrequency = paymentFrequencyChoice[results.response.entity];
        logIncomingMessage(results.response.entity);
        var message = "Do you have more than 1 jobs?";
        logOutgoingMessage(message);
        builder.Prompts.choice(session, message, promptChoices, {
            listStyle: builder.ListStyle.button
        });
    },
    function (session, results) {
        session.userData.hasMultipleJobs = promptChoices[results.response.entity];
        logIncomingMessage(results.response.entity);
        var message = "Are you married?";
        logOutgoingMessage(message);
        builder.Prompts.choice(session, message, promptChoices, {
            listStyle: builder.ListStyle.button
        });
    },
    function (session, results) {
        session.userData.isMarried = promptChoices[results.response.entity];
        logIncomingMessage(results.response.entity);
        session.send(session.userData.isMarried.toString());

        session.send(typeof session.userData.isMarried === 'boolean');
        if (session.userData.isMarried) {
            logIncomingMessage(results.response.entity);
            var message = "Are you filling jointly?";
            logOutgoingMessage(message);
            builder.Prompts.choice(session, message, promptChoices, {
                listStyle: builder.ListStyle.button
            });
        } else {
            session.userData.isFillingJointly = false;
            next();
        }
    },
    function (session, results) {
        if (session.userData.isMarried) {
            session.userData.isFillingJointly = promptChoices[results.response.entity];
            logIncomingMessage(results.response.entity);
            var message = "Is your spouse working?";
            logOutgoingMessage(message);
            builder.Prompts.choice(session, message, promptChoices, {
                listStyle: builder.ListStyle.button
            });
        } else {
            session.userData.hasWorkingSpouse = false;
            next();
        }
    },
    function (session, results) {
        if (results.response) {
            session.userData.hasWorkingSpouse = promptChoices[results.response.entity];
        } else {
            if (!session.userData.isMarried) {
                session.userData.isFillingJointly = promptChoices[results.response.entity];
                logIncomingMessage(results.response.entity);
                var message = "Are you spending more than 50% of you income to support home for yourself and your and dependents?";
                logOutgoingMessage(message);
                builder.Prompts.choice(session, message, promptChoices, {
                    listStyle: builder.ListStyle.button
                });
            } else {
                session.userData.isFillingJointly = false;
                next();
            }
        }
    },
    function (session, results) {
        if (!session.userData.isMarried) {
            session.userData.isFillingJointly = promptChoices[results.response.entity];
            logIncomingMessage(results.response.entity);
        }
        var message = "How many kids do you have?";
        logOutgoingMessage(message);
        builder.Prompts.number(session, message);
    },
    function (session, results) {
        session.userData.numberOfKids = results.response;
        logIncomingMessage(results.response);
        var message = "What is your first job income?";
        logOutgoingMessage(message);
        builder.Prompts.number(session, message);
    },
    function (session, results) {
        session.userData.income_first = results.response;
        logIncomingMessage(results.response);
        if (session.userData.isMarried) {
            var message = "Do your spouce work? If yes what is her/his income?";
            logOutgoingMessage(message);
            builder.Prompts.number(session, message);
        } else {
            next();
        }
    },
    function (session, results) {
        if (results.response) {
            session.userData.income_second = results.response;
        } else {
            if (session.userData.hasMultipleJobs) {
                var message = "What is your second job income?";
                logOutgoingMessage(message);
                builder.Prompts.number(session, message);
            } else {
                session.userData.income_second = 0;
                next();
            }
        }
    },
    function (session, results) {
        if (!session.userData.income_second && results.response) {
            session.userData.income_second = results.response;
        }
        var message = "How many dependents do you have other than kid dependents?";
        logOutgoingMessage(message);
        builder.Prompts.number(session, message);
    },
    function (session, results) {
        session.userData.numberOfOtherDependents = results.response;
        if (session.userData.numberOfKids > 0) {
            var message = "Do you plan to spend more than 2000 on child care?";
            logOutgoingMessage(message);
            builder.Prompts.text(session, message);
        } else {
            session.userData.dependentCare = 0;
            next();
        }
    },
    function (session, results) {
        if (results.response) {
            session.userData.dependentCare = results.response;
        }
        var message = "Can someone claim you as dependent?";
        logOutgoingMessage(message);
        builder.Prompts.choice(session, message, promptChoices, {
            listStyle: builder.ListStyle.button
        });
    },

    function (session, results) {
        session.userData.isDependent = promptChoices[results.response.entity];
        logIncomingMessage(results.response.entity);
        var message = `Thank you ${session.userData.name}! Let me know if you need help!`;
        session.endDialog();
    },
])

bot.dialog('people', [
        function (session, results) {
            var message = "How many people are in your party?";
            logOutgoingMessage(message);
            builder.Prompts.text(session, message);
        },

        function (session, results) {
            logIncomingMessage(results.response);
            session.endDialogWithResult(results);
        }
    ])
    .beginDialogAction('partySizeHelpAction', 'partySizeHelp', {
        matches: /^help$/i
    });

// Context Help dialog for party size
bot.dialog('partySizeHelp', function (session, args, next) {
    var msg = "Party size help: Our restaurant can support party sizes up to 150 members.";
    session.endDialog(msg);
})

bot.dialog('children', [
        function (session) {
            builder.Prompts.text(session, "How many children do you have?");
        },

        function (session, results) {
            session.send("Thanks!");
        }
    ])
    .triggerAction({
        matches: /^children$/i,
        confirmPrompt: "This will cancel your current request. Are you sure?"
    });



var menuItems = {
    "Order dinner": {
        item: "orderDinner"
    },
    "Dinner reservation": {
        item: "dinnerReservation"
    },
    "Schedule shuttle": {
        item: "scheduleShuttle"
    },
    "Request wake-up call": {
        item: "wakeupCall"
    },
}


bot.dialog("mainMenu", [
        function (session) {
            builder.Prompts.choice(session, "Main Menu:", menuItems);
        },
        function (session, results) {
            if (results.response) {
                session.beginDialog(menuItems[results.response.entity].item);
            }
        }
    ])
    .triggerAction({
        // The user can request this at any time.
        // Once triggered, it clears the stack and prompts the main menu again.
        matches: /^main menu$/i,
        confirmPrompt: "This will cancel your request. Are you sure?"
    });

function logOutgoingMessage(message) {
    var messageForDashbot = {
        "text": message,
        "userId": userId,
        "conversationId": conversationId,
    };
    // dashbot.logOutgoing(messageForDashbot);
}

function logIncomingMessage(message) {
    var messageForDashbot = {
        "text": message,
        "userId": userId,
        "conversationId": conversationId,
    };
    // dashbot.logIncoming(messageForDashbot);
}

const logUserConversation = (event) => {
    logIncomingMessage(event.address.user.id);
};

// Middleware for logging
bot.use({
    receive: function (event, next) {
        logUserConversation(event);
        userId = event.address.user.id;
        conversationId = event.address.conversation.id;
        next();
    },
    send: function (event, next) {
        logUserConversation(event);
        next();
    }
});

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = {
        default: connector.listen()
    }
}