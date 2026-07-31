import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSaleDetails,
  updateSaleDetail,
  deleteSaleDetail,
  addSaleDetail,
  getSales,
  updateSale
} from "../API/salesApi";
import { getProducts } from "../API/productApi";
import "./SalesEditor.css";

function SaleEditor() {
  const { saleId } = useParams();
  const navigate = useNavigate();

  const [sale, setSale] = useState(null);
  const [details, setDetails] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (saleId) {
      getSales().then((sales) => {
        const currentSale = sales.find((s) => s.saleId === Number(saleId));
        if (currentSale) {
          setSale({
            saleId: currentSale.saleId,
            customerNumber: currentSale.customerNumber,
            status: currentSale.status,
          });
        }
      });
      getSaleDetails(saleId).then((data) => {
        console.log("Sale details API response:", data);

        if (Array.isArray(data)) {
          // Expect backend to include customerNumber and status from Sale table
          setSale({});
          setDetails(data);
        }
      });
    }
    getProducts().then(setProducts);
  }, [saleId]);

  if (!sale) return <p>Loading sale...</p>;

  const refreshDetails = async () => {
    const updatedDetails = await getSaleDetails(saleId);
    setDetails(updatedDetails);
  };

  const handleUpdateItem = async (detail, change) => {
    try {
      const newQty = Number(detail.quantity) + change;

      if (newQty < 1) {
        await deleteSaleDetail(detail.saleDetailId);
      } else {
        const updatedDetail = {
          ...detail,
          quantity: newQty,
          price: Number(detail.unitPrice) * newQty,
        };
        await updateSaleDetail(updatedDetail);
      }

      await refreshDetails();
    } catch (err) {
      console.error("Update item failed:", err);
      alert("Failed to update item: " + err);
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await deleteSaleDetail(id);
      await refreshDetails();
      alert("Item deleted successfully!");
    } catch (err) {
      alert("Failed to delete item: " + err);
    }
  };

  const handleAddProduct = async (product) => {
    try {
      const existing = details.find((d) => d.productId === product.productId);

      if (existing) {
        const newQty = Number(existing.quantity) + 1;
        const updatedDetail = {
          ...existing,
          quantity: newQty,
          price: Number(existing.unitPrice) * newQty,
        };
        await updateSaleDetail(updatedDetail);
      } else {
        const newDetail = {
          saleId,
          productId: product.productId,
          quantity: 1,
          unitPrice: Number(product.price),
          price: Number(product.price),
        };
        await addSaleDetail(newDetail);
      }

      await refreshDetails();
    } catch (err) {
      console.error("Add product failed:", err);
      alert("Failed to add product: " + err);
    }
  };

  const handleProceedToPayment = async () => {
  try {
    const subtotal = details.reduce(
      (sum, d) => sum + Number(d.unitPrice || 0) * Number(d.quantity || 0),
      0
    );
    const tax = subtotal * 0.08;
    const netAmount = subtotal + tax;

    const payload = {
      sale: {
        saleId: sale.saleId,
        customerNumber: sale.customerNumber,
        status: sale.status,
        method: "Cash", // or whatever method you want
        discount: 0,
        tax,
        totalAmount: subtotal,
        netAmount
      },
      details: details.map(d => ({
        productId: d.productId,
        quantity: d.quantity,
        unitPrice: d.unitPrice,
        price: d.unitPrice * d.quantity
      }))
    };

    const updatedSale = await updateSale(payload);

    navigate("/payment", { state: { sale: updatedSale } });
  } catch (err) {
    alert("Failed to proceed to payment: " + err);
  }
};


  const subtotal = details.reduce(
    (sum, d) => sum + Number(d.unitPrice) * Number(d.quantity),
    0,
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="cashier-panel">
      {/* Product Catalog */}
      <div className="product-catalog">
        <h2>Products</h2>
        <div className="product-grid">
          {products.map((p) => (
            <div key={p.productId} className="product-card">
              <img src={p.imageUrl || "/placeholder.png"} alt={p.productName} />
              <h3>{p.productName}</h3>
              <p>{p.manufacturerName?.toUpperCase()}</p>
              <p>₹{Number(p.price).toFixed(2)}</p>
              <p>
                {p.totalQuantity > 10 ? "IN STOCK" : `LOW: ${p.totalQuantity}`}
              </p>
              <button onClick={() => handleAddProduct(p)}>Add</button>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Window */}
      <div className="cart-window">
        <h2>
          Sale #{sale.saleId} | Customer: {sale.customerNumber}
        </h2>

        {details.length === 0 ? (
          <p>Cart is empty</p>
        ) : (
          <div className="cart-list-wrapper">
            <ul>
              {details.map((item) => (
                <li key={item.saleDetailId} className="cart-item">
                  <div className="item-details">
                    <span>{item.productName}</span>
                    <span>
                      ₹
                      {(Number(item.unitPrice) * Number(item.quantity)).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                  <div className="quantity-controls">
                    <button onClick={() => handleUpdateItem(item, -1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleUpdateItem(item, +1)}>
                      +
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleRemoveItem(item.saleDetailId)}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Totals */}
        <div className="totals">
          <p>
            Subtotal <span>₹{subtotal.toFixed(2)}</span>
          </p>
          <p>
            Tax (8%) <span>₹{tax.toFixed(2)}</span>
          </p>
          <p>
            <strong>
              Total <span>₹{total.toFixed(2)}</span>
            </strong>
          </p>
        </div>

        {/* Status + Payment together */}
        <div className="status-payment">
          <div className="status-display">
            <label>Status:</label>
            <span className="status-value">{sale.status}</span>
          </div>
          <button
            className="checkout-btn"
            onClick={handleProceedToPayment}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaleEditor;
