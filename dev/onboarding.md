# Onboarding

**Welcome to the Semester.ly Team!**

Congratulations on making it into the team and we are glad to have you join us. Detailed
in this guide is everything I want you to go through before we can get you started with
working on the team.

## Getting Paid

You should be hearing from IT Department about getting put on payroll. This is a
process that might take a while, especially if you've never worked at JHU before. While
I think it'd be ideal for you to start tracking your hours and log them later when you
can, it's up to you whether you want to start working when you know you'll actually get
paid.

Logging hours is done through your [TimesheetX](https://studentjob.jh.edu/timesheetx.cfm).
Click on the `Student Employees` card, choose `Enter Your Hours`, choose 
`Enter time and submit timesheets for JHU!`, and select the appropriate job title for
semester.ly that falls under the IT Department. Click `Start time sheet` and 
`Add New Entry`. Choose your start and end time and add a brief description to log what
you did. You'll also have to click `Submit Time Sheet` when you are done logging the
current week. Pay attention to the deadline of the time sheet.

You should log all hours you work for Semester.ly, including hours you spend learning
new material for the job.

## Getting Started

Please visit the [docs](https://semesterly-v2.readthedocs.io/en/latest/setup.html) for
how to set up VSCode with Semester.ly. It's actually quite a difficult setup process, so
please follow the directions carefully and ask for help if you run into issues.

Once you have completed that, you should have your own repository in addition to a
remote to the upstream repository. Make sure you are on the `develop` branch and create
a new branch called `onboarding/your-name`

```bash
git checkout develop
git checkout -b onboarding/your-name
```

You should now edit the [read the docs file](./readthedocs.md) and answer the questions
there. These questions provide some useful information that you should know while
developing at Semester.ly.

Once you have answered all of the questions, create a pull request (PR) and I will give
you a review to ensure you've got the important parts. You can then delete your
`onboarding` branch.

## Adding Yourself

After completing the questions on docs, your first task is to add yourself to
[Semester.ly's about page](https://semester.ly/about)! You will want to add an image of
yourself in `static/img/` and create a portrait of yourself in the `about.html` file.
Using what you've learned about our practices from the documentation quiz, see if you
can complete this task in our preferred workflow!

## Moving Forwards

Before you get started on team projects, I would like to assign you a small task and
work with you on that task to help you with any first issues that you might come across
while developing for Semester.ly. Notify me when you've reached this point and we will
discuss what kind of a task we can work on together. In the meantime, please take a look
at the other documents in this directory for other information you might be interested
in.