# Library Management System

## Table of Contents

1. [Introduction](#introduction)
2. [developement workflow](#developement-workflow)
3. [Features](#features)
4. [Prerequisites](#prerequisites)
5. [Running the Application](#running-the-application)
6. [Run unit tests](#run-unit-tests)
7. [Entities and Relationships](#entities-and-relationships)
8. [Module Dependencies](#module-dependencies)


## introduction
This is a Library Management System built with NestJS and PostgresSql. It provides functionalities for managing books, borrow requests and user authentication.

## developement-workflow
During devellopemnt of this project, I simulated workflow of teamwork for demonistration purpose, and that through delivering featuers by pull requests, and it's as follows:
1. [Book CRUD PR](https://github.com/OsamahAli-1/Library-Management-System/pull/1)
2. [Authentication and authorization PR](https://github.com/OsamahAli-1/Library-Management-System/pull/2)
3. [Books Borrowing PR](https://github.com/OsamahAli-1/Library-Management-System/pull/3)
4. [Containerizing and logging PR](https://github.com/OsamahAli-1/Library-Management-System/pull/4)

## features
for greater explanation about those feature and rules applied in services with sample runs, check out related PRs in [developement workflow](#developement-workflow)
- User authentication and authorization
- Book management (add, update, delete, view book/s)
- Borrow and return books
- Administrative functionalities for managing borrow requests (approve and reject)
- API documentation with Swagger
- Paginated results for retrieving books and borrow requests
- Unit tests

## prerequisites
- Docker and Docker Compose
- Node.js, npm and postgres (for local development without docker)

## running-the-application
both options belown support hot-reloading
- with docker, using docker-compose it will run the app, postgres and adminer (GUI DB Manager), follow these steps:
  - create `.env` file, and copy the content of  `.env.example` to it
  - run in terminal `docker-compose up` 
  - now you can use it through `localhost:<PORT>`, port is what is specified in .`env` file
  - navigate to `localhost:<PORT>/doc` to go to swagger interface
  - you can access adminer through `localhost:8080`, and login credentials will be the same as specified in `.env`, and note that Server = database name (`DB_DATABASE` in `.env`)
- without docker:
  - create `.env` file, and copy the content of  `.env.example` to it
  - make sure postgres is running, and use your own credentials in the .env for DB related variables
  - inside project directory run `npm install`, then run `npm run start:dev`
  - now you can use it through `localhost:<PORT>`, port is what is specified in .`env` file
> [!NOTE]
> - to login as admin, use username and password in `.env`, but if you want to login as a user, signup and login normally using provided endpoints
> - to authenticate with the token, put in header as `Authorization: Bearer <token>` or if using swagger simply copy the token to `Authorize` button

## run-unit-tests
run the following command in the project directory or app conatiner (if using docker):
- `npm run test`

## entities-and-relationships
The app constsis of three tabels, and their relationship as follows:
- User (1) <--- (M) Borrow (M) ---> (1) Book
  * <img  style="float:left;margin:0 10px 10px 0;height:400px;" src="https://github.com/user-attachments/assets/4b7fae88-e6d7-4764-bc9f-c16eddc24fb5"></img>
  
> [!NOTE]
> role in user table and status in borrow table are defined as enum with following valuse
> - Role = {"admin","user"}
> - Status = {"PENDING","APPROVED","REJECTED","RETURNED"}

## module-dependencies
As Nest.js enforce modular architecture to better organize the code and provide separation of concerns, the app modules and their dependencies as follows:
- AppModule: Root module that imports and combines all other modules.
- AuthModule: Handles authentication and imports UsersModule and JwtModule.
- UsersModule: Manages user-related operations and imports DatabaseModule.
- BooksModule: Manages book-related operations and imports DatabaseModule.
- BorrowModule: Manages borrow-related operations and imports BooksModule, UsersModule, and DatabaseModule.
- CommonModule: Contains shared utilities and services.
- DatabaseModule: Provides database connection and configurations.



