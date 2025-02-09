# Answers

## Time

- Features : 1h20min
- Questions : 18mins

## Question 1 :

According to me, the following improvements would be benefic for a safe production deployment :

- Use Typescript in order to ensure strong typing and add a layer of security on objects manipulations
- Separate request-handling, business logic and database manipulation. This would be more evolutive and easier to maintain and test
- Add a layer (a middleware for example) that ensure verification and filtering of user-provided data, both for security and control purposes
- Improve the error handling (do not send to frontend the raw error that have been thrown, use precise statuses / messages, etc...)

## Question 2 :

Well, I see at least 3 solutions here :

### Option 1

Depending on the running environment of the API, a system cron task could be set up. This is not a very elegant solution, but a quick one to implement

### Option 2

In Nodejs ecosystem, some packages provide a way to describe cron tasks directly in the app. This is a more maintainable solution for the dev team, but the trigger would be dependant on the API running status

### Option 3

In AWS, S3 events can trigger some actions within another services. For example, we could bind PutObject events in the S3 bucket to the exeution of a Lambda function that calls our /api/games/populate endpoint
