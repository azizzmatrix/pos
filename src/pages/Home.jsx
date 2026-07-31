import { useEffect, useState } from "react";
import { getProducts, updateProduct } from "../API/productApi";
import { useNavigate } from "react-router-dom";
import { createSale } from "../API/SalesApi";
import { GetCategory } from "../API/categoryapi";
import styles from "./Home.module.css";

function Home() {
  const [products, setProducts] = useState([]);
  const [categorys, setCategorys] = useState([]);
  const [user] = useState(() => localStorage.getItem("userName"));
  const [cart, setCart] = useState([]);
  const [method, setMethod] = useState("Cash");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Home");

  const navigate = useNavigate();

  useEffect(() => {
    getProducts().then((data) => setProducts(data));
    GetCategory().then((data) => setCategorys(data));
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.productName.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      p.batchid?.toLowerCase().startsWith(searchTerm.toLowerCase());

    const matchCategory =
      activeCategory === "Home" || p.categoryName === activeCategory;
    return matchSearch && matchCategory;
  });

  const addToCart = (product) => {
    const existing = cart.find((item) => item.productId === product.productId);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, change) => {
    setCart(
      cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item,
      ),
    );
  };

  const removeItem = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const checkout = async () => {
    const payload = {
      sale: {
        method,
        discount: 0,
        tax,
        status: "InProcess",
      },
      details: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        price: item.price * item.quantity,
      })),
    };

    try {
      const sale = await createSale(payload);

      // Update stock locally
      const updatedProducts = products.map((p) => {
        const cartItem = cart.find((c) => c.productId === p.productId);
        return cartItem
          ? { ...p, totalQuantity: p.totalQuantity - cartItem.quantity }
          : p;
      });
      setProducts(updatedProducts);

      // Persist stock changes
      for (const item of cart) {
        const updatedProduct = {
          ...item,
          totalQuantity: item.totalQuantity - item.quantity,
        };
        await updateProduct(item.productId, updatedProduct);
      }

      // Clear cart and navigate
      setCart([]);
      navigate("/payment", { state: { sale } });
    } catch (err) {
      console.error("Sale failed:", err);
      alert("Sale could not be processed. " + err);
    }
  };

  return (
    <div className={styles["home-layout"]}>
      {/* Sidebar */}
      <aside className={styles["side-bar"]}>
        <div className={`${styles["nav-icon"]} ${styles["active"]}`}>🛒</div>
        <div className={`${styles["nav-icon"]} ${location.pathname === "/" ? styles["active"]: ""}`} onClick={() => navigate("/")}>
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
        <div className={`${styles["nav-icon"]} ${location.pathname === "/AllBill" ? styles["active"]: ""}`}onClick={()=> navigate("/AllBill")}>
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
      <main className={styles["main-content"]}>
        <div className={styles["cashier-panel"]}>
          <div className={styles["top-bar"]}>
            <h2 className={styles["site-name"]}>QuickMart POS</h2>
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              className={styles["search-bar"]}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className={styles["user-section"]}>
              <span className={styles["notification-icon"]}>🔔</span>
              <span className={styles["user-profile"]}>{user || "Guest"}</span>
            </div>
          </div>
          <div className={styles["product-catalog"]}>
            <div className={styles["category-tabs"]}>
              {categorys.map((c) => (
                <button
                  key={c.categoryId}
                  onClick={() => setActiveCategory(c.categoryName)}
                  className={
                    activeCategory === c.categoryName
                      ? styles["active-tab"]
                      : ""
                  }
                >
                  {c.categoryName}
                </button>
              ))}
            </div>
            {/* Product Catalog */}
            <h2>Products</h2>

            <div className={styles["product-grid"]}>
              {filteredProducts.map((p) => (
                <div key={p.productId} className={styles["product-card"]}>
                  <img
                    src={p.imageUrl || "/placeholder.png"}
                    alt={p.productName}
                  />
                  <h3>{p.productName}</h3>
                  <p>{p.manufacturerName?.toUpperCase()}</p>
                  <p>₹{p.price.toFixed(2)}</p>
                  <p
                    className={
                      p.totalQuantity < 10
                        ? styles["low-stock"]
                        : styles["in-stock"]
                    }
                  >
                    {p.totalQuantity > 10
                      ? "IN STOCK"
                      : `LOW: ${p.totalQuantity}`}
                  </p>
                  <button
                    onClick={() => addToCart(p)}
                    disabled={p.totalQuantity <= 0}
                  >
                    {p.totalQuantity <= 0 ? "Out of Stock" : "Add"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Window */}
          <div className={styles["cart-window"]}>
            <h2>Current Order</h2>

            {cart.length === 0 ? (
              <p>Cart is empty</p>
            ) : (
              <div className={styles["cart-list-wrapper"]}>
                <ul>
                  {cart.map((item) => (
                    <li key={item.productId} className={styles["cart-item"]}>
                      <div className={styles["item-details"]}>
                        <span>{item.productName}</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className={styles["quantity-controls"]}>
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                        >
                          +
                        </button>
                        <button
                          className={styles["delete-btn"]}
                          onClick={() => removeItem(item.productId)}
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
            <div className={styles.totals}>
              <div className={styles["payment-method"]}>
                <label>Select Payment Method:</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Online">Online</option>
                </select>
              </div>
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
              <button
                className={styles["checkout-btn"]}
                disabled={cart.length === 0}
                onClick={checkout}
              >
                Charge ₹{total.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
