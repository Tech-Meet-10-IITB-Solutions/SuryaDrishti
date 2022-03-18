---
tags: [Inter IIT]
title: Installation
created: '2022-03-18T09:01:17.416Z'
modified: '2022-03-18T14:48:31.903Z'
---

# Installation

### Dependencies

AstroNetra depends on npm, node.js and Python3.8

npm and node.js can be installed with -

```
$ sudo apt -y install curl;
$ curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -;
$ sudo apt -y install nodejs;
```

- [requirements.txt](../requirements.txt)
- [package.json](../frontend/package.json)

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
