# sun-clock-js

A simple JS library that calculates the sunrise and the sunset, given your location.

Example of usage:

```js
const { Sun } = require('./Sun');

const sun = new Sun(41.549166666666665, 2.3088888888888888);

console.log(`sunrise = ${sun.sunrise}`);
console.log(`sunset = ${sun.sunset}`);

console.log('Golden hour:');
console.log(`sunrise = ${sun.golden.sunrise}`);
console.log(`sunset = ${sun.golden.sunset}`);
```

Example output:

```
sunrise = Tue Mar 30 2021 07:38:01 GMT+0200 (GMT+02:00)
sunset = Tue Mar 30 2021 20:13:27 GMT+0200 (GMT+02:00)
Golden hour:
sunrise = from Tue Mar 30 2021 07:08:01 GMT+0200 (GMT+02:00) to Tue Mar 30 2021 08:08:01 GMT+0200 (GMT+02:00)
sunset = from Tue Mar 30 2021 19:43:27 GMT+0200 (GMT+02:00) to Tue Mar 30 2021 20:43:27 GMT+0200 (GMT+02:00)
```
