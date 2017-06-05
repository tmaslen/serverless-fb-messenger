Lambda Facebook Messenger
=========================

Node client for Facebook Messenger, designed specifically for use with AWS Lambda and API Gateway

 * Designed specifically for AWS Lambda and API Gateway.
 * Event based interface makes the API easy to use
 * Lightweight (no dependencies) makes deployment to Lambda quick (takes up less space, runs quicker).
 * Use locally also to change settings via the Messenger API.
 * NodeJS 6.10
 * Promise API

## Installation

```
npm install lambda-fb-messenger
```

## Quick start example

```
const ServerlessFbMessenger = require( "serverless-fb-messenger" );

exports.handler = function ( event, context, respondToMessenger ) {

	// Instantiate serverless-fb-messenger
	const sfm = new ServerlessFbMessenger( {
	    "pageAccessToken": <PAGE_ACCESS_TOKEN>,
	    "verifyToken":     <VERIFY_TOKEN>
	} );

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