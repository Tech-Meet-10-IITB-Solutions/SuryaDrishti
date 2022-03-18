## Installation Procedure for AstroNetra

### Dependencies

AstroNetra depends on npm, node.js and Python3.8

npm and node.js can be installed with -

```
$ sudo apt -y install curl;
$ curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -;
$ sudo apt -y install nodejs;
```

### Run the backend

```
$ cd backend/;
$ pip install -r ../requirements.txt;
$ uvicorn server:app;
```

### Run the frontend

```
$ cd frontend/;
$ npm i;
$ npm start;
```

### Accessing the interface

You can simply go to either of the following addresses in your browser to access the interface -

```
localhost:4200
```
