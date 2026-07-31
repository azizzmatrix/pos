import api from "./api";

export const getProducts = async () => {
  const res = await api.get("/Product");
  return res.data;
};

export const addProduct = async (product) => {
  const res = await api.post("/Product", product);
  return res.data;
};

export const updateProduct = async (productId, product) => {
  const res = await api.put(`/Product/${productId}`, product);
  return res.data;
};
