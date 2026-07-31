import api from "./api";

export const createBill = async (saleId) => {
  const res = await api.post(`/Bill/sale/${saleId}`);
  return res.data;
};

export const getBills = async() =>{
  const res = await api.get("/Bill")
  return res.data;
}

export const getBillsBySale = async (saleId) => {
  const res = await api.get(`/Bill/sale/${saleId}`);
  return res.data;
};

export const updateBillStatus = async (billId, status) => {
  const res = await api.put(`/Bill/${billId}/status`, { status });
  return res.data;
};
