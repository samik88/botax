// const dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).generic;
// W8wcbHLZu8ECDLKqhPBfKRTf5prKYBtI7p3oQAn8
const dashbot = require('dashbot')('W8wcbHLZu8ECDLKqhPBfKRTf5prKYBtI7p3oQAn8').generic;
const messageForDashbot = {
    "text": "Hi, bot",
    "userId": "USERIDHERE123123",
    "conversationId": "GROUPCHATID234",
    "platformJson": {
        "whateverJson": "any JSON specific to your platform can be stored here"
    }
};
dashbot.logIncoming(messageForDashbot);
dashbot.logOutgoing(messageForDashbot);