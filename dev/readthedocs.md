# Documentation Quiz

Please visit the [docs](https://semesterly-v2.readthedocs.io/en/latest/index.html) and
answer the following questions.

1. What is the command I run to get the courses from Fall 2021?
   python manage.py ingest --years 2021 --terms Fall
2. How do I then load those courses into my database?
   python manage.py digest
3. How do I get a terminal running in my docker container?
   Go to the docker tab on left side of VS Code, click on the desired container and click attach shell.
4. Where do I store data such as passwords or secrets that I don’t want to commit?
   I cna create a file called sensitive.py in the inner semesterly/ directory. I can then add passwords/secrets as key value pairs.
5. What is our stack?
   React/Redux, Django, Postgres, SCSS
6. What branch do I create a new branch off of when developing?
   Branch off develop
7. If I want to start on a feature called myfeature, what should the branch name be?
   feature/myfeature

   What about if I want to refactor myreducer?
   refactor/myreducer
8. What is the preferred format for commit messages?
   "Topic: Message"
9. What linters do we run against our code?
   ESLint, Prettier, Black
10. What is the max line length set to?
   88
11. What is a FeatureFlowView?
   FeatureFlowView is a Django class-based view which can get some data (ex: current user info, semesters, etc.) and then pass this data to the front-end via a single json string (as response context). In practice (when trying to implement a new view), it's often best to subclass FeatureFlowView and define the feature_name class attribute and (optionally) overwrite get_feature_flow() to pass in any desired info for this new view.

When you are done answering the questions, create a PR for a discussion of your answers.