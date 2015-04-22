js-css
======

Build stylesheets with JavaScript.

## Why

When building markup with JavaScript (e.g. [React](https://facebook.github.io/react/)), inline styles are more declarative. But inline styles can also be very limiting (no psudo elements or any advanced selectors).

## How

This library allows you to define your styles using JavaScript objects and writes them to a stylesheet when you tell it to update.

## Example

```js
import CSS from 'github.com/jvatic/js-css/tree/master/main.js';
var sheet = new CSS();
var styleEl = sheet.createElement({
	color: '#fff',
	display: 'block',
	textAlign: 'center'
}, {
	color: '#000'
});
styleEl.commit(); // styles are now ready to use
var el = document.createElement('div');
el.id = styleEl.id;
el.innerHTML = 'Hello world!';
document.body.appendChild(el);
```

You may also pass an options object to the above `CSS` constructor. For example, to add one or more transformers:

```js
var transformerFn = function (field, value) {
	switch (field) {
		case 'display':
			if (isSafari && value === 'flex') {
				return [field, '-webkit-flex'];
			}

		case 'flexFlow':
			if (isSafari) {
				return ['WebkitFlexFlow', value];
			}
		break;
	}
	return [field, value];
};
var sheet = new CSS({
	transformers: [transformerFn]
});
```
