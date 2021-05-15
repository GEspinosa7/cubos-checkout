const axios = require('axios');

const axiosInstance = axios.create({
   baseURL: 'https://api.pagar.me/1/',
   params: {
      api_key: 'ak_test_rFF3WFkcS9DRdBK7Ocw6QOzOOQEScS'
   }
});

module.exports = axiosInstance;