import React from "react";
import Navbar from "../Navbar";
import { Link, useNavigate } from "react-router-dom";

const stats = [
  {
    label: "총 주문",
    value: "1,234",
    sub: "+12% from last month",
    icon: "🛒",
    color: "#2563eb",
  },
  {
    label: "총 상품",
    value: "156",
    sub: "+3% from last month",
    icon: "📦",
    color: "#059669",
  },
  {
    label: "총 고객",
    value: "2,345",
    sub: "+8% from last month",
    icon: "👤",
    color: "#a21caf",
  },
  {
    label: "총 매출",
    value: "$45,678",
    sub: "+15% from last month",
    icon: "📈",
    color: "#ea580c",
  },
];

const quickActions = [
  {
    label: "새 상품 등록",
    icon: "+",
    color: "#111",
    bg: "#111",
    fontColor: "#fff",
  },
  {
    label: "주문 관리",
    icon: "👁️",
    color: "#222",
    bg: "#f7f8fa",
    fontColor: "#222",
  },
  {
    label: "매출 분석",
    icon: "📊",
    color: "#222",
    bg: "#f7f8fa",
    fontColor: "#222",
  },
];

const recentOrders = [
  {
    id: "ORD-001234",
    name: "김민수",
    date: "2024-12-30",
    status: "처리중",
    price: "$219",
    badge: "#facc15",
    badgeText: "#222",
  },
  {
    id: "ORD-001233",
    name: "이영희",
    date: "2024-12-29",
    status: "배송중",
    price: "$156",
    badge: "#38bdf8",
    badgeText: "#fff",
  },
  {
    id: "ORD-001232",
    name: "박철수",
    date: "2024-12-28",
    status: "배송완료",
    price: "$97",
    badge: "#4ade80",
    badgeText: "#fff",
  },
];

function AdminPage() {
  const navigate = useNavigate();
  return (
    <div style={{ background: "#f7f8fa", minHeight: "100vh" }}>
      {/* 상단 네비 + ADMIN 뱃지 + 돌아가기 */}
      <div style={{ position: "relative" }}>
        <Navbar
          user={{ name: "관리자", user_type: "admin" }}
          cartItemCount={0}
        />
        <span
          style={{
            position: "absolute",
            top: 18,
            left: 90,
            background: "#f3f4f6",
            color: "#b91c1c",
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 8,
            padding: "2px 12px",
            letterSpacing: 1,
          }}
        >
          ADMIN
        </span>
        <Link
          to="/"
          style={{
            position: "absolute",
            top: 16,
            right: 32,
            textDecoration: "none",
          }}
        >
          <button
            style={{
              border: "1px solid #ddd",
              background: "#fff",
              borderRadius: 8,
              padding: "8px 18px",
              fontWeight: 500,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            쇼핑몰로 돌아가기
          </button>
        </Link>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 0 64px" }}>
        {/* 대시보드 타이틀 */}
        <div style={{ margin: "32px 0 24px" }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
            관리자 대시보드
          </div>
          <div style={{ color: "#666", fontSize: 16 }}>
            CIDER 쇼핑몰 관리 시스템에 오신 것을 환영합니다.
          </div>
        </div>
        {/* 통계 카드 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            marginBottom: 32,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                minHeight: 120,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 15, color: "#888", fontWeight: 500 }}>
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      margin: "6px 0 2px",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{ fontSize: 14, color: "#22c55e", fontWeight: 500 }}
                  >
                    {s.sub}
                  </div>
                </div>
                <span style={{ fontSize: 32, color: s.color }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>
        {/* 빠른 작업 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: 24,
            marginBottom: 32,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>
            빠른 작업
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => navigate("/admin/products/create")}
              style={{
                background: "#111",
                color: "#fff",
                fontWeight: 600,
                fontSize: 16,
                border: 0,
                borderRadius: 6,
                padding: "12px 0",
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 8,
                justifyContent: "flex-start",
              }}
            >
              <span style={{ fontSize: 20, marginLeft: 16 }}>+</span> 새 상품
              등록
            </button>
            <button
              onClick={() => navigate("/admin/orders")}
              style={{
                background: "#f7f8fa",
                color: "#222",
                fontWeight: 500,
                fontSize: 16,
                border: 0,
                borderRadius: 6,
                padding: "12px 0",
                display: "flex",
                alignItems: "center",
                gap: 8,
                justifyContent: "flex-start",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 20, marginLeft: 16 }}>👁️</span> 주문 관리
            </button>
            <button
              style={{
                background: "#f7f8fa",
                color: "#222",
                fontWeight: 500,
                fontSize: 16,
                border: 0,
                borderRadius: 6,
                padding: "12px 0",
                display: "flex",
                alignItems: "center",
                gap: 8,
                justifyContent: "flex-start",
              }}
            >
              <span style={{ fontSize: 20, marginLeft: 16 }}>📊</span> 매출 분석
            </button>
          </div>
        </div>
        {/* 최근 주문 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: 24,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 18 }}>최근 주문</div>
            <a
              href="#"
              style={{
                color: "#222",
                fontWeight: 500,
                fontSize: 15,
                textDecoration: "none",
              }}
            >
              전체보기
            </a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentOrders.map((o, i) => (
              <div
                key={i}
                style={{
                  background: "#f7f8fa",
                  borderRadius: 10,
                  padding: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{o.id}</div>
                  <div
                    style={{ color: "#666", fontSize: 15, margin: "2px 0 0" }}
                  >
                    {o.name}
                  </div>
                  <div style={{ color: "#bbb", fontSize: 13 }}>{o.date}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span
                    style={{
                      background: o.badge,
                      color: o.badgeText,
                      fontWeight: 600,
                      fontSize: 14,
                      borderRadius: 8,
                      padding: "4px 12px",
                    }}
                  >
                    {o.status}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 18 }}>
                    {o.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* 하단 관리 카드 */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}
        >
          <div
            onClick={() => navigate("/admin/products")}
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              padding: 36,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
            }}
          >
            <span style={{ fontSize: 48, color: "#2563eb" }}>📦</span>
            <div style={{ fontWeight: 700, fontSize: 20, marginTop: 8 }}>
              상품 관리
            </div>
            <div style={{ color: "#666", fontSize: 15, textAlign: "center" }}>
              상품 등록, 수정, 삭제 및 재고 관리
            </div>
          </div>
          <div
            onClick={() => navigate("/admin/orders")}
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              padding: 36,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
            }}
          >
            <span style={{ fontSize: 48, color: "#059669" }}>🛒</span>
            <div style={{ fontWeight: 700, fontSize: 20, marginTop: 8 }}>
              주문 관리
            </div>
            <div style={{ color: "#666", fontSize: 15, textAlign: "center" }}>
              주문 조회, 상태 변경 및 배송 관리
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
