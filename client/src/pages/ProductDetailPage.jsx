import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import { API_BASE_URL } from "../config/api";

const sizes = ["XS", "S", "M", "L", "XL"];
const colors = [
  { name: "Blue", code: "#4F9CF9" },
  { name: "Black", code: "#000000" },
  { name: "Light Blue", code: "#87CEEB" },
];

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Blue");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Description");
  const [user, setUser] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [addingToBag, setAddingToBag] = useState(false);

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

  // 상품 정보 가져오기
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) {
          throw new Error("상품을 찾을 수 없습니다.");
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
        console.error("상품 가져오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToBag = async () => {
    // 로그인 확인
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      setAddingToBag(true);
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity,
        }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCartItemCount(updatedCart.totalItems || 0);
        alert(
          `장바구니에 추가되었습니다!\n상품: ${product.name}\n사이즈: ${selectedSize}\n색상: ${selectedColor}\n수량: ${quantity}`
        );
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "장바구니에 추가하는데 실패했습니다."
        );
      }
    } catch (err) {
      console.error("장바구니 추가 실패:", err);
      alert(err.message);
    } finally {
      setAddingToBag(false);
    }
  };

  const handleAddToWishlist = () => {
    alert("위시리스트에 추가되었습니다!");
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
          상품 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ background: "#f7f8fa", minHeight: "100vh" }}>
        <Navbar user={user} cartItemCount={cartItemCount} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 18, color: "#dc2626" }}>
            {error || "상품을 찾을 수 없습니다."}
          </div>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <Navbar user={user} cartItemCount={cartItemCount} />

      {/* 상단 헤더 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
          marginTop: 80,
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "#333",
          }}
        >
          ←
        </button>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 600,
            margin: 0,
            flex: 1,
            textAlign: "center",
          }}
        >
          {product.name}
        </h1>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            style={{
              background: "none",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            📤
          </button>
          <button
            style={{
              background: "none",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            🤍
          </button>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          padding: "40px 20px",
        }}
      >
        {/* 왼쪽: 상품 이미지 */}
        <div>
          {/* 메인 이미지 */}
          <div
            style={{
              width: "100%",
              height: 500,
              background: "#f5f5f5",
              borderRadius: 12,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <span style={{ fontSize: 48, color: "#ccc" }}>📷</span>
            )}
          </div>

          {/* 썸네일 이미지들 */}
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, 4].map((_, index) => (
              <div
                key={index}
                style={{
                  width: 80,
                  height: 80,
                  background: index === 0 ? "#e0e0e0" : "#f5f5f5",
                  borderRadius: 8,
                  border: index === 0 ? "2px solid #333" : "1px solid #e0e0e0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {index === 0 && product.image ? (
                  <img
                    src={product.image}
                    alt={`${product.name} ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 24, color: "#ccc" }}>📷</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 상품 정보 */}
        <div>
          {/* 태그 */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <span
              style={{
                background: "#22c55e",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 8px",
                borderRadius: 4,
              }}
            >
              NEW
            </span>
            <span
              style={{
                background: "#ef4444",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 8px",
                borderRadius: 4,
              }}
            >
              SALE
            </span>
          </div>

          {/* 상품명 */}
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              margin: "0 0 16px 0",
              lineHeight: 1.2,
            }}
          >
            {product.name}
          </h1>

          {/* 별점과 리뷰 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <span style={{ color: "#fbbf24", fontSize: 16 }}>⭐</span>
            <span style={{ fontWeight: 600 }}>4.8</span>
            <span style={{ color: "#6b7280" }}>(124 reviews)</span>
          </div>

          {/* 가격 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 32,
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#111",
              }}
            >
              ₩{product.price.toLocaleString()}
            </span>
            <span
              style={{
                fontSize: 18,
                color: "#9ca3af",
                textDecoration: "line-through",
              }}
            >
              ₩{Math.floor(product.price * 1.3).toLocaleString()}
            </span>
            <span
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                fontSize: 12,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              26% OFF
            </span>
          </div>

          {/* 사이즈 선택 */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              Size
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    width: 50,
                    height: 40,
                    border:
                      selectedSize === size
                        ? "2px solid #111"
                        : "1px solid #e5e7eb",
                    background: selectedSize === size ? "#f9fafb" : "#fff",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* 색상 선택 */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              Color:
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  style={{
                    width: 40,
                    height: 40,
                    background: color.code,
                    border:
                      selectedColor === color.name
                        ? "3px solid #111"
                        : "1px solid #e5e7eb",
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>

          {/* 수량 선택 */}
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              Quantity
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                }}
              >
                <button
                  onClick={() => handleQuantityChange(-1)}
                  style={{
                    width: 40,
                    height: 40,
                    border: "none",
                    background: "none",
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    width: 40,
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  style={{
                    width: 40,
                    height: 40,
                    border: "none",
                    background: "none",
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>
              <span style={{ color: "#6b7280", fontSize: 14 }}>
                Only 5 left in stock
              </span>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div style={{ marginBottom: 32 }}>
            <button
              onClick={handleAddToBag}
              disabled={addingToBag}
              style={{
                width: "100%",
                background: addingToBag ? "#666" : "#111",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "16px 0",
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
                cursor: addingToBag ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: addingToBag ? 0.7 : 1,
              }}
            >
              {addingToBag ? (
                <>⏳ 추가 중...</>
              ) : (
                <>
                  🛍️ ADD TO BAG - ₩{(product.price * quantity).toLocaleString()}
                </>
              )}
            </button>
            <button
              onClick={handleAddToWishlist}
              style={{
                width: "100%",
                background: "#fff",
                color: "#111",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "16px 0",
                fontSize: 16,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              🤍 ADD TO WISHLIST
            </button>
          </div>

          {/* 배송/보안 정보 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "20px 0",
              borderTop: "1px solid #f0f0f0",
              borderBottom: "1px solid #f0f0f0",
              marginBottom: 32,
            }}
          >
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>📦</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Free Shipping</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                On orders over $100
              </div>
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>↩️</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Easy Returns</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                30-day return policy
              </div>
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>🔒</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                Secure Payment
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                SSL encrypted
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 20px 40px",
        }}
      >
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e5e7eb",
            marginBottom: 32,
          }}
        >
          {["Description", "Reviews (124)", "Shipping & Returns"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "16px 24px",
                border: "none",
                background: "none",
                fontSize: 16,
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? "#111" : "#6b7280",
                borderBottom: activeTab === tab ? "2px solid #111" : "none",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === "Description" && (
          <div>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.6,
                color: "#374151",
                marginBottom: 24,
              }}
            >
              {product.description ||
                "A timeless vintage denim jacket that adds effortless cool to any outfit. Made from premium cotton denim with a relaxed fit and classic styling details."}
            </p>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                Features:
              </h4>
              <ul style={{ paddingLeft: 20, color: "#6b7280" }}>
                <li>Premium quality materials</li>
                <li>Comfortable fit</li>
                <li>Easy care instructions</li>
                <li>Sustainable production</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab.includes("Reviews") && (
          <div style={{ color: "#6b7280", fontSize: 16 }}>
            리뷰 섹션은 개발 중입니다.
          </div>
        )}

        {activeTab === "Shipping & Returns" && (
          <div style={{ color: "#6b7280", fontSize: 16 }}>
            배송 및 반품 정보는 개발 중입니다.
          </div>
        )}
      </div>

      {/* You might also like */}
      <div
        style={{
          background: "#f9fafb",
          padding: "60px 20px",
          marginTop: 40,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 32,
              textAlign: "center",
            }}
          >
            You might also like
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 24,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 200,
                  background: "#f5f5f5",
                  borderRadius: 8,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 32, color: "#ccc" }}>📷</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                Oversized Blazer
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 700 }}>$95</span>
                <span
                  style={{
                    fontSize: 14,
                    color: "#9ca3af",
                    textDecoration: "line-through",
                  }}
                >
                  $130
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
