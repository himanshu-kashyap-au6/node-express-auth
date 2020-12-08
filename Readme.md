# Antarctica Global Application

## By Himanshu Kashyap

---

## Table of contents

  1. [Project commands](#project-commands)
  2. [Technologies Used](#technologies-used)
  3. [File Structure](#file-structure)
  4. [API Endpoints Used](#api-endpoints-used)

---

## Install Instructions

### Installs code base

```bash
npm install
```

### Sever start command

```bash
npm start
```

### Run your tests

```bash
npm test
```

## Technologies Used

* Functionalities of the application
  * __Node.js__
  * __mongoose__
  * __express__
  * __mongodb-memory-server__
  * __bcryptjs__
  * __passportjs__
  * __express-validator__

---

## File Structure

* __antarcticaglobal__ (Root directory)
  * __Config__ (All global files)
    * __globals.js__ (Al global variables)
  * __controller__ (All controllers)
    * __commonController.js__ (All functions)
  * __db__ (All database related files)
    * __db.js__ (Connections with db)
  * __Middleware__ (All middleware files)
    * __custom.js__ (All custom middlewares)
    * __passport.js__ (Passport local and JWT stretigies)
  * __Model__ (All Schema related fiels of different collection)
    * __Employee.js__ (Declaration of employee collection)
    * __User.js__ (Declaration of User collection)
  * __routes__ (All routes related fiels of different end points)
    * __commonRoutes__ (All commonRoutes related fiels)
        *__commonRoutes.js__ (All common endPoints)
    * __routes.js__ (root file for all end points/ routes)
  * __test__ (All test related fiels of different end points)
    * __routes.test.js__ (Test all end points)
  * __utils__ (All common function for utilization at any place)
    * __mailer.js__ (nodemailer function to send email using smtp service)
    * __schemaRelated.js__ (Schema related function like generateToken on register)
  * __app.js__ (server declaration)
  * __jest.config.js__ (To configure jest)

---

## API Endpoints Used

* __GET__
  * __/ get-data__

    ```req.query
    {
        role: user or employee
        optionalParameters: [ 'firstName', 'lastName', 'emailId', 'organizationName', 'publicId', '_id', 'fName', 'lName', 'email', 'orgName', 'pubId', 'mId' ]
    }
    ```

  * __/ profile__ (with header accessToken)

    ```req.query
    {
        role: user or employee
    }
    ```

  * __/ confirm-email/:id__ (id = accessToken)

    ```req.query
    {
        role: user or employee
    }
    ```

* __POST__
  * __/ register__

    ```req.query
    {
        role: user or employee
    }
    ```

    ```req.body
    {
        "firstName": "required",
        "lastName": "required",
        "emailId": "required",
        "password": "required",
        "organizationName": "required"
    }
    ```

  * __/ login__
  
    ```req.query
    {
        role: user or employee
    }
    ```

    ```req.body
    {
        "emailId": "required",
        "password": "required",
    }
    ```

  * __/ forgot-password__
  
    ```req.query
    {
        role: user or employee
    }
    ```

    ```req.body
    {
        "emailId": "required",
    }
    ```

  * __/ reset-password__ (with header accessToken)

    ```req.query
    {
        role: user or employee
    }
    ```

    ```req.body
    {
        "newPassword": "required",
        "confirmPassword": "required",
    }
    ```

* __PATCH__
  * __/ change-password__ (with header accessToken)

    ```req.query
    {
        role: user or employee
    }
    ```

    ```req.body
    {
        "emailId": "required",
        "oldPassword": "required",
        "newPassword": "required",
    }
    ```

* __DELETE__
  * __/ logout__ (with header accessToken)

    ```req.query
    {
        role: user or employee
    }
    ```
