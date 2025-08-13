import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { API_BASE_URL } from "../config/api";

function OrderListPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // 전체 주문 목록 저장
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);
  const [activeTab, setActiveTab] = useState("전체");

  // 탭 목록 정의
  const tabs = [
    { key: "전체", label: "전체", count: 0 },
    { key: "주문확인", label: "주문확인", count: 0 },
    { key: "상품준비중", label: "상품준비중", count: 0 },
    { key: "배송시작", label: "배송시작", count: 0 },
    { key: "배송중", label: "배송중", count: 0 },
    { key: "배송완료", label: "배송완료", count: 0 },
    { key: "주문취소", label: "주문취소", count: 0 },
  ];

  // 주문 상태별 한글 표시 (orderStatus 기준으로 변경)
  const getOrderStatusText = (orderStatus, paymentStatus) => {
    // 결제 상태가 결제완료가 아니면 결제 상태 우선 표시
    if (paymentStatus !== "결제완료") {
      switch (paymentStatus) {
        case "결제대기":
          return { text: "결제대기", color: "#f59e0b", bg: "#fef3c7" };
        case "결제실패":
          return { text: "결제실패", color: "#ef4444", bg: "#fee2e2" };
        case "결제취소":
          return { text: "결제취소", color: "#6b7280", bg: "#f3f4f6" };
        default:
          return { text: paymentStatus, color: "#6b7280", bg: "#f3f4f6" };
      }
    }

    // 결제완료 후에는 주문 상태에 따라 표시
    switch (orderStatus) {
      case "주문확인":
        return { text: "주문확인", color: "#f59e0b", bg: "#fef3c7" };
      case "상품준비중":
        return { text: "상품준비중", color: "#3b82f6", bg: "#dbeafe" };
      case "배송시작":
        return { text: "배송시작", color: "#8b5cf6", bg: "#ede9fe" };
      case "배송중":
        return { text: "배송중", color: "#8b5cf6", bg: "#ede9fe" };
      case "배송완료":
        return { text: "배송완료", color: "#10b981", bg: "#d1fae5" };
      case "주문취소":
        return { text: "주문취소", color: "#ef4444", bg: "#fee2e2" };
      default:
        return { text: orderStatus, color: "#6b7280", bg: "#f3f4f6" };
    }
  };

  // 탭별 주문 개수 계산
  const calculateTabCounts = (orderList) => {
    const counts = {};
    tabs.forEach((tab) => {
      if (tab.key === "전체") {
        counts[tab.key] = orderList.length;
      } else {
        counts[tab.key] = orderList.filter(
          (order) => order.orderStatus === tab.key
        ).length;
      }
    });
    return counts;
  };

  // 탭 클릭 핸들러
  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === "전체") {
      setOrders(allOrders);
    } else {
      const filteredOrders = allOrders.filter(
        (order) => order.orderStatus === tabKey
      );
      setOrders(filteredOrders);
    }
  };

  // 사용자 정보 가져오기
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          navigate("/login");
        }
      } catch (e) {
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  // 주문 목록 가져오기
  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchCartCount();
    }
  }, [user]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAllOrders(data); // 전체 주문 목록 저장
        setOrders(data); // 초기에는 전체 목록 표시
      } else if (response.status === 404) {
        setAllOrders([]);
        setOrders([]);
      } else {
        throw new Error("주문 목록을 가져오는데 실패했습니다.");
      }
    } catch (err) {
      setError(err.message);
      console.error("주문 목록 가져오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCartItemCount(data.totalItems || 0);
      }
    } catch (err) {
      console.error("장바구니 개수 가져오기 실패:", err);
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
          주문 내역을 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f7f8fa", minHeight: "100vh" }}>
      <Navbar user={user} cartItemCount={cartItemCount} />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 20px" }}>
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
          }}
        >
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
            주문 내역
          </h1>
        </div>

        {/* 상태별 탭 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: "16px 24px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {tabs.map((tab) => {
              const tabCount = calculateTabCounts(allOrders)[tab.key] || 0;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabClick(tab.key)}
                  style={{
                    background: isActive ? "#111" : "#f8f9fa",
                    color: isActive ? "#fff" : "#666",
                    border: "none",
                    borderRadius: 20,
                    padding: "8px 16px",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.2s ease",
                  }}
                >
                  {tab.label}
                  {tabCount > 0 && (
                    <span
                      style={{
                        background: isActive
                          ? "rgba(255,255,255,0.2)"
                          : "#e5e7eb",
                        color: isActive ? "#fff" : "#374151",
                        borderRadius: 10,
                        padding: "2px 6px",
                        fontSize: 12,
                        fontWeight: 600,
                        minWidth: 20,
                        textAlign: "center",
                      }}
                    >
                      {tabCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
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

        {/* 주문 목록 */}
        {orders.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              padding: 60,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
              {activeTab === "전체"
                ? "주문 내역이 없습니다"
                : `${activeTab} 상태의 주문이 없습니다`}
            </h3>
            <p style={{ fontSize: 16, color: "#666", marginBottom: 24 }}>
              {activeTab === "전체"
                ? "첫 주문을 해보세요!"
                : "다른 탭에서 주문을 확인해보세요."}
            </p>
            {activeTab === "전체" && (
              <button
                onClick={() => navigate("/")}
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
                쇼핑하러 가기
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {orders.map((order) => {
              const statusInfo = getOrderStatusText(
                order.orderStatus,
                order.paymentStatus
              );
              return (
                <div
                  key={order._id}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    padding: 24,
                  }}
                >
                  {/* 주문 헤더 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 20,
                      paddingBottom: 16,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          marginBottom: 8,
                          color: "#333",
                        }}
                      >
                        주문 #{order.orderNumber}
                      </div>
                      <div style={{ fontSize: 14, color: "#666" }}>
                        주문일:{" "}
                        {new Date(order.createdAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div
                      style={{
                        background: statusInfo.bg,
                        color: statusInfo.color,
                        padding: "6px 12px",
                        borderRadius: 16,
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {statusInfo.text}
                    </div>
                  </div>

                  {/* 주문 상품 목록 */}
                  <div style={{ marginBottom: 20 }}>
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          gap: 12,
                          marginBottom: 12,
                          paddingBottom: 12,
                          borderBottom:
                            index < order.items.length - 1
                              ? "1px solid #f0f0f0"
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 8,
                            background: "#f8f9fa",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {item.product?.image ? (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                            />
                          ) : (
                            <span style={{ color: "#bbb", fontSize: 12 }}>
                              이미지
                            </span>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 600,
                              marginBottom: 8,
                              color: "#333",
                            }}
                          >
                            {item.product?.name}
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#666",
                              marginBottom: 8,
                            }}
                          >
                            사이즈: M • 색상: Blue
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#666",
                              marginBottom: 8,
                            }}
                          >
                            수량: {item.quantity}
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 600 }}>
                            ₩{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 배송 정보 */}
                  {order.shippingAddress && (
                    <div
                      style={{
                        background: "#f8f9fa",
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 20,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          marginBottom: 8,
                          color: "#333",
                        }}
                      >
                        📦 배송 예정: January 5-7, 2025
                      </div>
                      <div
                        style={{ fontSize: 14, color: "#666", lineHeight: 1.5 }}
                      >
                        추적번호: 1Z999AA1234567890
                      </div>
                    </div>
                  )}

                  {/* 총 금액 및 액션 버튼 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: 16,
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#333",
                      }}
                    >
                      배송 중입니다. 예상 도착일: January 2-3, 2025
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        style={{
                          background: "none",
                          border: "1px solid #e5e7eb",
                          borderRadius: 6,
                          padding: "8px 16px",
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: "pointer",
                          color: "#374151",
                        }}
                      >
                        👁 주문 상세보기
                      </button>
                      <button
                        style={{
                          background: "none",
                          border: "1px solid #e5e7eb",
                          borderRadius: 6,
                          padding: "8px 16px",
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: "pointer",
                          color: "#374151",
                        }}
                      >
                        📦 배송 추적
                      </button>
                    </div>
                  </div>

                  {/* 총 금액 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <span style={{ fontSize: 18, fontWeight: 600 }}>
                      배송비 등모든 세금 포함
                    </span>
                    <span
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: "#dc2626",
                      }}
                    >
                      ₩{order.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 계속 쇼핑하기 버튼 */}
        {orders.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button
              onClick={() => navigate("/")}
              style={{
                background: "#111",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "16px 32px",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              계속 쇼핑하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderListPage;
