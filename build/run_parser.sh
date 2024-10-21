#!/bin/bash

echo starting;
cd /code
# TODO: No params does not honor active-only semesters, this is hardcoded for now
python3 manage.py ingest jhu --term Fall --years 2025;
python3 manage.py digest jhu;
python3 manage.py digest jhu --types evals;

# Run all
#/usr/bin/python manage.py ingest jhu
#/usr/bin/python manage.py digest jhu

echo done;
