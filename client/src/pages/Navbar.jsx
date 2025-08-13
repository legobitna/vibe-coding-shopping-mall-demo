import { Link } from "react-router-dom";
import React, { memo, useState, useEffect, useRef } from "react";

const Navbar = memo(function Navbar({ user, cartItemCount = 0 }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem("token");
    setShowDropdown(false);
    window.location.reload(); // 페이지 새로고침으로 상태 초기화
  };

  return (
    <nav
      style={{
        width: "100%",
        height: 60,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        borderBottom: "1px solid #eee",
        position: "fixed",
        top: 0,
        left: 0,
        background: "#fff",
        zIndex: 100,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 1,
          flex: "0 0 auto",
          minWidth: 0,
        }}
      >
        CIDER
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          flex: 1,
          justifyContent: "center",
          minWidth: 0,
          flexShrink: 1,
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "#222",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          NEW IN
        </Link>
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "#222",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          CLOTHING
        </Link>
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "#222",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          ACCESSORIES
        </Link>
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "#222",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          SALE
        </Link>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: "0 0 auto",
          minWidth: 0,
          whiteSpace: "nowrap",
        }}
      >
        {/* 장바구니 아이콘 */}
        <Link
          to="/cart"
          style={{
            textDecoration: "none",
            color: "#222",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            borderRadius: "6px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
        >
          {/* 쇼핑백 아이콘 */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 7H16V6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6V7H5C4.44772 7 4 7.44772 4 8V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V8C20 7.44772 19.5523 7 19 7ZM10 6C10 4.89543 10.8954 4 12 4C13.1046 4 14 4.89543 14 6V7H10V6ZM6 9H8V11C8 11.5523 8.44772 12 9 12C9.55228 12 10 11.5523 10 11V9H14V11C14 11.5523 14.4477 12 15 12C15.5523 12 16 11.5523 16 11V9H18V19H6V9Z"
              fill="currentColor"
            />
          </svg>

          {/* 장바구니 아이템 수 배지 */}
          {cartItemCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                background: "#ff4757",
                color: "white",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "600",
                minWidth: "18px",
              }}
            >
              {cartItemCount > 99 ? "99+" : cartItemCount}
            </span>
          )}
        </Link>

        {!user && (
          <Link to="/login">
            <button
              style={{
                padding: "8px 18px",
                fontSize: 16,
                borderRadius: 6,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              로그인
            </button>
          </Link>
        )}
        {user && (
          <>
            {/* 사용자 드롭다운 */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  background: "none",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  marginRight: user.user_type === "admin" ? 8 : 0,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: 6,
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  if (!showDropdown) {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
              >
                {user.name}님 환영합니다
                <span
                  style={{
                    fontSize: 12,
                    transition: "transform 0.2s",
                    transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
              </button>

              {/* 드롭다운 메뉴 */}
              {showDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    minWidth: 150,
                    marginTop: 4,
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      padding: "8px 0",
                    }}
                  >
                    <div
                      style={{
                        padding: "8px 16px",
                        fontSize: 14,
                        color: "#666",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {user.name}님
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setShowDropdown(false)}
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        padding: "12px 16px",
                        fontSize: 14,
                        color: "#374151",
                        cursor: "pointer",
                        textAlign: "left",
                        textDecoration: "none",
                        display: "block",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#f9fafb";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      📦 내 주문 목록
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        padding: "12px 16px",
                        fontSize: 14,
                        color: "#dc2626",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#fef2f2";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      🚪 로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>

            {user.user_type === "admin" && (
              <Link to="/admin">
                <button
                  style={{
                    padding: "8px 18px",
                    fontSize: 16,
                    borderRadius: 6,
                    border: "1px solid #222",
                    background: "#222",
                    color: "#fff",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  어드민
                </button>
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
});

export default Navbar;
