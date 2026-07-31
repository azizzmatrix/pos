import { useLocation, useNavigate } from "react-router-dom";
import "./bill.css";

function getDropboxRawUrl(url) {
  if (!url) return "";
  return url.replace("dl=0", "raw=1").replace("dl=1", "raw=1");
}

function Bill() {
  const location = useLocation();
  const navigate = useNavigate();
  const bill = location.state?.bill;

  if (!bill) return <p>No bill data provided.</p>;

  const pdfUrl = getDropboxRawUrl(bill.pdfUrl);

  return (
    <div className="bill-panel">
      <h2>Sale #{bill.saleId}</h2>

      <div className="bill-details">
        <h2>POS APP</h2>

        <p>Inserted Date: {new Date(bill.insertedDate).toLocaleString()}</p>
        <p>Customer Number: {bill.customerNumber}</p>
        <p>Amount: ₹{bill.amount.toFixed(2)}</p>
        <p>Status: {bill.status ?? "N/A"}</p>

        <p>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
            View PDF
          </a>
        </p>
      </div>

      <button className="done-btn" onClick={() => navigate("/")}>
        Done
      </button>
    </div>
  );
}

export default Bill;
