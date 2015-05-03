import CSS from 'css';

QUnit.module('CSS.diff');
QUnit.test("diff (shallow replace)", function(assert) {
	var moduleA = {
		display: 'flex',
		flexFlow: 'row',
		selectors: []
	};
	var moduleB = {
		display: 'flex',
		flexFlow: 'column',
		selectors: []
	};
	assert.deepEqual(CSS.diff(moduleA, moduleB), [
		{ op: 'replace', path: '/flexFlow', value: 'row' }
	]);
	assert.deepEqual(CSS.diff(moduleB, moduleA), [
		{ op: 'replace', path: '/flexFlow', value: 'column' }
	]);
});

QUnit.test("diff (shallow add/remove)", function(assert) {
	var moduleA = {
		color: '#000',
	};
	var moduleB = {
	};
	assert.deepEqual(CSS.diff(moduleA, moduleB), [
		{ op: 'add', path: '/color', value: '#000' }
	]);
	assert.deepEqual(CSS.diff(moduleB, moduleA), [
		{ op: 'remove', path: '/color' }
	]);
});

QUnit.test("diff (deep replace)", function(assert) {
	var moduleA = {
		selectors: [
			['> a', {
				color: '#000'
			}]
		]
	};
	var moduleB = {
		selectors: [
			['> a', {
				color: '#fff'
			}]
		]
	};
	assert.deepEqual(CSS.diff(moduleA, moduleB), [
		{
			op: 'replace',
			path: '/selectors/0/1/color',
			value: '#000'
		}
	]);
	assert.deepEqual(CSS.diff(moduleB, moduleA), [
		{
			op: 'replace',
			path: '/selectors/0/1/color',
			value: '#fff'
		}
	]);
});

QUnit.test("diff (deep add/remove)", function(assert) {
	var moduleA = {
		selectors: [
			['> a', {
				color: '#000'
			}],
			['> a:hover', {
				textDecoration: 'underline'
			}]
		]
	};
	var moduleB = {
		selectors: [
			['> a', {
				color: '#000'
			}]
		]
	};
	assert.deepEqual(CSS.diff(moduleA, moduleB), [
		{
			op: 'add',
			path: '/selectors/1',
			value: moduleA.selectors[1]
		}
	]);
	assert.deepEqual(CSS.diff(moduleB, moduleA), [
		{
			op: 'remove',
			path: '/selectors/1'
		}
	]);
});

QUnit.module('CSS.applyDiff');
QUnit.test("applyDiff (shallow replace)", function(assert) {
	var moduleA = {
		display: 'flex',
		flexFlow: 'row',
		selectors: []
	};
	var diff = [
		{ op: 'replace', path: '/flexFlow', value: 'column' }
	];
	assert.deepEqual(CSS.applyDiff(diff, moduleA), {
		display: 'flex',
		flexFlow: 'column',
		selectors: []
	});
});

QUnit.test("applyDiff (shallow add/remove)", function(assert) {
	var moduleA = {
		display: 'block'
	};
	var moduleB = {
		display: 'block',
		color: '#000'
	};
	var addDiff = [
		{ op: 'add', path: '/color', value: '#000' }
	];
	var removeDiff = [
		{ op: 'remove', path: '/color' }
	];
	assert.deepEqual(CSS.applyDiff(addDiff, moduleA), {
		display: 'block',
		color: '#000'
	});
	assert.deepEqual(CSS.applyDiff(removeDiff, moduleB), {
		display: 'block'
	});
});

QUnit.test("applyDiff (deep replace)", function(assert) {
	var moduleA = {
		selectors: [
			['> a', {
				color: '#000'
			}]
		]
	};
	var diff = [
		{
			op: 'replace',
			path: '/selectors/0/1/color',
			value: '#fff'
		}
	];
	assert.deepEqual(CSS.applyDiff(diff, moduleA), {
		selectors: [
			['> a', {
				color: '#fff'
			}]
		]
	});
});

QUnit.test("applyDiff (deep add/remove)", function(assert) {
	var moduleA = {
		display: 'block',
		selectors: [
			['> a', {
				color: '#000'
			}],
			['> a:hover', {
				textDecoration: 'underline'
			}]
		]
	};
	var moduleB = {
		display: 'block',
		selectors: [
			['> a', {
				color: '#000'
			}]
		]
	};
	var addDiff = [
		{
			op: 'add',
			path: '/selectors/1',
			value: moduleA.selectors[1]
		}
	];
	var removeDiff = [
		{
			op: 'remove',
			path: '/selectors/1'
		}
	];
	assert.deepEqual(CSS.applyDiff(addDiff, moduleB), moduleA);
	assert.deepEqual(CSS.applyDiff(removeDiff, moduleA), moduleB);
});

QUnit.module('CSSElement');
QUnit.test('module to CSS', function (assert) {
	var sheet = new CSS();
	var moduleA = {
		display: 'flex',
		textAlign: 'center',
		backgroundColor: '#fff',
		color: '#000'
	};
	var cssEl = sheet.createElement(moduleA);
	cssEl.commit();

	assert.notEqual(sheet.id, null);

	var expectedCSSStr = '';
	expectedCSSStr += '#'+ cssEl.id + ' {\n';
	expectedCSSStr += '\tbackground-color: #fff;\n'
	expectedCSSStr += '\tcolor: #000;\n'
	expectedCSSStr += '\tdisplay: flex;\n'
	expectedCSSStr += '\ttext-align: center;\n'
	expectedCSSStr += '}'

	var styleEl = document.getElementById(sheet.id);
	assert.notEqual(sheet.id, null);

	var actualCSSStr = styleEl ? styleEl.innerHTML : '';
	assert.equal(actualCSSStr, expectedCSSStr);
});

QUnit.test('multiple modules to CSS', function (assert) {
	var sheet = new CSS();
	var moduleA = {
		color: '#000'
	};
	var moduleB = {
		color: '#3399ff'
	};
	var moduleC = {
		border: '1px solid #000'
	};
	var cssEl = sheet.createElement(moduleA, moduleB, moduleC);
	cssEl.commit();

	assert.notEqual(sheet.id, null);

	var expectedCSSStr = '';
	expectedCSSStr += '#'+ cssEl.id + ' {\n';
	expectedCSSStr += '\tborder: 1px solid #000;\n'
	expectedCSSStr += '\tcolor: #3399ff;\n'
	expectedCSSStr += '}'

	var styleEl = document.getElementById(sheet.id);
	assert.notEqual(sheet.id, null);

	var actualCSSStr = styleEl ? styleEl.innerHTML : '';
	assert.equal(actualCSSStr, expectedCSSStr);
});

QUnit.test('multiple elements to CSS', function (assert) {
	var sheet = new CSS();
	var moduleA = {
		color: '#000'
	};
	var moduleB = {
		color: '#3399ff'
	};
	var moduleC = {
		border: '1px solid #000'
	};
	var cssEl1 = sheet.createElement(moduleA);
	var cssEl2 = sheet.createElement(moduleB);
	var cssEl3 = sheet.createElement(moduleC);
	cssEl1.commit();
	cssEl2.commit();
	cssEl3.commit();

	assert.notEqual(sheet.id, null);

	var expectedCSSStr = '';
	expectedCSSStr += '#'+ cssEl1.id + ' {\n';
	expectedCSSStr += '\tcolor: #000;\n'
	expectedCSSStr += '}\n'

	expectedCSSStr += '#'+ cssEl2.id + ' {\n';
	expectedCSSStr += '\tcolor: #3399ff;\n'
	expectedCSSStr += '}\n'

	expectedCSSStr += '#'+ cssEl3.id + ' {\n';
	expectedCSSStr += '\tborder: 1px solid #000;\n'
	expectedCSSStr += '}'

	var styleEl = document.getElementById(sheet.id);
	assert.notEqual(sheet.id, null);

	var actualCSSStr = styleEl ? styleEl.innerHTML : '';
	assert.equal(actualCSSStr, expectedCSSStr);
});

QUnit.test('module with selectors to CSS', function (assert) {
	var sheet = new CSS();
	var moduleA = {
		color: '#000',
		selectors: [
			[':before', {
				display: 'block'
			}],
			[':after', {
				display: 'block'
			}],
			[':hover', {
				textDecoration: 'underline'
			}],
			['> a', {
				color: 'inherit'
			}],
			['> a:hover', {
				textDecoration: 'none'
			}]
		]
	};
	var cssEl = sheet.createElement(moduleA);
	cssEl.commit();

	assert.notEqual(sheet.id, null);

	var expectedCSSStr = '';
	expectedCSSStr += '#'+ cssEl.id + ' {\n';
	expectedCSSStr += '\tcolor: #000;\n'
	expectedCSSStr += '}\n'

	expectedCSSStr += '#'+ cssEl.id + ':before {\n';
	expectedCSSStr += '\tdisplay: block;\n'
	expectedCSSStr += '}\n'

	expectedCSSStr += '#'+ cssEl.id + ':after {\n';
	expectedCSSStr += '\tdisplay: block;\n'
	expectedCSSStr += '}\n'

	expectedCSSStr += '#'+ cssEl.id + ':hover {\n';
	expectedCSSStr += '\ttext-decoration: underline;\n'
	expectedCSSStr += '}\n'

	expectedCSSStr += '#'+ cssEl.id + ' > a {\n';
	expectedCSSStr += '\tcolor: inherit;\n'
	expectedCSSStr += '}\n'

	expectedCSSStr += '#'+ cssEl.id + ' > a:hover {\n';
	expectedCSSStr += '\ttext-decoration: none;\n'
	expectedCSSStr += '}'

	var styleEl = document.getElementById(sheet.id);
	assert.notEqual(sheet.id, null);

	var actualCSSStr = styleEl ? styleEl.innerHTML : '';
	assert.equal(actualCSSStr, expectedCSSStr);
});

QUnit.test('module to CSS with transformer', function (assert) {
	var sheet = new CSS({
		transformers: [
			function (field, value) {
				switch (field) {
					case 'display':
						if (value === 'flex') {
							return [field, '-webkit-flex'];
						}

					case 'flexFlow':
						return ['WebkitFlexFlow', value];
					break;
				}
				return [field, value];
			}
		]
	});
	var moduleA = {
		display: 'flex',
		flexFlow: 'column',
		color: '#000'
	};
	var cssEl = sheet.createElement(moduleA);
	cssEl.commit();

	assert.notEqual(sheet.id, null);

	var expectedCSSStr = '';
	expectedCSSStr += '#'+ cssEl.id + ' {\n';
	expectedCSSStr += '\tcolor: #000;\n'
	expectedCSSStr += '\tdisplay: -webkit-flex;\n'
	expectedCSSStr += '\t-webkit-flex-flow: column;\n'
	expectedCSSStr += '}'

	var styleEl = document.getElementById(sheet.id);
	assert.notEqual(sheet.id, null);

	var actualCSSStr = styleEl ? styleEl.innerHTML : '';
	assert.equal(actualCSSStr, expectedCSSStr);
});
