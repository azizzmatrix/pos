import api from "./api"

export const getUserName = async (userId) => {
  const res = await api.get(`/User/${userId}`);
  return res.data.userName;
};

export const login = async (credentials)=>{
    const res = await api.post("User/login",credentials);
    localStorage.setItem("userName", res.data.userName);
    return res.data;
};

export const signupUser = async (UserData) =>{
    const res = await api.post("User/signup",UserData);
    return res.data;
};

export const resetPassword = async(data) =>{
 const res = await api.post("/User/rest-password",data);
 return res.data;
};

export const datateUser = async (userId) =>{
    const res = await api.delete(`/User/${userId}`);
    return res.data;
};