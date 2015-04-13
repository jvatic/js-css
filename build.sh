#!/bin/bash

export MODULE_NAME="css";
export MODULES_GLOBAL_VAR_NAME="__exports__";
export MODULES_LOCAL_VAR_NAME="exports";
export IMPORT_MAPPING="{}";

OUTPUT_FILE="build/css.js";

echo "var $MODULES_GLOBAL_VAR_NAME;" > $OUTPUT_FILE
cat ./main.js | node ./node_modules/es6-module-mapper/lib/es6-module-mapper/transformer.js >> $OUTPUT_FILE
