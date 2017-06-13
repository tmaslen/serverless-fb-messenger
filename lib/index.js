const https = require("https");
const ALLOWED_EVENTS = [
    "authentication",
    "message",
    "messageDelivered",
    "postback",
    "messageRead",
    "accountLinking"
];
function getQuickReplyPayload(message) {
    if (("quick_reply" in message) && ("payload" in message.quick_reply)) {
        return message.quick_reply.payload;
    }
    return false;
}
function valueIsStringifiedJson(value) {
    if (value === null) {
        return false;
    }
    return value.charAt && (value.charAt(0) === "{");
}
const EVENT_CALLBACKS = {
    "message": (callback, messageEvent) => {
        var payload = getQuickReplyPayload(messageEvent.message) || "";
        if (valueIsStringifiedJson(payload)) {
            payload = JSON.parse(payload);
        }
        callback(messageEvent.sender.id, messageEvent.message.text, payload, messageEvent);
    },
    "postback": (callback, messageEvent) => {
        var payload = messageEvent.postback.payload;
        if (valueIsStringifiedJson(payload)) {
            payload = JSON.parse(payload);
        }
        var referral = (messageEvent.postback.referral && messageEvent.postback.referral.ref) ? messageEvent.postback.referral.ref : null;
        if (valueIsStringifiedJson(referral)) {
            referral = JSON.parse(referral);
        }
        callback(messageEvent.sender.id, payload, referral, messageEvent);
    },
    "authentication": (callback, messageEvent) => { callback(messageEvent); },
    "messageDelivered": (callback, messageEvent) => { callback(messageEvent); },
    "messageRead": (callback, messageEvent) => { callback(messageEvent); },
    "accountLinking": (callback, messageEvent) => { callback(messageEvent); }
};
const MessengerClient = function (params) {
    this.registeredCallbacks = {};
    this.addCallbackTypes();
    params = params || {};
    this.pageAccessToken = params.pageAccessToken || null;
    this.verifyToken = params.verifyToken || null;
};
MessengerClient.prototype = {
    addCallbackTypes: function () {
        ALLOWED_EVENTS.forEach(e => {
            this.registeredCallbacks[e] = [];
        });
    },
    sendShareMessage: function (params) {
        return new Promise((resolve, reject) => {
            var message = {
                "recipient": {
                    "id": params.userId
                },
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                    "title": params.title,
                                    "subtitle": params.subtitle,
                                    "image_url": params.imageUrl,
                                    "buttons": [{
                                            "type": "element_share"
                                        }]
                                }]
                        }
                    }
                }
            };
            if (params.buttons) {
                params.buttons.forEach((button) => {
                    message.message.attachment.payload.elements[0].buttons.push(button);
                });
            }
            this._sendToFacebookAPI(message)
                .then(() => {
                resolve();
            })
                .catch((err) => {
                reject(err);
            });
        });
    },
    sendImage: function (params) {
        return new Promise((resolve, reject) => {
            var message = {
                "recipient": {
                    "id": params.userId
                },
                "message": {
                    "attachment": {
                        "type": "image",
                        "payload": {
                            "url": params.url
                        }
                    }
                }
            };
            if (params.quickReplies) {
                message.message["quick_replies"] = params.quickReplies.map((quickReply) => {
                    return {
                        "content_type": "text",
                        "title": quickReply.text,
                        "payload": JSON.stringify(quickReply.payload)
                    };
                });
            }
            this._sendToFacebookAPI(message)
                .then(resolve)
                .catch(reject);
        });
    },
    addGetStartedPage: function (payload) {
        const command = {
            "get_started": {
                "payload": JSON.stringify(payload)
            }
        };
        this._sendToFacebookAPI(command, {
            "messageType": "messengerProfile",
            "method": "GET"
        });
    },
    removeGetStartedPage: function () {
        const command = {
            "fields": [
                "get_started"
            ]
        };
        this._sendToFacebookAPI(command, {
            "messageType": "messengerProfile",
            "method": "DELETE"
        });
    },
    _sendToFacebookAPI: function (postBody, options) {
        options = options || {};
        options.messageType = options.messageType || "default";
        options.method = options.method || "POST";
        const messageTypes = {
            "default": "/v2.6/me/messages",
            "threadSetting": "/v2.6/me/thread_settings",
            "messengerProfile": "/v2.6/me/messenger_profile"
        };
        const requestParams = {
            hostname: "graph.facebook.com",
            port: 443,
            path: messageTypes[options.messageType] + "?access_token=" + this.pageAccessToken,
            method: options.method,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(JSON.stringify(postBody))
            }
        };
        return new Promise((resolve, reject) => {
            console.log("SENDING MESSAGE");
            console.log(requestParams.hostname + requestParams.path);
            console.log(JSON.stringify(postBody, null, " "));
            var req = https.request(requestParams, (res) => {
                res.setEncoding("utf8");
                var raw = "";
                res.on("data", (d) => {
                    raw += d;
                });
                res.on("end", () => {
                    const responseBody = JSON.parse(raw);
                    console.log(responseBody);
                    if (res.statusCode === 200) {
                        console.log("Successfully sent message with id %s to recipient %s", responseBody.message_id, responseBody.recipient_id);
                        resolve();
                    }
                    if (res.statusCode === 400 && responseBody.error) {
                        console.log("ERROR CALLING FACEBOOK API");
                        console.log(res.statusCode, responseBody.error);
                        reject(responseBody.error);
                    }
                });
            });
            req.on("error", (err) => {
                console.log("ERROR CALLING FACEBOOK API");
                console.log(err);
                reject(err);
            });
            req.end(JSON.stringify(postBody));
        });
    },
    sendMessage: function (params) {
        return new Promise((resolve, reject) => {
            var message = {
                "recipient": {
                    "id": params.userId
                },
                "message": {
                    "text": params.message
                }
            };
            if (params.quickReplies) {
                message.message.quick_replies = params.quickReplies.map((quickReply) => {
                    return {
                        "content_type": "text",
                        "title": quickReply.text,
                        "payload": JSON.stringify(quickReply.payload)
                    };
                });
            }
            if (params.buttons) {
                message.message = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "button",
                            "text": message.message.text,
                            "buttons": params.buttons.map((button) => {
                                return {
                                    "type": "postback",
                                    "title": button.text,
                                    "payload": JSON.stringify(button.payload)
                                };
                            })
                        }
                    }
                };
            }
            this._sendToFacebookAPI(message)
                .then(resolve)
                .catch(reject);
        });
    },
    fireEvent: function (eventName, messageEvent, callback) {
        if (eventName in this.registeredCallbacks) {
            this.registeredCallbacks[eventName].forEach(callback => {
                EVENT_CALLBACKS[eventName](callback, messageEvent);
            });
        }
        callback();
    },
    on: function (eventName, callback) {
        if (ALLOWED_EVENTS.indexOf(eventName)) {
            this.registeredCallbacks[eventName].push(callback);
        }
    },
    init: function (event, lambdaContext, respondToMessenger) {
        const method = event.context["http-method"];
        const methodReplies = {
            // facebook verify challenge
            "GET": () => {
                const queryParams = event.params.querystring;
                if ((queryParams["hub.mode"] === "subscribe") &&
                    (queryParams["hub.verify_token"] === this.verifyToken)) {
                    console.log("FACEBOOK GET REQUEST: verify");
                    console.log(queryParams["hub.challenge"]);
                    respondToMessenger(null, queryParams["hub.challenge"]);
                }
                else {
                    respondToMessenger(null, "Incorrect verify token");
                }
                lambdaContext.done();
            },
            // all other facebook requests
            "POST": () => {
                // Always reply to the response otherwise 
                // Messenger thinks your bot is unwell
                respondToMessenger(null, "Messages received");
                const batchedResponses = event["body-json"];
                // console.log( batchedResponses );
                if (batchedResponses.object == 'page') {
                    batchedResponses.entry.forEach((response) => {
                        // Iterate over each messaging event
                        response.messaging.forEach((messagingEvent) => {
                            var eventName;
                            if (messagingEvent.optin) {
                                eventName = "authentication";
                            }
                            else if (messagingEvent.message) {
                                eventName = "message";
                            }
                            else if (messagingEvent.delivery) {
                                eventName = "messageDelivered";
                            }
                            else if (messagingEvent.postback) {
                                eventName = "postback";
                            }
                            else if (messagingEvent.read) {
                                eventName = "messageRead";
                            }
                            else if (messagingEvent.account_linking) {
                                eventName = "accountLinking";
                            }
                            else {
                                console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                            }
                            this.fireEvent(eventName, messagingEvent, () => {
                                lambdaContext.done();
                            });
                        });
                    });
                }
            }
        };
        methodReplies[method]();
    }
};
module.exports = MessengerClient;
