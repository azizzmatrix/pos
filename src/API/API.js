import axios from 'axios';

const api = axios.create({ baseURL: 'https://localhost:7097/api' });

api.interceptors.request.use((req) =>{
    const user = localStorage.getItem("user");
    if(user){
        const token = JSON.parse(user).token;
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default api;