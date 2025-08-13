import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { API_BASE_URL } from "../config/api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data._id) {
          window.location.href = "/";
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "로그인에 실패했습니다.");
      } else {
        localStorage.setItem("token", data.token);
        // TODO: 메인 페이지 등으로 이동 필요
        window.location.href = "/";
      }
    } catch (err) {
      setError("서버와의 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ background: "#f7f8fa", minHeight: "100vh", padding: "40px 0" }}
    >
      <Navbar user={null} cartItemCount={0} />
      <div
        style={{
          maxWidth: 400,
          margin: "40px auto",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          padding: 32,
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: 32,
            marginBottom: 8,
          }}
        >
          CIDER
        </h1>
        <h2
          style={{
            textAlign: "center",
            fontWeight: 600,
            fontSize: 24,
            margin: "24px 0 8px",
          }}
        >
          로그인
        </h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 24 }}>
          계정에 로그인하여 쇼핑을 시작하세요
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ fontWeight: 500, marginBottom: 4, display: "block" }}
            >
              이메일
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 16,
              }}
              required
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label
              style={{ fontWeight: 500, marginBottom: 4, display: "block" }}
            >
              비밀번호
            </label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 16,
              }}
              required
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <label
              style={{ display: "flex", alignItems: "center", fontSize: 14 }}
            >
              <input type="checkbox" style={{ marginRight: 6 }} /> 로그인 상태
              유지
            </label>
            <a href="#" style={{ fontSize: 14, color: "#888" }}>
              비밀번호 찾기
            </a>
          </div>
          {error && (
            <div
              style={{
                color: "#e74c3c",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              background: loading ? "#888" : "#111",
              color: "#fff",
              fontWeight: 600,
              fontSize: 18,
              border: 0,
              borderRadius: 6,
              padding: "12px 0",
              marginBottom: 16,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
        <div style={{ textAlign: "center", color: "#bbb", margin: "16px 0" }}>
          또는
        </div>
        <button
          style={{
            width: "100%",
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 6,
            padding: "10px 0",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 18 }}>G</span> Google로 로그인
        </button>
        <button
          style={{
            width: "100%",
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 6,
            padding: "10px 0",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 18 }}>f</span> Facebook으로 로그인
        </button>
        <button
          style={{
            width: "100%",
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 6,
            padding: "10px 0",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 18 }}></span> Apple로 로그인
        </button>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          아직 계정이 없으신가요?{" "}
          <a href="/register" style={{ color: "#111", fontWeight: 600 }}>
            회원가입
          </a>
        </div>
        <div
          style={{
            textAlign: "center",
            color: "#bbb",
            fontSize: 13,
            marginTop: 16,
          }}
        >
          로그인하시면 이용약관 및 개인정보처리방침에 동의하는 것으로
          간주됩니다.
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
