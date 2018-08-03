# Authentication API Library

```
import {AuthenticationService} from 'matris-authentication-api';
...


const service = AuthenticationService({url: 'http://localhost:3000'});

const token = await service.password('mail@email.com', '12345678');
// Returns authentication token
```


## Todo

- Update docs

## Test

```
npm run test
```