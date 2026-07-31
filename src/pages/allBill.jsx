import { useEffect, useState } from "react";
import { getBills } from "../API/bill";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Home.module.css";

function AllBill() {
  const [searchTerm, setSearchTerm] = useState("");
  const [bills, setBills] = useState([]); // <-- store bills here
  const [user] = useState(() => localStorage.getItem("userName"));

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getBills().then((data) => setBills(data)); // <-- fetch bills
  }, []);

  // Optional: filter bills by search term
  const filteredBills = bills.filter(
    (bill) =>
      bill.customerNumber?.toString().includes(searchTerm) ||
      bill.saleId?.toString().includes(searchTerm),
  );

  return (
    <div className={styles["home-layout"]}>
      {/* Sidebar */}
      <aside className={styles["side-bar"]}>
        <div className={`${styles["nav-icon"]} ${styles["active"]}`}>🛒</div>
        <div
          className={`${styles["nav-icon"]} ${location.pathname === "/" ? styles["active"] : ""}`}
          onClick={() => navigate("/")}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </div>
        <div
          className={`${styles["nav-icon"]} ${location.pathname === "/AllBill" ? styles["active"] : ""}`}
          onClick={() => navigate("/AllBill")}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles["main-content"]}>
        <div className={styles["cashier-panel"]}>
          {/* Top Bar */}
          <div className={styles["top-bar"]}>
            <h2 className={styles["site-name"]}>QuickMart POS</h2>
            <input
              type="text"
              placeholder="Search bills by customer or ID..."
              className={styles["search-bar"]}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className={styles["user-section"]}>
              <span className={styles["notification-icon"]}>🔔</span>
              <span className={styles["user-profile"]}>{user || "Guest"}</span>
            </div>
          </div>

          {/* Bill Catalog */}
          <div className={styles["product-catalog"]}>
            <h2>All Bills</h2>
            <div className={styles["bill-grid"]}>
              {filteredBills.map((bill) => (
                <div key={bill.saleId} className={styles["bill-card"]}>
                  <h3>Sale #{bill.saleId}</h3>
                  <p>
                    Inserted Date:{" "}
                    {new Date(bill.insertedDate).toLocaleString()}
                  </p>
                  <p>Customer Number: {bill.customerNumber}</p>
                  <p>Amount: ₹{bill.amount.toFixed(2)}</p>
                  <p>Status: {bill.status ?? "N/A"}</p>
                  {bill.pdfUrl && (
                    <p>
                      <a
                        href={bill.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View PDF
                      </a>
                    </p>
                  )}
                  <button
                    className={styles["done-btn"]}
                    onClick={() => navigate("/")}
                  >
                    Done
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AllBill;
