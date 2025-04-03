import axios from "axios";

/* const API_BASE_URL = "http://localhost:5124/api"; */
const API_BASE_URL = "https://activepong.azurewebsites.net/api";

axios.defaults.withCredentials = true; // Always send cookies with requests

export default API_BASE_URL;