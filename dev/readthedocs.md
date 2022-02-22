# Documentation Quiz

Please visit the [docs](https://semesterly-v2.readthedocs.io/en/latest/index.html) and
answer the following questions.

1. What is the command I run to get the courses from Fall 2021?
   python manage.py ingest jhu --years 2021 --terms fall

2. How do I then load those courses into my database?
   python manage.py digest jhu --years 2021 --terms fall

3. How do I get a terminal running in my docker container?
   docker-compose up

4. Where do I store data I don’t want to commit?
   add to .gitignore

5. What is our stack?
   Our stack includes Database, Backend and Frontend Frameworks, and CSS Framework. 

6. What branch do I create a new branch off of when developing?
   develop

7. If I want to start on a feature called myfeature, what should the branch name be?
   feature/myfeature

   What about if I want to refactor myreducer?
      refactor/refactor-myreducer

8. What is the preferred format for commit messages?
   Topic: Message
   e.g.: 
      Refactor Redux: refactor myreducer to myslice

9. What linters do we run against our code?
   ESLint

10. What is the max line length set to?
   88

11. What is a FeatureFlowView?
   Upon initial page load, it retrives all the data needed by the Frontend and stores them in a global variable called initData. 
   initData is then picked up by setup() in init.jsx and passed to the redux state for any other future uses. 


When you are done answering the questions, create a PR for a discussion of your answers.