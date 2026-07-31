import api from "./api";

// Fetch all historical sales records
export const getSales = async () => {
  const res = await api.get("/Sale");
  return res.data;
};

// Start a new cart session / invoice transaction
export const createSale = async (payload) =>{
  const res = await api.post("/Sale", payload);
  return res.data;
};

// Update an entire active sale object
export const updateSale = async (updateRequest) => {
  const res = await api.put("/Sale", updateRequest);
  return res.data;
};

// Complete a transaction, record payment method, process final bills
export const finalizeSale = async (saleId, finalizeData) => {
  // finalizeData object shape should match backend DTO: { method: "CASH", discount: 10, tax: 5 }
  const res = await api.post(`/Sale/finalize/${saleId}`, finalizeData);
  return res.data;
};

// ==========================================
// LINE ITEM (CART) OPERATIONS
// ==========================================

// Pull active cart items currently sitting inside the database for a specific session
export const getSaleDetails = async (saleId) => {
  const res = await api.get(`/Sale/details/${saleId}`);
  return res.data;
};

// Push an individual scanned/selected product into the database cart
export const addSaleDetail = async (detail) => {
  const res = await api.post("/Sale/detail", detail);
  return res.data;
};

// Edit item quantities or change individual item prices directly inside the cart grid
export const updateSaleDetail = async (detail) => {
  const res = await api.put("/Sale/detail", detail);
  return res.data;
};

// Completely wipe out an item row from the active cart session layout
export const deleteSaleDetail = async (id) => {
  const res = await api.delete(`/Sale/detail/${id}`);
  return res.data;
};