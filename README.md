Lambda Facebook Messenger
=========================

Node client for Facebook Messenger:

 * Designed specifically for use with AWS Lambda and API Gateway.
 * Event based interface makes the API easy to use.
 * Lightweight (no dependencies) makes deployment to Lambda quick (takes up less space, runs quicker).
 * Use locally to interact with the Messenger API for changing settings.
 * Lambda compatible NodeJS 6.10.
 * Promise API.

This is an ongoing project, the API isn't fully compatible with Messenger just yet. There is currently no support for webviews, while there is very limited support for account linking and message read events.

The API has very good support for postbacks, buttons and quick replies for text, image and share messages.

## Installation

```
npm install lambda-fb-messenger
```

## Quick start example

Here's how you can use `serverless-fb-messenger` in a Lambda to quickly send messages to a user, and receive all messages.

```
const ServerlessFbMessenger = require( "serverless-fb-messenger" );

exports.handler = function ( event, context, respondToMessenger ) {

    // Instantiate serverless-fb-messenger
    const sfm = new ServerlessFbMessenger( {
        "pageAccessToken": <PAGE_ACCESS_TOKEN>,
        "verifyToken":     <VERIFY_TOKEN>
    });

    // Send a message
    sfm.sendMessage({
        "userId":  <USER_ID>,
        "message": "How you doing?"
    });

    // Log messages from all users
    sfm.on( "message", ( userId, message ) => {
        console.log( `The user ${userId} said "${message}" );
    });

    // Tell server-less-fb-messenger to start listening
    sfm.init( event, context, respondToMessenger );

});
```

## Setting up

There are two steps to working with `serverless-fb-messenger`:

1) Instantiate the module by passing in the two required params `pageAccessToken` and `verifyToken`.

```
const ServerlessFbMessenger = require( "serverless-fb-messenger" );
const sfm = new ServerlessFbMessenger( {
    "pageAccessToken": <PAGE_ACCESS_TOKEN>,
    "verifyToken":     <VERIFY_TOKEN>
});
```

2) Tell the module to start doing its thing. This requires all the params that are passed into your Lambda.

```
exports.handler = function ( event, context, respondToMessenger ) {
    sfm.init( event, context, respondToMessenger );
});
```


## Sending messages

Basic

```
sfm.sendMessage({
    "userId": <USER_ID>,
    "message": "How are you doing?"
});
```

With quick replies

```
sfm.sendMessage({
    "userId": <USER_ID>,
    "message": "How are you doing?",
    "quickReplies": [{
        "text": "I'm good",
        "postback": "USER_IS_GOOD" | { "user_is": "good" }
    }]
});
```

With buttons

```
sfm.sendMessage({
    "userId": <USER_ID>,
    "message": "How are you doing?",
    "buttons": [{
        "text": "I'm good",
        "postback": "USER_IS_GOOD" | { "user_is": "good" }
    }]
});
```

## Sending images

Basic

```
sfm.sendImage({
    "userId": <USER_ID>,
    "url": "http://foo.com/bar.gif"
});
```

With quick replies

```
sfm.sendMessage({
    "userId": <USER_ID>,
    "url": "http://foo.com/bar.gif",
    "quickReplies": [{
        "text": "I'm good",
        "postback": "USER_IS_GOOD" | { "user_is": "good" }
    }]
});
```

## Sending share messages

Basic

```
sfm.sendShareMessage({
    "userId": <USER_ID>,
    "title": "Working with Facebook Messenger",
    "subtitle": "By Tom Maslen",
    "imageUrl": "http://foo.com/bar.gif"
});
```

With buttons

```
sfm.sendShareMessage({
    "userId": <USER_ID>,
    "title": "Working with Facebook Messenger",
    "subtitle": "By Tom Maslen",
    "imageUrl": "http://foo.com/bar.gif",
    "buttons": [{
        "type":"web_url",
        "url":"https://tmaslen.com"
    }]
});
```

## Developing lambda-fs-messenger

Run the tests:

```
npm test
```