import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { API_BASE_URL } from "../config/api";

const categories = [
  { label: "Dresses" },
  { label: "Tops" },
  { label: "Bottoms" },
  { label: "Outerwear" },
];

function MainPage() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);

  // 사용자 정보 가져오기
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.name) setUser(data);
        }
      } catch (e) {}
    })();
  }, []);

  // 장바구니 아이템 수 가져오기
  useEffect(() => {
    const fetchCartItemCount = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCartItemCount(0);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCartItemCount(data.totalItems || 0);
        } else {
          setCartItemCount(0);
        }
      } catch (err) {
        console.error("장바구니 정보 가져오기 실패:", err);
        setCartItemCount(0);
      }
    };

    if (user) {
      fetchCartItemCount();
    } else {
      setCartItemCount(0);
    }
  }, [user]);

  // 상품 데이터 가져오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_BASE_URL}/products?limit=all`);
        if (!response.ok) {
          throw new Error("상품 데이터를 가져오는데 실패했습니다.");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
        console.error("상품 가져오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div style={{ background: "#faf7fa", minHeight: "100vh" }}>
      <Navbar user={user} cartItemCount={cartItemCount} />
      {/* Hero Section */}
      <section
        style={{
          marginTop: 80,
          width: "100%",
          minHeight: 320,
          background: "#fbeffb",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1 style={{ fontSize: 48, fontWeight: 700, margin: "40px 0 12px" }}>
          NEW ARRIVALS
        </h1>
        <div style={{ fontSize: 18, color: "#666", marginBottom: 32 }}>
          Discover the latest trends and express your unique style
        </div>
        <button
          style={{
            padding: "12px 36px",
            fontSize: 18,
            borderRadius: 8,
            background: "#222",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          SHOP NOW
        </button>
      </section>
      {/* 카테고리 버튼 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 32,
          margin: "40px 0",
        }}
      >
        {categories.map((cat) => (
          <div
            key={cat.label}
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              width: 160,
              height: 100,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 500,
              fontSize: 18,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                background: "#fbeffb",
                borderRadius: 12,
                marginBottom: 8,
              }}
            />
            {cat.label}
          </div>
        ))}
      </div>
      {/* Trending Now */}
      <section style={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "40px 0 8px" }}>
          TRENDING NOW
        </h2>
        <div style={{ color: "#888", marginBottom: 24 }}>
          Curated pieces that define this season
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

        {/* 로딩 상태 */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "#888",
              fontSize: 16,
            }}
          >
            상품을 불러오는 중...
          </div>
        )}

        {/* 상품 목록 */}
        {!loading && !error && (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}
          >
            {products.length === 0 ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "60px 0",
                  color: "#888",
                  fontSize: 16,
                }}
              >
                등록된 상품이 없습니다.
              </div>
            ) : (
              products.map((item) => (
                <Link
                  key={item._id}
                  to={`/product/${item._id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      padding: 24,
                      minHeight: 220,
                      position: "relative",
                      cursor: "pointer",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-4px)";
                      e.target.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                    }}
                  >
                    {/* 카테고리 태그 */}
                    <div
                      style={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        display: "flex",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#1bc47d",
                          background: "#e6f9f0",
                          borderRadius: 8,
                          padding: "2px 8px",
                        }}
                      >
                        {item.category}
                      </span>
                    </div>

                    {/* 상품 이미지 */}
                    <div
                      style={{
                        width: "100%",
                        height: 160,
                        background: "#f3f3f3",
                        borderRadius: 12,
                        marginBottom: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        padding: 8,
                        boxSizing: "border-box",
                      }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            width: "auto",
                            height: "auto",
                            objectFit: "contain",
                            borderRadius: 8,
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentNode.innerHTML =
                              '<span style="color: #bbb">이미지</span>';
                          }}
                        />
                      ) : (
                        <span style={{ color: "#bbb" }}>이미지</span>
                      )}
                    </div>

                    {/* 상품명 */}
                    <div
                      style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}
                    >
                      {item.name}
                    </div>

                    {/* SKU */}
                    <div
                      style={{ color: "#888", fontSize: 12, marginBottom: 8 }}
                    >
                      SKU: {item.sku}
                    </div>

                    {/* 가격 */}
                    <div style={{ fontWeight: 700, fontSize: 18 }}>
                      ₩{item.price.toLocaleString()}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </section>
      {/* 구독/푸터 */}
      <section
        style={{
          background: "#111",
          color: "#fff",
          marginTop: 64,
          padding: "48px 0 0",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          STAY IN THE LOOP
        </div>
        <div style={{ textAlign: "center", color: "#bbb", marginBottom: 24 }}>
          Be the first to know about new arrivals, exclusive offers, and style
          tips
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginBottom: 32,
          }}
        >
          <input
            type="email"
            placeholder="Enter your email"
            style={{
              padding: "10px 18px",
              borderRadius: 6,
              border: "none",
              fontSize: 16,
              width: 260,
            }}
          />
          <button
            style={{
              padding: "10px 24px",
              borderRadius: 6,
              background: "#fff",
              color: "#222",
              fontWeight: 600,
              fontSize: 16,
              border: "none",
              cursor: "pointer",
            }}
          >
            SUBSCRIBE
          </button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 80,
            fontSize: 15,
            color: "#bbb",
            marginBottom: 32,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              CIDER
            </div>
            <div style={{ maxWidth: 180 }}>
              Express your unique style with our curated collection of trendy
              fashion pieces.
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              SHOP
            </div>
            <div>New Arrivals</div>
            <div>Clothing</div>
            <div>Accessories</div>
            <div>Sale</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              SUPPORT
            </div>
            <div>Contact Us</div>
            <div>Size Guide</div>
            <div>Returns</div>
            <div>FAQ</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              CONNECT
            </div>
            <div>Instagram</div>
            <div>TikTok</div>
            <div>Twitter</div>
            <div>Pinterest</div>
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            color: "#888",
            fontSize: 13,
            padding: "16px 0 24px",
          }}
        >
          © 2024 CIDER. All rights reserved.
        </div>
      </section>
    </div>
  );
}

export default MainPage;
