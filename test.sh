#!/bin/bash

./build.sh
./build-tests.sh
echo "Running tests in PhantomJS"
phantomjs ./test/test-runner.js
if [ $? != 0 ]
then
	exit $?
fi
echo "Running tests in SlimerJS"
slimerjs ./test/test-runner.js
if [ $? != 0 ]
then
	exit $?
fi
