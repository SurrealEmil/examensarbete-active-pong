import axios from "axios";

const API_BASE_URL = "http://localhost:7070/api";

axios.defaults.withCredentials = true; // Always send cookies with requests

export default API_BASE_URL;