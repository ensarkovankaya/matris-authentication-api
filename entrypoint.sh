#!/usr/bin/env bash
set -e

# Install dependencies if node_modules not exists
if [ ! -d "node_modules" ]; then
    npm install
fi

if [ "$1" == "test" ]; then
    # Run tests
    npm run test
else
    # Enter console
    /usr/bin/env bash
fi
