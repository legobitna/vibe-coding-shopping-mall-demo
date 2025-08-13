import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import { API_BASE_URL } from "../config/api";

function CartPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);

  // 사용자 정보 가져오기
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.name) setUser(data);
        } else {
          navigate("/login");
        }
      } catch (e) {
        navigate("/login");
      }
    })();
  }, [navigate]);

  // 장바구니 데이터 가져오기
  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
        setCartItemCount(data.totalItems || 0);
      } else if (response.status === 404) {
        // 장바구니가 없으면 빈 장바구니로 설정
        setCart({ items: [], totalAmount: 0, totalItems: 0 });
        setCartItemCount(0);
      } else {
        throw new Error("장바구니를 가져오는데 실패했습니다.");
      }
    } catch (err) {
      setError(err.message);
      console.error("장바구니 가져오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  // 수량 변경
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cart/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      if (response.ok) {
        fetchCart(); // 장바구니 새로고침
      } else {
        throw new Error("수량 변경에 실패했습니다.");
      }
    } catch (err) {
      alert(err.message);
      console.error("수량 변경 실패:", err);
    }
  };

  // 상품 삭제
  const removeItem = async (productId) => {
    if (!confirm("장바구니에서 이 상품을 삭제하시겠습니까?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cart/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        fetchCart(); // 장바구니 새로고침
      } else {
        throw new Error("상품 삭제에 실패했습니다.");
      }
    } catch (err) {
      alert(err.message);
      console.error("상품 삭제 실패:", err);
    }
  };

  // 장바구니 비우기
  const clearCart = async () => {
    if (!confirm("장바구니를 모두 비우시겠습니까?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchCart(); // 장바구니 새로고침
      } else {
        throw new Error("장바구니 비우기에 실패했습니다.");
      }
    } catch (err) {
      alert(err.message);
      console.error("장바구니 비우기 실패:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ background: "#f7f8fa", minHeight: "100vh" }}>
        <Navbar user={user} cartItemCount={cartItemCount} />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
            fontSize: 18,
            color: "#666",
          }}
        >
          장바구니를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f7f8fa", minHeight: "100vh" }}>
      <Navbar user={user} cartItemCount={cartItemCount} />

      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 64px" }}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate("/")}
              style={{
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                padding: 0,
                color: "#666",
              }}
            >
              ←
            </button>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
              장바구니
            </h1>
          </div>

          {cart && cart.items && cart.items.length > 0 && (
            <button
              onClick={clearCart}
              style={{
                background: "#f3f4f6",
                color: "#dc2626",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 16,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              장바구니 비우기
            </button>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
              color: "#dc2626",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* 빈 장바구니 */}
        {cart && (!cart.items || cart.items.length === 0) && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              padding: "60px 40px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 48,
                marginBottom: 16,
              }}
            >
              🛒
            </div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 600,
                marginBottom: 8,
                color: "#333",
              }}
            >
              장바구니가 비어있습니다
            </h2>
            <p
              style={{
                color: "#666",
                fontSize: 16,
                marginBottom: 24,
              }}
            >
              마음에 드는 상품을 장바구니에 담아보세요!
            </p>
            <Link to="/">
              <button
                style={{
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 24px",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                쇼핑 계속하기
              </button>
            </Link>
          </div>
        )}

        {/* 장바구니 상품 목록 */}
        {cart && cart.items && cart.items.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: 32,
            }}
          >
            {/* 상품 목록 */}
            <div>
              {cart.items.map((item) => (
                <div
                  key={item.product._id}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    padding: 20,
                    marginBottom: 16,
                    display: "flex",
                    gap: 16,
                  }}
                >
                  {/* 상품 이미지 */}
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 8,
                      overflow: "hidden",
                      flexShrink: 0,
                      background: "#f8f9fa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.innerHTML =
                            '<span style="color: #bbb; font-size: 12px;">이미지</span>';
                        }}
                      />
                    ) : (
                      <span style={{ color: "#bbb", fontSize: 12 }}>
                        이미지
                      </span>
                    )}
                  </div>

                  {/* 상품 정보 */}
                  <div style={{ flex: 1 }}>
                    <Link
                      to={`/product/${item.product._id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 600,
                          marginBottom: 8,
                          color: "#333",
                          cursor: "pointer",
                        }}
                      >
                        {item.product.name}
                      </h3>
                    </Link>
                    <p
                      style={{
                        color: "#666",
                        fontSize: 14,
                        marginBottom: 8,
                      }}
                    >
                      SKU: {item.product.sku}
                    </p>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#333",
                        marginBottom: 16,
                      }}
                    >
                      ₩{item.price.toLocaleString()}
                    </p>

                    {/* 수량 조절 및 삭제 */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {/* 수량 조절 */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <button
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            border: "1px solid #ddd",
                            background: item.quantity <= 1 ? "#f5f5f5" : "#fff",
                            cursor:
                              item.quantity <= 1 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            fontWeight: 600,
                            color: item.quantity <= 1 ? "#ccc" : "#333",
                          }}
                        >
                          −
                        </button>
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            minWidth: 20,
                            textAlign: "center",
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity + 1)
                          }
                          disabled={item.quantity >= 10}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            border: "1px solid #ddd",
                            background:
                              item.quantity >= 10 ? "#f5f5f5" : "#fff",
                            cursor:
                              item.quantity >= 10 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            fontWeight: 600,
                            color: item.quantity >= 10 ? "#ccc" : "#333",
                          }}
                        >
                          +
                        </button>
                      </div>

                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => removeItem(item.product._id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#dc2626",
                          cursor: "pointer",
                          fontSize: 14,
                          fontWeight: 500,
                          padding: "4px 8px",
                          borderRadius: 4,
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#fef2f2";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "none";
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {/* 소계 */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "flex-end",
                      minWidth: 100,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#333",
                        margin: 0,
                      }}
                    >
                      ₩{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 주문 요약 */}
            <div>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  padding: 24,
                  position: "sticky",
                  top: 120,
                }}
              >
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 20,
                    color: "#333",
                  }}
                >
                  주문 요약
                </h3>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    paddingBottom: 12,
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <span style={{ color: "#666" }}>
                    상품 수량 ({cart.totalItems}개)
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    ₩{cart.totalAmount.toLocaleString()}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    paddingBottom: 12,
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <span style={{ color: "#666" }}>배송비</span>
                  <span style={{ fontWeight: 600, color: "#059669" }}>
                    무료
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 24,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  <span>총 결제금액</span>
                  <span style={{ color: "#dc2626" }}>
                    ₩{cart.totalAmount.toLocaleString()}
                  </span>
                </div>

                <button
                  style={{
                    width: "100%",
                    background: "#111",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "16px",
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                    marginBottom: 12,
                  }}
                  onClick={() => navigate("/checkout")}
                >
                  결제하기
                </button>

                <Link to="/">
                  <button
                    style={{
                      width: "100%",
                      background: "#f8f9fa",
                      color: "#333",
                      border: "1px solid #e9ecef",
                      borderRadius: 8,
                      padding: "12px",
                      fontSize: 16,
                      fontWeight: 500,
                      cursor: "pointer",
                      textDecoration: "none",
                      display: "block",
                      textAlign: "center",
                    }}
                  >
                    쇼핑 계속하기
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
