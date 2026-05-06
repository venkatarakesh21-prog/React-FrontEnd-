// apiConfig.js

const BASE_URL = process.env.REACT_APP_BASE_URL;
// Fallback ensures app works even if env is missing

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID ;

export { GOOGLE_CLIENT_ID };

export default BASE_URL;

