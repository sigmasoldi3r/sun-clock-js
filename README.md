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
