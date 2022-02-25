# Documentation Quiz

Please visit the [docs](https://semesterly-v2.readthedocs.io/en/latest/index.html) and
answer the following questions.

1. What is the command I run to get the courses from Fall 2021?
(assuming only jhu courses)
python manage.py ingest jhu --years 2021 --terms Fall

2. How do I then load those courses into my database?
python manage.py digest jhu

3. How do I get a terminal running in my docker container?
Open Docker explorer on the left pane (of VS Code), right click on a container, and choose Attach Shell

4. Where do I store data I don’t want to commit?
In a new file called sensitive.py in the directory semesterly/semesterly/ (this file should be automatically ignored by git)

5. What is our stack?
Database: PostgreSQL
Backend: Django
Frontend: React/Redux
CSS: SCSS

6. What branch do I create a new branch off of when developing?
develop

7. If I want to start on a feature called myfeature, what should the branch name be?
feature/myfeature

   What about if I want to refactor myreducer?
refactor/myreducer

8. What is the preferred format for commit messages?
"Topic: Message"
Example:-
    “Evaluation list: Duplicate state to avoid modifying redux state”

9. What linters do we run against our code?
ESLint, Pretter

10. What is the max line length set to?
88

11. What is a FeatureFlowView?
A class that gets data to initialize the redux state (e.g. info about current user) on initial page load and makes the information accessible as a JSON string to the frontend

When you are done answering the questions, create a PR for a discussion of your answers.