import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function OrderFailurePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { error, cart, shippingAddress } = location.state || {};

  // 에러 정보가 없으면 메인 페이지로 리다이렉트
  if (!error) {
    navigate("/");
    return null;
  }

  const handleRetryOrder = () => {
    // 장바구니가 있으면 결제 페이지로, 없으면 메인 페이지로
    if (cart && cart.items && cart.items.length > 0) {
      navigate("/checkout");
    } else {
      navigate("/cart");
    }
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
            주문 처리 실패
          </h1>

          {/* 실패 아이콘 */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#ef4444",
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
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>

          {/* 실패 메시지 */}
          <h2
            style={{
              fontSize: 24,
              fontWeight: 600,
              margin: "0 0 12px 0",
              color: "#333",
            }}
          >
            주문 처리 중 문제가 발생했습니다
          </h2>

          <p
            style={{
              fontSize: 16,
              color: "#666",
              margin: "0 0 8px 0",
            }}
          >
            죄송합니다. 주문을 완료할 수 없었습니다.
          </p>

          <p
            style={{
              fontSize: 16,
              color: "#666",
              margin: 0,
            }}
          >
            아래 정보를 확인하고 다시 시도해 주세요.
          </p>
        </div>

        {/* 에러 정보 카드 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: 24,
            marginBottom: 24,
            border: "1px solid #fecaca",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
              paddingBottom: 16,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <span style={{ fontSize: 20 }}>⚠️</span>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                margin: 0,
                color: "#dc2626",
              }}
            >
              오류 정보
            </h3>
          </div>

          <div
            style={{
              background: "#fef2f2",
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
                color: "#dc2626",
              }}
            >
              오류 메시지:
            </div>
            <div style={{ fontSize: 14, color: "#991b1b", lineHeight: 1.5 }}>
              {error}
            </div>
          </div>

          <div style={{ fontSize: 14, color: "#666", lineHeight: 1.5 }}>
            <p style={{ margin: "0 0 12px 0" }}>
              <strong>가능한 원인:</strong>
            </p>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>결제 정보가 올바르지 않음</li>
              <li>네트워크 연결 문제</li>
              <li>서버 일시적 오류</li>
              <li>재고 부족</li>
              <li>결제 한도 초과</li>
            </ul>
          </div>
        </div>

        {/* 주문 시도했던 상품들 (장바구니가 있는 경우) */}
        {cart && cart.items && cart.items.length > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              padding: 24,
              marginBottom: 24,
            }}
          >
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
              <span style={{ fontSize: 20 }}>🛒</span>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
                주문 시도한 상품
              </h3>
            </div>

            {cart.items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom:
                    index < cart.items.length - 1
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
              <span>총 결제 예정 금액</span>
              <span style={{ color: "#dc2626", fontSize: 24 }}>
                ₩{cart.totalAmount?.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* 해결 방법 제안 */}
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
            <span>💡</span>
            해결 방법
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
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
                  flexShrink: 0,
                }}
              >
                1
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                  결제 정보 확인
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  카드 정보, 유효기간, CVC 번호가 정확한지 확인해 주세요.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
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
                  flexShrink: 0,
                }}
              >
                2
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                  네트워크 연결 확인
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  인터넷 연결이 안정적인지 확인하고 다시 시도해 주세요.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
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
                  flexShrink: 0,
                }}
              >
                3
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                  다른 결제 수단 시도
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  다른 카드나 결제 방법을 사용해 보세요.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
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
                  flexShrink: 0,
                }}
              >
                4
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                  잠시 후 재시도
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  일시적인 서버 문제일 수 있으니 몇 분 후 다시 시도해 주세요.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <button
            onClick={handleRetryOrder}
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
            다시 주문하기
          </button>

          <button
            onClick={() => navigate("/cart")}
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
            장바구니로 가기
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              background: "#fff",
              color: "#666",
              border: "2px solid #e5e7eb",
              borderRadius: 8,
              padding: "12px 24px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              minWidth: 140,
            }}
          >
            쇼핑 계속하기
          </button>
        </div>

        {/* 고객센터 문의 */}
        <div
          style={{
            textAlign: "center",
            padding: 24,
            background: "#fff3cd",
            borderRadius: 8,
            border: "1px solid #ffc107",
          }}
        >
          <h4
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              color: "#856404",
            }}
          >
            문제가 계속 발생하시나요?
          </h4>
          <p style={{ fontSize: 14, color: "#856404", margin: "0 0 16px 0" }}>
            고객센터로 문의해 주시면 신속하게 도움을 드리겠습니다.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>📧</span>
              <div>
                <div style={{ fontSize: 12, color: "#856404" }}>이메일</div>
                <div
                  style={{ fontSize: 14, fontWeight: 600, color: "#856404" }}
                >
                  support@cider.com
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>📞</span>
              <div>
                <div style={{ fontSize: 12, color: "#856404" }}>전화</div>
                <div
                  style={{ fontSize: 14, fontWeight: 600, color: "#856404" }}
                >
                  1-800-CIDER-1
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>💬</span>
              <div>
                <div style={{ fontSize: 12, color: "#856404" }}>
                  실시간 채팅
                </div>
                <div
                  style={{ fontSize: 14, fontWeight: 600, color: "#856404" }}
                >
                  24시간 지원
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderFailurePage;
