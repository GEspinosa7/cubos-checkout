const swaggerAutogen = require('swagger-autogen');

swaggerAutogen()('./swagger.json', ['../router.js']);
