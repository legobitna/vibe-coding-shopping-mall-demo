import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { API_BASE_URL } from "../../config/api";

function OrderManagePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 탭 목록 정의 (모든 주문 상태 포함)
  const tabs = [
    { key: "전체", label: "전체", count: 0 },
    { key: "주문확인", label: "주문확인", count: 0 },
    { key: "상품준비중", label: "상품준비중", count: 0 },
    { key: "배송시작", label: "배송시작", count: 0 },
    { key: "배송중", label: "배송중", count: 0 },
    { key: "배송완료", label: "배송완료", count: 0 },
    { key: "주문취소", label: "주문취소", count: 0 },
  ];

  // 주문 상태별 한글 표시
  const getOrderStatusInfo = (orderStatus, paymentStatus) => {
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
        return { text: "처리중", color: "#f59e0b", bg: "#fef3c7" };
      case "상품준비중":
        return { text: "처리중", color: "#f59e0b", bg: "#fef3c7" };
      case "배송시작":
        return { text: "배송중", color: "#3b82f6", bg: "#dbeafe" };
      case "배송중":
        return { text: "배송중", color: "#3b82f6", bg: "#dbeafe" };
      case "배송완료":
        return { text: "완료", color: "#10b981", bg: "#d1fae5" };
      case "주문취소":
        return { text: "취소", color: "#ef4444", bg: "#fee2e2" };
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
        // 각 상태별로 직접 매칭
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
    filterOrders(tabKey, searchQuery);
  };

  // 주문 필터링
  const filterOrders = (tabKey, query) => {
    let filtered = allOrders;

    // 탭 필터링 (각 상태별로 직접 매칭)
    if (tabKey !== "전체") {
      filtered = filtered.filter((order) => order.orderStatus === tabKey);
    }

    // 검색 필터링
    if (query.trim()) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
          order.user?.name?.toLowerCase().includes(query.toLowerCase()) ||
          order.user?.email?.toLowerCase().includes(query.toLowerCase())
      );
    }

    setOrders(filtered);
  };

  // 검색 핸들러
  const handleSearch = (query) => {
    setSearchQuery(query);
    filterOrders(activeTab, query);
  };

  // 주문 상태 변경
  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (response.ok) {
        // 주문 목록 새로고침
        fetchOrders();
      } else {
        throw new Error("주문 상태 변경에 실패했습니다.");
      }
    } catch (err) {
      console.error("주문 상태 변경 실패:", err);
      alert("주문 상태 변경에 실패했습니다.");
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
          if (userData.user_type !== "admin") {
            navigate("/");
            return;
          }
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
    }
  }, [user]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/orders/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAllOrders(data.orders || data);
        setOrders(data.orders || data);
        if (data.totalPages) {
          setTotalPages(data.totalPages);
        }
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

  if (loading) {
    return (
      <div style={{ background: "#f7f8fa", minHeight: "100vh" }}>
        <Navbar user={user} cartItemCount={0} />
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
      <Navbar user={user} cartItemCount={0} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
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
            onClick={() => navigate("/admin")}
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
            주문 관리
          </h1>
        </div>

        {/* 검색 및 필터 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: "16px 24px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              placeholder="주문번호 또는 고객명으로 검색..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 40px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 16,
                outline: "none",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                fontSize: 18,
              }}
            >
              🔍
            </span>
          </div>
          <button
            style={{
              background: "#f8f9fa",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            🔧 필터
          </button>
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
                ? "주문이 없습니다"
                : `${
                    tabs.find((tab) => tab.key === activeTab)?.label ||
                    activeTab
                  } 상태의 주문이 없습니다`}
            </h3>
            <p style={{ fontSize: 16, color: "#666", marginBottom: 24 }}>
              새로운 주문을 기다리고 있습니다.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {orders.map((order) => {
              const statusInfo = getOrderStatusInfo(
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
                        {order.orderNumber}
                      </div>
                      <div style={{ fontSize: 14, color: "#666" }}>
                        {order.user?.name} • {order.user?.email}
                        <br />
                        {new Date(order.createdAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
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

                  {/* 주문 상품 정보 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          marginBottom: 8,
                          color: "#333",
                        }}
                      >
                        주문 상품
                      </div>
                      <div style={{ fontSize: 14, color: "#666" }}>
                        {order.items?.length > 0 &&
                          `${order.items[0].product?.name}${
                            order.items.length > 1
                              ? ` 외 ${order.items.length - 1}개`
                              : ""
                          }`}
                      </div>
                    </div>
                    <div style={{ flex: 1, paddingLeft: 24 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          marginBottom: 8,
                          color: "#333",
                        }}
                      >
                        배송 주소
                      </div>
                      <div style={{ fontSize: 14, color: "#666" }}>
                        {order.shippingAddress?.recipient}
                        <br />
                        {order.shippingAddress?.address}
                      </div>
                    </div>
                  </div>

                  {/* 하단 액션 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: 16,
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <div style={{ display: "flex", gap: 12 }}>
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: 6,
                          padding: "8px 12px",
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: "pointer",
                          background: "#fff",
                        }}
                      >
                        <option value="주문확인">주문확인</option>
                        <option value="상품준비중">상품준비중</option>
                        <option value="배송시작">배송시작</option>
                        <option value="배송중">배송중</option>
                        <option value="배송완료">배송완료</option>
                        <option value="주문취소">주문취소</option>
                      </select>
                    </div>
                    <div
                      style={{ display: "flex", gap: 12, alignItems: "center" }}
                    >
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: "#dc2626",
                        }}
                      >
                        ₩{order.totalAmount?.toLocaleString()}
                      </span>
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
                        👁 상세보기
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderManagePage;
