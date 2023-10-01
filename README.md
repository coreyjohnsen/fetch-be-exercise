## Fetch Backend Exercise

### Summary

This project includes an API that allows for points to be added to a user's account, points to be spent from a user's account, and the balance of the user to be retrieved.

### Running the App

To start the API, clone the repo and ensure that Node and NPM are installed on the machine. Then, from the project directory, do the following:

1. Run `npm install`

This will install ExpressJS and LocalStorage, which are both used by the application.

2. Run `npm start`

This will start the API on port 8000 and it can then be accessed from `localhost:8000/<endpoint>`. When the server is started, you can check that it is running by going to `localhost:8000`, which should display `Up and running`. To stop the application, use Ctrl-C.

### API Endpoints

There are 3 endpoints provided by this API.

1. `POST /add`

This endpoint will add points to a user's account. The request body must be formatted as follows:
```
{
    "payer" : "DANNON",
    "points" : 5000,
    "timestamp" : "2020-11-02T14:00:00Z"
}
```
The body specifies the company that is paying the points, the number of points to add, and the timestamp of the transaction. If the points are added, the endpoint should return a status code 200. If there is an issue with the body's format, the endpoint will respond with a code of 400.

2. `POST /spend`

This endpoint will spend points from a user's account, spending the oldest points (based on timestamp) first. The request body should be formatted as follows:
```
{"points" : 5000}
```
The body specified the number of points to spend from the user's account.  If the user does not have enough points, the endpoint will respond with a status code of 400 and a message saying the user does not have enough points. If the request body is not formatted correctly, the endpoint will respond with a status code of 400. If the points are successfully spent, the endpoint will return a list of the payers that the points were spent from and how many points were spent from each with a status code of 200. An example is below:
```
[
    { "payer": "DANNON", "points": -100 },
    { "payer": "UNILEVER", "points": -200 },
    { "payer": "MILLER COORS", "points": -4,700 }
]
```

3. `GET /balance`

This endpoint will get the points in the user's account sorted based on payer. There is no request body for this endpoint. The endpoint will return a JSON object that contains each payer's name and the number of points in the user's account from them with a status code of 200. An example is shown below:
```
{
    "DANNON": 1000,
    ”UNILEVER” : 0,
    "MILLER COORS": 5300
}
```

### Using the API

The API can be easily used with `curl`. To use the API, open a shell and use the following command:

`curl -H "Content-Type: application/json" -d <request_body> 127.0.0.1:8000/<endpoint>`

Note that you will need to specify the endpoint that you would like to call. Additionally, surround the request body with quotes and change any quotes on the inside of the body to `\"` instead. For example, if you wanted to call the `/spend` endpoint and your request body was:
```
{"points" : 5000}
```
The curl command would be:

`curl -H "Content-Type: application/json" -d "{\"points\":5000}" 127.0.0.1:8000/spend`

Also note that `-H "Content-Type: application/json" -d <request_body>` is not needed if you are making a call to a `GET` endpoint.

The endpoint can also be used with other software such as Postman.