const expect      = require( "chai" ).expect;
const assert      = require('chai').assert
const sinon       = require( "sinon" );
const PassThrough = require( "stream" ).PassThrough;
const http        = require( "https" );
const Sfm = require( "../lib/index" );

describe( "serverless-fb-messenger sending messages while running in AWS Lambda", function() {

	let requestDependency;

	beforeEach(function() {
		requestDependency = sinon.stub( http, "request" );
	});

	afterEach(function() {
		http.request.restore();
	});

	it( "should send a basic message", () => {

		var expected = JSON.stringify({
	        "recipient": {
	            "id": "1234567890"
	        },
	        "message": {
            	"text": "Hello"
            }
        });
	 
		var requestToReturn = new PassThrough();
		var end = sinon.spy( requestToReturn, "end" );
	 
		requestDependency.returns( requestToReturn );

		new Sfm().sendMessage({
            "userId": "1234567890",
            "message": "Hello"
        });

		assert( end.withArgs( expected ).calledOnce );

	});

	it( "should send a message with quick replies", () => {

		var expected = JSON.stringify({
	        "recipient": {
	            "id": "1234567890"
	        },
	        "message": {
            	"text": "Hello",
        		"quick_replies": [{
					"content_type": "text",
					"title":        "subscribe",
					"payload":      JSON.stringify( { "foo": "bar" } )
				}]
            }
        });
	 
		var requestToReturn = new PassThrough();
		var end = sinon.spy( requestToReturn, "end" );
	 
		requestDependency.returns( requestToReturn );

		new Sfm().sendMessage({
            "userId": "1234567890",
            "message": "Hello",
            "quickReplies": [{
            	"text": "subscribe",
            	"payload": { "foo": "bar" }
            }]
        });

		assert( end.withArgs( expected ).calledOnce );

	});

	it( "should send a message with buttons", () => {

		var expected = JSON.stringify({
	        "recipient": {
	            "id": "1234567890"
	        },
            "message": {
        		"attachment": {
        			"type": "template",
        			"payload": {
		        		"template_type": "button",
		        		"text": "Hello",
		        		"buttons": [{
							"type":    "postback",
							"title":   "subscribe",
							"payload": JSON.stringify( { "foo": "bar" } )
						}]
					}
        		}
			}
        });
	 
		var requestToReturn = new PassThrough();
		var end = sinon.spy( requestToReturn, "end" );
	 
		requestDependency.returns( requestToReturn );

		new Sfm().sendMessage({
            "userId": "1234567890",
            "message": "Hello",
            "buttons": [{
            	"text": "subscribe",
            	"payload": { "foo": "bar" }
            }]
        });

		assert( end.withArgs( expected ).calledOnce );

	} );

	it( "should send a basic share message", () => {

		var expected = JSON.stringify({
		        "recipient": {
		            "id": "1234567890"
		        },
		        "message": {
					"attachment": {
						"type": "template",
						"payload": {
							"template_type": "generic",
							"elements": [{
								"title":     "Share this story",
								"subtitle":  "It's a really good story",
								"image_url": "https://ichef.bbci.co.uk/news/320/cpsprodpb/17466/production/_96443359_ba347f59-143a-4019-be52-61abdae563e3.jpg",
								"buttons": [{
									"type": "element_share"
								}]
							}]
						}
					}
				}
		    });
	 
		var requestToReturn = new PassThrough();
		var end = sinon.spy( requestToReturn, "end" );
	 
		requestDependency.returns( requestToReturn );

		new Sfm().sendShareMessage({
            "userId":   "1234567890",
            "title":    "Share this story",
            "subtitle": "It's a really good story",
            "imageUrl": "https://ichef.bbci.co.uk/news/320/cpsprodpb/17466/production/_96443359_ba347f59-143a-4019-be52-61abdae563e3.jpg"
        });

		assert( end.withArgs( expected ).calledOnce );

	} );

	it( "should send a share message with buttons", () => {

		var expected = JSON.stringify({
		        "recipient": {
		            "id": "1234567890"
		        },
		        "message": {
					"attachment": {
						"type": "template",
						"payload": {
							"template_type": "generic",
							"elements": [{
								"title":     "Share this story",
								"subtitle":  "It's a really good story",
								"image_url": "https://ichef.bbci.co.uk/news/320/cpsprodpb/17466/production/_96443359_ba347f59-143a-4019-be52-61abdae563e3.jpg",
								"buttons": [{
									"type": "element_share"
								}, {
					            	"text": "subscribe",
					            	"payload": { "foo": "bar" }
					            }]
							}]
						}
					}
				}
		    });
	 
		var requestToReturn = new PassThrough();
		var end = sinon.spy( requestToReturn, "end" );
	 
		requestDependency.returns( requestToReturn );

		new Sfm().sendShareMessage({
            "userId":   "1234567890",
            "title":    "Share this story",
            "subtitle": "It's a really good story",
            "imageUrl": "https://ichef.bbci.co.uk/news/320/cpsprodpb/17466/production/_96443359_ba347f59-143a-4019-be52-61abdae563e3.jpg",
            "buttons": [{
            	"text": "subscribe",
            	"payload": { "foo": "bar" }
            }]
        });

		assert( end.withArgs( expected ).calledOnce );

	} );

	it( "should send a basic image message", () => {

		var expected = JSON.stringify({
	        "recipient": {
	            "id": "1234567890"
	        },
	        "message": {
            	"attachment":{
			    	"type":"image",
			    	"payload":{
			    		"url": "https://ichef.bbci.co.uk/news/320/cpsprodpb/17466/production/_96443359_ba347f59-143a-4019-be52-61abdae563e3.jpg"
			    	}
			    }
            }
        });
	 
		var requestToReturn = new PassThrough();
		var end = sinon.spy( requestToReturn, "end" );
	 
		requestDependency.returns( requestToReturn );

		new Sfm().sendImage({
            "userId":   "1234567890",
            "url": "https://ichef.bbci.co.uk/news/320/cpsprodpb/17466/production/_96443359_ba347f59-143a-4019-be52-61abdae563e3.jpg"
        });

		assert( end.withArgs( expected ).calledOnce );

	} );

	it( "should send an image message with quick replies", () => {

		var expected = JSON.stringify({
	        "recipient": {
	            "id": "1234567890"
	        },
	        "message": {
            	"attachment":{
			    	"type":"image",
			    	"payload":{
			    		"url": "https://ichef.bbci.co.uk/news/320/cpsprodpb/17466/production/_96443359_ba347f59-143a-4019-be52-61abdae563e3.jpg"
			    	}
			    },
			    "quick_replies": [{
					"content_type": "text",
					"title":        "subscribe",
					"payload":      JSON.stringify( { "foo": "bar" } )
				}]
            }
        });
	 
		var requestToReturn = new PassThrough();
		var end = sinon.spy( requestToReturn, "end" );
	 
		requestDependency.returns( requestToReturn );

		new Sfm().sendImage({
            "userId": "1234567890",
            "url": "https://ichef.bbci.co.uk/news/320/cpsprodpb/17466/production/_96443359_ba347f59-143a-4019-be52-61abdae563e3.jpg",
            "quickReplies": [{
            	"text": "subscribe",
            	"payload": { "foo": "bar" }
            }]
        });

		assert( end.withArgs( expected ).calledOnce );

	} );

});

describe( "serverless-fb-messenger receiving messages while running in AWS Lambda", function() {

	it( "should not let you define an unknown event", () => {

		let sfm = new Sfm();

		sfm.on( "madeupevent", ( err ) => {

			expect( err ).to.be.instanceof( Error )

		} );

	} );

	it( "should let you define authentication event", () => {

		let sfm = new Sfm({
			"verifyToken": "FAKE_VERIFY_TOKEN"
		});

		sfm.on( "authentication", ( msg ) => {

			expect( msg ).to.deep.equal({
				"sender": { "id": "USER_ID" },
				"recipient": { "id": "PAGE_ID" },
  				"timestamp": 1234567890,
  				"optin": {
  					"ref": "PASS_THROUGH_PARAM"
  				}
  			});

		} );

		sfm.init(
			{
				"context": {
					"http-method": "POST"
				},
				"params": {
					"querystring": {
						"hub.mode": "subscribe",
						"hub.verify_token": "FAKE_VERIFY_TOKEN",
						"hub.challenge": "FAKE_CHALLENGE"
					}
				},
				"body-json": {
					"object": "page",
					"entry": [{
						"messaging": [{
						  "sender":{
						    "id":"USER_ID"
						  },
						  "recipient":{
						    "id":"PAGE_ID"
						  },
						  "timestamp":1234567890,
						  "optin":{
						    "ref":"PASS_THROUGH_PARAM"
						  }
						}]
					}]
				}
			},
			{
				"done": () => {}
			},
			function fakeCallback() {}
		);

	} );

	it( "should let you define message event", () => {

		let sfm = new Sfm({
			"verifyToken": "FAKE_VERIFY_TOKEN"
		});

		sfm.on( "message", ( userId, text, payload, msgEvent ) => {

			expect( userId ).to.equal( "USER_ID" );

			expect( text ).to.equal( "USER_MESSAGE" );

			expect( payload ).to.equal( "" );

			expect( msgEvent ).to.deep.equal({
				"sender": { "id": "USER_ID" },
				"recipient": { "id": "PAGE_ID" },
  				"timestamp": 1234567890,
  				"message": {
  					"text": "USER_MESSAGE"
  				}
  			});

		} );

		sfm.init(
			{
				"context": {
					"http-method": "POST"
				},
				"params": {
					"querystring": {
						"hub.mode": "subscribe",
						"hub.verify_token": "FAKE_VERIFY_TOKEN",
						"hub.challenge": "FAKE_CHALLENGE"
					}
				},
				"body-json": {
					"object": "page",
					"entry": [{
						"messaging": [{
						  "sender":{
						    "id":"USER_ID"
						  },
						  "recipient":{
						    "id":"PAGE_ID"
						  },
						  "timestamp":1234567890,
						  "message":{
						    "text":"USER_MESSAGE"
						  }
						}]
					}]
				}
			},
			{
				"done": () => {}
			},
			function fakeCallback() {}
		);

	} );

	it( "should let you define messageDelivered event", () => {

		let sfm = new Sfm({
			"verifyToken": "FAKE_VERIFY_TOKEN"
		});

		sfm.on( "messageDelivered", ( msgEvent ) => {

			expect( msgEvent ).to.deep.equal({
				"sender":{
					"id":"USER_ID"
				},
					"recipient":{
					"id":"PAGE_ID"
				},
				"timestamp":1234567890,
				"delivery": { 
					"mids":[
				    	"MID_VALUE"
					],
					"watermark":1234567890,
					"seq":12
				}
			} );

		} );

		sfm.init(
			{
				"context": {
					"http-method": "POST"
				},
				"params": {
					"querystring": {
						"hub.mode": "subscribe",
						"hub.verify_token": "FAKE_VERIFY_TOKEN",
						"hub.challenge": "FAKE_CHALLENGE"
					}
				},
				"body-json": {
					"object": "page",
					"entry": [{
						"messaging": [{
						  "sender":{
						    "id":"USER_ID"
						  },
						  "recipient":{
						    "id":"PAGE_ID"
						  },
						  "timestamp":1234567890,
						  "delivery": { 
						  		"mids":[
						        	"MID_VALUE"
						    	],
						    	"watermark":1234567890,
						    	"seq":12
							}
						}]
					}]
				}
			},
			{
				"done": () => {}
			},
			function fakeCallback() {}
		);

	} );

	it( "should let you define postback event", () => {

		let sfm = new Sfm({
			"verifyToken": "FAKE_VERIFY_TOKEN"
		});

		sfm.on( "postback", ( userId, payload, referral, msgEvent ) => {

			expect( userId ).to.equal( "USER_ID" );

			expect( payload ).to.equal( "USER_DEFINED_PAYLOAD" );

			expect( referral ).to.equal( "USER_DEFINED_REFERRAL_PARAM" );

			expect( msgEvent ).to.deep.equal({
			  "sender":{
			    "id":"USER_ID"
			  },
			  "recipient":{
			    "id":"PAGE_ID"
			  },
			  "timestamp":1234567890,
			  "postback": { 
			  		"payload": "USER_DEFINED_PAYLOAD",
				    "referral": {
				      "ref": "USER_DEFINED_REFERRAL_PARAM",
				      "source": "SHORTLINK",
				      "type": "OPEN_THREAD",
				    }
				}
			});

		});

		sfm.init(
			{
				"context": {
					"http-method": "POST"
				},
				"params": {
					"querystring": {
						"hub.mode": "subscribe",
						"hub.verify_token": "FAKE_VERIFY_TOKEN",
						"hub.challenge": "FAKE_CHALLENGE"
					}
				},
				"body-json": {
					"object": "page",
					"entry": [{
						"messaging": [{
						  "sender":{
						    "id":"USER_ID"
						  },
						  "recipient":{
						    "id":"PAGE_ID"
						  },
						  "timestamp":1234567890,
						  "postback": { 
						  		"payload": "USER_DEFINED_PAYLOAD",
							    "referral": {
							      "ref": "USER_DEFINED_REFERRAL_PARAM",
							      "source": "SHORTLINK",
							      "type": "OPEN_THREAD",
							    }
							}
						}]
					}]
				}
			},
			{
				"done": () => {}
			},
			function fakeCallback() {}
		);

	} );

	it( "should let you define messageRead event", () => {

		let sfm = new Sfm({
			"verifyToken": "FAKE_VERIFY_TOKEN"
		});

		sfm.on( "messageRead", ( msgEvent ) => {

			expect( msgEvent ).to.deep.equal({
			    "sender":{
			        "id":"USER_ID"
			    },
			    "recipient":{
			        "id":"PAGE_ID"
			    },
			    "timestamp":1458668856463,
			    "read":{
			        "watermark":1458668856253,
			    	"seq":38
			    }
			});

		} );

		sfm.init(
			{
				"context": {
					"http-method": "POST"
				},
				"params": {
					"querystring": {
						"hub.mode": "subscribe",
						"hub.verify_token": "FAKE_VERIFY_TOKEN",
						"hub.challenge": "FAKE_CHALLENGE"
					}
				},
				"body-json": {
					"object": "page",
					"entry": [{
						"messaging": [{
						    "sender":{
						        "id":"USER_ID"
						    },
						    "recipient":{
						        "id":"PAGE_ID"
						    },
						    "timestamp":1458668856463,
						    "read":{
						        "watermark":1458668856253,
						    	"seq":38
						    }
						}]
					}]
				}
			},
			{
				"done": () => {}
			},
			function fakeCallback() {}
		);

	} );

	it( "should let you define accountLinking event", () => {

		let sfm = new Sfm({
			"verifyToken": "FAKE_VERIFY_TOKEN"
		});

		sfm.on( "accountLinking", ( msgEvent ) => {

			expect( msgEvent ).to.deep.equal({
			    "sender":{
			        "id":"USER_ID"
			    },
			    "recipient":{
			        "id":"PAGE_ID"
			    },
			    "timestamp":1458668856463,
			    "account_linking":{
					"status":"linked",
				    "authorization_code":"PASS_THROUGH_AUTHORIZATION_CODE"
				}
			});

		} );

		sfm.init(
			{
				"context": {
					"http-method": "POST"
				},
				"params": {
					"querystring": {
						"hub.mode": "subscribe",
						"hub.verify_token": "FAKE_VERIFY_TOKEN",
						"hub.challenge": "FAKE_CHALLENGE"
					}
				},
				"body-json": {
					"object": "page",
					"entry": [{
						"messaging": [{
						    "sender":{
						        "id":"USER_ID"
						    },
						    "recipient":{
						        "id":"PAGE_ID"
						    },
						    "timestamp":1458668856463,
						    "account_linking":{
								"status":"linked",
							    "authorization_code":"PASS_THROUGH_AUTHORIZATION_CODE"
							}
						}]
					}]
				}
			},
			{
				"done": () => {}
			},
			function fakeCallback() {}
		);

	} );

});

describe( "Running serverless-fb-messenger on the CLI to set parameters in the Messenger service", function () {

	it( "should add a get started page" );

	it( "should remove a get started page" );

});