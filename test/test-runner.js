var exit = function (code, msg) {
	if (code > 0 && msg) {
		console.error(msg);
	} else if (msg) {
		console.log(msg);
	}
	console.log('exit '+ code);
	phantom.exit(code);
};

var system = require('system');
var webserver = require('webserver');
var server = webserver.create();
var testPageHTML = '' +
'<!DOCTYPE html>' +
'<html>' +
'<head>' +
'	<meta charset="utf-8">' +
'</head>' +
'<body>' +
'	<div id="qunit"></div>' +
'	<div id="qunit-fixture"></div>' +
'</body>' +
'</html>';
var started = server.listen('9393', function (request, response) {
  response.statusCode = 200;
  response.write(testPageHTML);
  response.close();
});
if ( !started ) {
	exit(1, 'Unable to start server on port '+ server.port);
}

var page = require('webpage').create();

page.onInitialized = function () {
	['qunit-1.18.0.js', '../build/css.js'].forEach(function (path) {
		if ( !page.injectJs(path) ) {
			exit(1, 'Unable to inject '+ path);
		}
	});
	page.evaluate(testSetup);

	if ( !page.injectJs('../build/test.js') ) {
		exit(1, 'Unable to inject ../build/test.js');
	}
};

var failures = [];
page.onCallback = function (event) {
	if (event.event === 'exit') {
		exit(event.data.code);
		return
	}

	switch (event.event) {
		case 'pass':
			system.stdout.write('.');
		break;

		case 'fail':
			failures.push(event.data);
			system.stdout.write('F');
		break;

		case 'test-done':
		break;

		case 'done':
			system.stdout.write('\n');
			console.log(event.data.passed +'/'+ event.data.total +' ('+ event.data.failed +' failed)');
			failures.forEach(function (res) {
				system.stdout.write('\n');
				console.log('Failed: '+ res.name);
				console.log(res.source);
				console.log('Expected: '+ JSON.stringify(res.expected, undefined, 2));
				console.log('Actual: '+ JSON.stringify(res.actual, undefined, 2));
			});
		break;

		default:
			console.log(JSON.stringify(event, undefined, 2));
	}
};

page.onConsoleMessage = function(msg, lineNum, sourceId) {
  console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};

page.open('http://localhost:'+server.port, function (status) {
	server.close();

	if (status !== 'success') {
		exit(1, 'Failed to load test page, got status '+ status);
	}
});

function testSetup() {
	QUnit.log(function (details) {
		if (details.result) {
			sendEvent({
				event: 'pass',
				data: details
			});
		} else {
			sendEvent({
				event: 'fail',
				data: details
			});
		}
	});

	QUnit.testDone(function (result) {
		sendEvent({
			event: 'test-done',
			data: result
		});
	});

	QUnit.done(function (result) {
		sendEvent({
			event: 'done',
			data: result
		});

		sendEvent({
			event: 'exit',
			data: {
				code: result.failed === 0 ? 0 : 1
			}
		});
	});

	function sendEvent(message) {
		window.callPhantom(message);
	}
}
