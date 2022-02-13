# Documentation Quiz

Please visit the [docs](https://semesterly-v2.readthedocs.io/en/latest/index.html) and
answer the following questions.

1. What is the command I run to get the courses from Fall 2021?
Access the semesterly Docker container shell. Then use the command:
`python manage.py ingest jhu --term Fall --years 2021`
This command gets the course data from JHU, validates it, and writes it to formatted JSON

2. How do I then load those courses into my database?
`python manage.py digest jhu`

3. How do I get a terminal running in my docker container?
Click on the VSCode Docker extension, right click on the desired Docker container and click "Attach Shell".

4. Where do I store data I don’t want to commit?
You can stash data on a stack using the command `git stash`.

5. What is our stack?
React/Redux  (Frontend) + Django (Backend) + PostgreSQL (Database)

6. What branch do I create a new branch off of when developing?
`develop`

7. If I want to start on a feature called myfeature, what should the branch name be?
`feature/myfeature`

   What about if I want to refactor myreducer?
   `refactor/myreducer`

8. What is the preferred format for commit messages?
"Topic: Message"

9. What linters do we run against our code?
eslint + prettier, black.

10. What is the max line length set to?
88, as per black defaults.


11. What is a FeatureFlowView?
A FeatureFlowView is a class that helps the frontend initialize when the user makes a request for a page.
It can do this by creating data in the FeatureFlowView and passing the response as JSON.
The frontend then uses the name of the flow and other data from the response to dispatch actions for the flow.


When you are done answering the questions, create a PR for a discussion of your answers.