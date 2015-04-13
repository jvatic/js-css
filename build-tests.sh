#!/bin/bash

export MODULE_NAME="tests";
export MODULES_GLOBAL_VAR_NAME="__exports__";
export MODULES_LOCAL_VAR_NAME="exports";
export IMPORT_MAPPING='{"css":"css"}';

OUTPUT_FILE="build/test.js";

echo "var $MODULES_GLOBAL_VAR_NAME;" > $OUTPUT_FILE
cat ./test/tests.js | node ./node_modules/es6-module-mapper/lib/es6-module-mapper/transformer.js >> $OUTPUT_FILE
