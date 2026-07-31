import api  from "./api";

export const AddCategory = async (category) =>{
    const res = await api.post("/Category",category);
    return res.data;
};

export const GetCategory = async () =>{
    const res = await api.get("/Category");
    return res.data;
};

export const Update = async (id,category) =>{
    const res = await api.put(`Category/${id}`,category)
    return res.data;
};

export const DeleteCategory = async (Id) =>{
    const res = await api.delete(`Category/${Id}`);
    return res.data;
}