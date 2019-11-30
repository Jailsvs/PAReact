import axios from 'axios';

const auction_api = axios.create({
    baseURL: 'https://localhost:5005'//44365
});
export default auction_api;

const user_api = axios.create({
    baseURL: 'https://localhost:5003'//44365
});

export {
    auction_api,
    user_api,
  }
