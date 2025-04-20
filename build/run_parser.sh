#!/bin/bash

echo starting;
cd /code
# TODO: No params does not honor active-only semesters, this is hardcoded for now
# python3 manage.py ingest jhu --term Spring --years 2025;
python3 manage.py ingest jhu --use-admin-settings;
python3 manage.py digest jhu;
python manage.py deleteinactiveuser --batch-size 100 --dry-run
# Run all
#/usr/bin/python manage.py ingest jhu
#/usr/bin/python manage.py digest jhu

echo done;
