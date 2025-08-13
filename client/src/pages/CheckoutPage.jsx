import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { API_BASE_URL } from "../config/api";

// 포트원 SDK 로드
const loadPortOneSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.IMP) {
      resolve(window.IMP);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.iamport.kr/v1/iamport.js";
    script.onload = () => {
      if (window.IMP) {
        resolve(window.IMP);
      } else {
        reject(new Error("포트원 SDK 로드 실패"));
      }
    };
    script.onerror = () => reject(new Error("포트원 SDK 로드 실패"));
    document.head.appendChild(script);
  });
};

function CheckoutPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

  // 폼 데이터
  const [shippingData, setShippingData] = useState({
    recipient: "",
    phone: "",
    address: "",
    detailAddress: "",
    zipCode: "",
    deliveryRequest: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("신용카드");
  const [impLoaded, setImpLoaded] = useState(false);

  // 포트원 SDK 초기화
  useEffect(() => {
    const initPortOne = async () => {
      try {
        const IMP = await loadPortOneSDK();
        IMP.init("imp75756233"); // 고객사 식별코드
        setImpLoaded(true);
        console.log("포트원 SDK 초기화 완료");
      } catch (error) {
        console.error("포트원 SDK 초기화 실패:", error);
      }
    };

    initPortOne();
  }, []);

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
          const userData = await res.json();
          if (userData && userData.name) {
            setUser(userData);
            // 사용자 정보로 배송 정보 미리 채우기
            setShippingData((prev) => ({
              ...prev,
              recipient: userData.name,
              address: userData.address || "",
            }));
          }
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

        // 장바구니가 비어있으면 메인 페이지로 리다이렉트
        if (!data.items || data.items.length === 0) {
          alert("장바구니가 비어있습니다.");
          navigate("/");
        }
      } else if (response.status === 404) {
        alert("장바구니가 비어있습니다.");
        navigate("/");
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

  // 폼 입력 핸들러
  const handleShippingChange = (field, value) => {
    setShippingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 포트원 결제 요청
  const requestPayment = () => {
    if (!window.IMP) {
      alert("결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    // 고유한 주문번호 생성
    const merchantUid = `order_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // 상품명 생성 (첫 번째 상품명 + 외 N개)
    const productNames = cart.items.map((item) => item.product.name);
    const orderName =
      productNames.length > 1
        ? `${productNames[0]} 외 ${productNames.length - 1}개`
        : productNames[0];

    const paymentData = {
      pg: "html5_inicis",
      pay_method: "card", // 모든 결제를 카드로 통일 (테스트용)
      merchant_uid: merchantUid,
      name: orderName,
      amount: Math.max(100, cart.totalAmount), // 최소 100원 이상
      buyer_email: user.email,
      buyer_name: shippingData.recipient,
      buyer_tel: shippingData.phone,
      buyer_addr: shippingData.address,
      buyer_postcode: shippingData.zipCode || "",
    };

    window.IMP.request_pay(paymentData, async (response) => {
      if (response.success) {
        // 결제 성공 시 서버에서 검증 후 주문 생성
        await createOrderAfterPayment(response, merchantUid);
      } else {
        // 결제 실패 시 실패 페이지로 이동
        navigate("/order-failure", {
          state: {
            error: response.error_msg || "결제에 실패했습니다.",
            cart: cart,
            shippingAddress: shippingData,
          },
        });
        setOrderLoading(false);
      }
    });
  };

  // 결제수단별 PG 설정 (테스트용)
  const getPaymentPG = (method) => {
    // 테스트 환경에서는 모든 결제를 nice PG로 통일
    return "nice";
  };

  // 결제수단별 pay_method 설정
  const getPaymentMethod = (method) => {
    switch (method) {
      case "카카오페이":
      case "네이버페이":
        return "card";
      case "계좌이체":
        return "trans";
      default:
        return "card"; // 신용카드
    }
  };

  // 결제 완료 후 주문 생성
  const createOrderAfterPayment = async (paymentResponse, merchantUid) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: shippingData,
          paymentMethod,
          paymentData: {
            imp_uid: paymentResponse.imp_uid,
            merchant_uid: merchantUid,
            paid_amount: paymentResponse.paid_amount,
            apply_num: paymentResponse.apply_num,
          },
        }),
      });

      if (response.ok) {
        const order = await response.json();
        // 주문 성공 시 성공 페이지로 이동하며 주문 정보 전달
        navigate("/order-success", {
          state: {
            order: order,
            shippingAddress: shippingData,
            paymentMethod: paymentMethod,
          },
        });
      } else {
        const errorData = await response.json();
        // 주문 실패 시 실패 페이지로 이동하며 에러 정보 전달
        navigate("/order-failure", {
          state: {
            error: errorData.error || "주문 생성에 실패했습니다.",
            cart: cart,
            shippingAddress: shippingData,
          },
        });
      }
    } catch (err) {
      // 네트워크 에러 등 예외 상황 시 실패 페이지로 이동
      navigate("/order-failure", {
        state: {
          error: err.message || "주문 처리 중 오류가 발생했습니다.",
          cart: cart,
          shippingAddress: shippingData,
        },
      });
    } finally {
      setOrderLoading(false);
    }
  };

  // 주문 생성 (결제 프로세스 시작)
  const handlePlaceOrder = async () => {
    // 필수 정보 검증
    if (
      !shippingData.recipient ||
      !shippingData.phone ||
      !shippingData.address
    ) {
      alert("배송 정보를 모두 입력해주세요.");
      return;
    }

    if (!paymentMethod) {
      alert("결제 방법을 선택해주세요.");
      return;
    }

    if (!impLoaded) {
      alert("결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setOrderLoading(true);

    // 포트원 결제 요청
    requestPayment();
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
          주문 정보를 불러오는 중...
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
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
          }}
        >
          <button
            onClick={() => navigate("/cart")}
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
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>결제</h1>
        </div>

        {/* 진행 단계 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
            gap: 20,
          }}
        >
          {[
            { step: 1, label: "배송정보" },
            { step: 2, label: "결제정보" },
            { step: 3, label: "주문완료" },
          ].map((item, index) => (
            <div
              key={item.step}
              style={{ display: "flex", alignItems: "center" }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: currentStep >= item.step ? "#111" : "#e5e7eb",
                  color: currentStep >= item.step ? "#fff" : "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {item.step}
              </div>
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: currentStep >= item.step ? "#111" : "#9ca3af",
                }}
              >
                {item.label}
              </span>
              {index < 2 && (
                <div
                  style={{
                    width: 40,
                    height: 2,
                    background: currentStep > item.step ? "#111" : "#e5e7eb",
                    marginLeft: 20,
                  }}
                />
              )}
            </div>
          ))}
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

        {/* 메인 컨텐츠 */}
        <div
          style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 40 }}
        >
          {/* 좌측 폼 */}
          <div>
            {/* 배송 정보 */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: 24,
                marginBottom: 24,
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 20,
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                📦 배송 정보
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    받는 분 *
                  </label>
                  <input
                    type="text"
                    value={shippingData.recipient}
                    onChange={(e) =>
                      handleShippingChange("recipient", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: 12,
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                    placeholder="받는 분 성함"
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    연락처 *
                  </label>
                  <input
                    type="tel"
                    value={shippingData.phone}
                    onChange={(e) =>
                      handleShippingChange("phone", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: 12,
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  주소 *
                </label>
                <input
                  type="text"
                  value={shippingData.address}
                  onChange={(e) =>
                    handleShippingChange("address", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: 12,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                  placeholder="기본 주소"
                />
                <input
                  type="text"
                  value={shippingData.detailAddress}
                  onChange={(e) =>
                    handleShippingChange("detailAddress", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: 12,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                  placeholder="상세 주소"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    우편번호
                  </label>
                  <input
                    type="text"
                    value={shippingData.zipCode}
                    onChange={(e) =>
                      handleShippingChange("zipCode", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: 12,
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                    placeholder="12345"
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    배송 요청사항
                  </label>
                  <input
                    type="text"
                    value={shippingData.deliveryRequest}
                    onChange={(e) =>
                      handleShippingChange("deliveryRequest", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: 12,
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                    placeholder="배송 시 요청사항 (선택)"
                  />
                </div>
              </div>
            </div>

            {/* 배송 방법 */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: 24,
                marginBottom: 24,
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 20,
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                🚚 배송 방법
              </h2>

              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    일반 배송
                  </div>
                  <div style={{ fontSize: 14, color: "#666" }}>3-5 영업일</div>
                </div>
                <div style={{ fontWeight: 600, color: "#059669" }}>무료</div>
              </div>
            </div>

            {/* 결제 정보 */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: 24,
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 20,
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                💳 결제 정보
              </h2>

              <div style={{ display: "grid", gap: 12 }}>
                {["신용카드", "계좌이체", "카카오페이", "네이버페이"].map(
                  (method) => (
                    <label
                      key={method}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: 12,
                        border: `1px solid ${
                          paymentMethod === method ? "#111" : "#e5e7eb"
                        }`,
                        borderRadius: 8,
                        cursor: "pointer",
                        background:
                          paymentMethod === method ? "#f8f9fa" : "#fff",
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ margin: 0 }}
                      />
                      <span style={{ fontWeight: 500 }}>{method}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          </div>

          {/* 우측 주문 요약 */}
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

              {/* 주문 상품 목록 */}
              {cart &&
                cart.items &&
                cart.items.map((item) => (
                  <div
                    key={item.product._id}
                    style={{
                      display: "flex",
                      gap: 12,
                      marginBottom: 16,
                      paddingBottom: 16,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "#f8f9fa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
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
                              '<span style="color: #bbb; font-size: 10px;">이미지</span>';
                          }}
                        />
                      ) : (
                        <span style={{ color: "#bbb", fontSize: 10 }}>
                          이미지
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          marginBottom: 4,
                        }}
                      >
                        {item.product.name}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#666", marginBottom: 4 }}
                      >
                        {item.quantity}개
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        ₩{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}

              {/* 금액 요약 */}
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
                  상품 수량 ({cart?.totalItems || 0}개)
                </span>
                <span style={{ fontWeight: 600 }}>
                  ₩{cart?.totalAmount?.toLocaleString() || 0}
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
                <span style={{ fontWeight: 600, color: "#059669" }}>무료</span>
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
                  ₩{cart?.totalAmount?.toLocaleString() || 0}
                </span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={orderLoading}
                style={{
                  width: "100%",
                  background: orderLoading ? "#ccc" : "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "16px",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: orderLoading ? "not-allowed" : "pointer",
                }}
              >
                {orderLoading ? "주문 처리 중..." : "주문하기"}
              </button>

              <div
                style={{
                  fontSize: 12,
                  color: "#666",
                  textAlign: "center",
                  marginTop: 12,
                  lineHeight: 1.4,
                }}
              >
                주문 완료 시 개인정보처리방침 및 이용약관에 동의한 것으로
                간주됩니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
