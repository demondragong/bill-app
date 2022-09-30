<a name="readme-top"></a>
# BillApp (debugging and testing project)

Training project to practice testing (unit, integration, end-to-end) and Jest.

## Getting Started

### Instructions to run the backend

See backend's readme...



### Instructions to run the frontend

1. Open a terminal window in the cloned project
1. Navigate to the frontend folder (cd Billed-app-FR-Front)
1. Run the following commands

```bash
# Install dependencies
npm install

# Install liveserver
npm install -g live-server

# Launch liverserver
live-server
```

Then go to `http://127.0.0.1:8080/`

## Comment lancer tous les tests en local avec Jest ?

```
$ npm run test
```

## Comment lancer un seul test ?

Installez jest-cli :

```
$npm i -g jest-cli
$jest src/__tests__/your_test_file.js
```

### To see the test coverage report go to:

`http://127.0.0.1:8080/coverage/lcov-report/`

### Testing accounts :

### admin : 
```
user : admin@test.tld 
password : admin
```
### employee :
```
user : employee@test.tld
password : employee
```



<p align="right">(<a href="#readme-top">back to top</a>)</p>



