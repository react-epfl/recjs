#!/bin/bash

# should be run with cron

# retrieve apps from the widget store
curl http://localhost:9000/external/populate_apps

# retrieve bundles from the widget store
curl http://localhost:9000/external/populate_bundles
