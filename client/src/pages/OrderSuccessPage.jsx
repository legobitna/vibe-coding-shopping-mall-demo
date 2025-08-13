import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, shippingAddress } = location.state || {};

  // 주문 정보가 없으면 메인 페이지로 리다이렉트
  if (!order) {
    navigate("/");
    return null;
  }

  // 배송 예상 날짜 계산 (주문일로부터 5-7일 후)
  const getEstimatedDeliveryDate = () => {
    const orderDate = new Date(order.createdAt);
    const startDate = new Date(orderDate);
    const endDate = new Date(orderDate);

    startDate.setDate(orderDate.getDate() + 5);
    endDate.setDate(orderDate.getDate() + 7);

    const options = { month: "long", day: "numeric", year: "numeric" };
    return `${startDate.toLocaleDateString(
      "ko-KR",
      options
    )} - ${endDate.toLocaleDateString("ko-KR", options)}`;
  };

  return (
    <div style={{ background: "#f7f8fa", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              margin: "0 0 40px 0",
              color: "#333",
            }}
          >
            Order Confirmation
          </h1>

          {/* 체크마크 아이콘 */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px auto",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>

          {/* 성공 메시지 */}
          <h2
            style={{
              fontSize: 24,
              fontWeight: 600,
              margin: "0 0 12px 0",
              color: "#333",
            }}
          >
            주문이 성공적으로 완료되었습니다!
          </h2>

          <p
            style={{
              fontSize: 16,
              color: "#666",
              margin: "0 0 8px 0",
            }}
          >
            주문해 주셔서 감사합니다.
          </p>

          <p
            style={{
              fontSize: 16,
              color: "#666",
              margin: 0,
            }}
          >
            주문 확인 이메일을 곧 받으실 수 있습니다.
          </p>
        </div>

        {/* 주문 정보 카드 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: 24,
            marginBottom: 24,
          }}
        >
          {/* 주문 정보 헤더 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700 }}>📋</span>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
              주문 정보
            </h3>
          </div>

          {/* 주문 번호와 날짜 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                주문 번호
              </div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {order.orderNumber}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                주문 날짜
              </div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {new Date(order.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* 주문 상품 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              주문 상품
            </div>
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
                    width: 60,
                    height: 60,
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
                    <span style={{ color: "#bbb", fontSize: 10 }}>이미지</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}
                  >
                    {item.product?.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                    수량: {item.quantity}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    ₩{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 총 결제 금액 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 0",
              borderTop: "2px solid #f0f0f0",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            <span>총 결제 금액</span>
            <span style={{ color: "#dc2626", fontSize: 24 }}>
              ₩{order.totalAmount?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 배송 정보 카드 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: 24,
            marginBottom: 32,
          }}
        >
          {/* 배송 정보 헤더 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <span style={{ fontSize: 20 }}>📦</span>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
              배송 정보
            </h3>
          </div>

          {/* 예상 배송일 */}
          <div
            style={{
              background: "#eff6ff",
              borderRadius: 8,
              padding: 16,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "white", fontSize: 18 }}>📅</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                예상 배송일
              </div>
              <div style={{ fontSize: 16, color: "#3b82f6", fontWeight: 600 }}>
                {getEstimatedDeliveryDate()}
              </div>
            </div>
          </div>

          {/* 배송 주소 */}
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              배송 주소
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: "#333" }}>
              <div style={{ marginBottom: 4 }}>
                {shippingAddress?.recipient}
              </div>
              <div style={{ marginBottom: 4 }}>{shippingAddress?.address}</div>
              {shippingAddress?.detailAddress && (
                <div style={{ marginBottom: 4 }}>
                  {shippingAddress.detailAddress}
                </div>
              )}
              <div>
                {shippingAddress?.zipCode && `${shippingAddress.zipCode}, `}
                {shippingAddress?.phone}
              </div>
            </div>
          </div>
        </div>

        {/* 다음 단계 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: 24,
            marginBottom: 32,
          }}
        >
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>📋</span>
            다음 단계
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#10b981",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                1
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  주문 확인 이메일
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  주문 세부 정보가 포함된 확인 이메일을 받으실 수 있습니다.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#3b82f6",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                2
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>주문 처리</div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  1-2 영업일 내에 주문을 처리하고 포장합니다.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#8b5cf6",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                3
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>배송 시작</div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  배송이 시작되면 추적 번호를 이메일로 보내드립니다.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <button
            onClick={() => navigate("/orders")}
            style={{
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              minWidth: 140,
            }}
          >
            주문 목록 보기
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              background: "#fff",
              color: "#111",
              border: "2px solid #111",
              borderRadius: 8,
              padding: "12px 24px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              minWidth: 140,
            }}
          >
            계속 쇼핑하기
          </button>
        </div>

        {/* 문의 정보 */}
        <div
          style={{
            textAlign: "center",
            marginTop: 40,
            padding: 24,
            background: "#f8f9fa",
            borderRadius: 8,
          }}
        >
          <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            문의사항이 있으신가요?
          </h4>
          <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>📧</span>
              <div>
                <div style={{ fontSize: 12, color: "#666" }}>이메일</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  support@cider.com
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>📞</span>
              <div>
                <div style={{ fontSize: 12, color: "#666" }}>전화</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  1-800-CIDER-1
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
