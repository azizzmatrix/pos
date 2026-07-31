import api from "./api";

export const addPayment = async (payment) => {
  const res = await api.post("/Payment", payment);
  return res.data;
};

export const updatePaymentStatus = async (paymentId, status) => {
  const res = await api.put(`/Payment/${paymentId}/status`, { status });
  return res.data;
};

export const getPaymentsBySale = async (saleId) => {
  const res = await api.get(`/Payment/sale/${saleId}`);
  return res.data;
};
