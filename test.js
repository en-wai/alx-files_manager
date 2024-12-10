const credentials = 'akram@gmail.com:mypassword123';
const base64Credentials = Buffer.from(credentials).toString('base64');
console.log('Basic ' + base64Credentials);
