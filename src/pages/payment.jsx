import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPaymentsBySale, addPayment } from "../api/paymentApi";
import { createBill } from "../API/bill";
import { updateSale } from "../API/salesApi";
import "./payment.css";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const sale = location.state?.sale;
  
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState(sale ? sale.netAmount : 0);
  const [method, setMethod] = useState(sale ? sale.method : "Online");
  const [splitPayments, setSplitPayments] = useState([]);
  const [isSplitMode, setIsSplitMode] = useState(false);

  useEffect(() => {
    if (sale) {
      getPaymentsBySale(sale.saleId).then(setPayments);
    }
  }, [sale]);

  if (!sale) return <p>No sale data provided.</p>;

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = sale.netAmount - totalPaid;

  // ✅ Single Payment
  const handleAddPayment = async () => {
    try {
      const bill = sale.bill? sale.bill : await createBill(sale.saleId);

      const paymentDto = {
        saleId: sale.saleId,
        billId: bill.billId,
        amount,
        method,
        status: "Paid"
      };

      const saved = await addPayment(paymentDto);
      const newPayments = [...payments, saved];
      setPayments(newPayments);

      const newTotalPaid = newPayments.reduce((s, p) => s + p.amount, 0);
      setAmount(sale.netAmount - newTotalPaid);

      navigate("/bill", { state: { bill } });
    } catch (err) {
      console.error("Payment failed:", err);
      alert("Could not process payment: " + err);
    }
  };

  // ✅ Enable Split Mode
  const handleSplitPayment = () => {
    const half = remaining / 2;
    setSplitPayments([
      { amount: half, method: sale.method, status: "Paid" },
      { amount: half, method: "Cash", status: "Paid" }
    ]);
    setIsSplitMode(true);
  };

  // ✅ Save Split Payments
  const handleSaveSplitPayments = async () => {
    try {
      const bill = sale.bill ? sale.bill : await createBill(sale.saleId);
      const combine = splitPayments.map(sp => sp.method).join("/");

      const totalAmount = splitPayments.reduce((sum,sp) => sum + Number(sp.amount),0);

      const paymentDto ={
        saleId: sale.saleId,
        billId: bill.billId,
        amount: totalAmount,
        method: combine,
        status:"Paid"
      };
      
      const save = await addPayment(paymentDto);
      setPayments(prev => [...prev,save]);

      setSplitPayments([]);
      setIsSplitMode(false);

      navigate("/bill", { state: { bill } });
    } catch (err) {
      console.error("Split payment failed:", err);
      alert("Could not process split payments: " + err);
    }
  };

  const handleCancelSplit = () => {
    setSplitPayments([]);
    setIsSplitMode(false);
  };

  // ✅ Back Button
  const handleBack = () => {
    navigate(`/sale-editor/${sale.saleId}`);
  };

  // ✅ Abandon Payment
  const handleAbandon = async () => {
    try {
      const payload ={
        sale:{
          saleId: sale.saleId,
          customerNumber :sale.customerNumber,
          status: "Abandoned",
          method: "Abandoned",
          discount: 0,
          tax: 0,
          totalAmount: 0,
          netAmount: 0
        },
        details:[]
      };
      const updatedSale = await updateSale(payload);
      alert("Sale marked as Abandoned");
      navigate("/", {state:{sale:updatedSale}});
    } catch (err) {
      console.error("Abandon failed:", err);
      alert("Could not abandon sale: " + err);
    }
  };

  return (
    <div className="payment-panel">
      <h2>Payment for Sale #{sale.saleId}</h2>
      <p>Total Due: ₹{sale.netAmount.toFixed(2)}</p>
      <p>Paid: ₹{totalPaid.toFixed(2)}</p>
      <p>Remaining: ₹{remaining.toFixed(2)}</p>

      {/* Show either single payment form OR split forms */}
      {!isSplitMode ? (
        <div className="payment-method">
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            max={remaining}
          />
          <label>Method</label>
          <select value={method} onChange={e => setMethod(e.target.value)}>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Online">Online</option>
          </select>
        </div>
      ) : (
        splitPayments.map((sp, idx) => (
          <div key={idx} className="payment-method">
            <label>Split Amount</label>
            <input
              type="number"
              value={sp.amount}
              onChange={e => {
                const newSplits = [...splitPayments];
                newSplits[idx].amount = Number(e.target.value);
                setSplitPayments(newSplits);
              }}
            />
            <label>Method</label>
            <select
              value={sp.method}
              onChange={e => {
                const newSplits = [...splitPayments];
                newSplits[idx].method = e.target.value;
                setSplitPayments(newSplits);
              }}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
            </select>
          </div>
        ))
      )}

      <div className="payment-actions">
        {!isSplitMode && (
          <>
            <button onClick={handleAddPayment} disabled={amount <= 0 || remaining <= 0}>
              Add Payment
            </button>
            <button onClick={handleSplitPayment} disabled={remaining <= 0}>
              Split Payment
            </button>
          </>
        )}
        {isSplitMode && (
          <>
            <button onClick={handleSaveSplitPayments}>Save Split Payments</button>
            <button onClick={handleCancelSplit}>Cancel Split</button>
          </>
        )}
        <button onClick={handleBack}>Back</button>
        <button onClick={handleAbandon} className="abandon-btn">
          Abandon Payment
        </button>
      </div>

      <h3>Payments Recorded</h3>
      <ul>
        {payments.map(p => (
          <li key={p.paymentId}>
            {p.method} — ₹{p.amount} ({p.status})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Payment;
