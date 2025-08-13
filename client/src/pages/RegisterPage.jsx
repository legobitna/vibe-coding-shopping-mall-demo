import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    agreeAll: false,
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "agreeAll") {
      setForm((prev) => ({
        ...prev,
        agreeAll: checked,
        agreeTerms: checked,
        agreePrivacy: checked,
        agreeMarketing: checked,
      }));
    } else if (name.startsWith("agree")) {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.passwordConfirm) {
      setError("필수 항목을 모두 입력하세요.");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!form.agreeTerms || !form.agreePrivacy) {
      setError("필수 약관에 동의해야 합니다.");
      return;
    }
    // 회원가입 요청
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          address: "",
          user_type: "customer",
        }),
      });
      if (!res.ok) {
        let data = {};
        try {
          data = await res.json();
        } catch {
          data.error = "서버 응답이 올바르지 않습니다.";
        }
        throw new Error(data.error || "회원가입 실패");
      }
      alert("회원가입 성공!");
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 8px #eee",
        padding: 32,
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 8 }}>회원가입</h2>
      <div style={{ textAlign: "center", color: "#888", marginBottom: 24 }}>
        새로운 계정을 만들어 쇼핑을 시작하세요
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="name" style={{ display: "block", marginBottom: 4 }}>
            이름
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="이름"
            style={{ width: "100%", padding: 10 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: 4 }}>
            이메일
          </label>
          <input
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="your@email.com"
            style={{ width: "100%", padding: 10 }}
            type="email"
          />
        </div>
        <div style={{ marginBottom: 16, position: "relative" }}>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: 4 }}
          >
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="비밀번호를 입력하세요"
            style={{ width: "100%", padding: 10 }}
            type={showPw ? "text" : "password"}
          />
          <span
            onClick={() => setShowPw((v) => !v)}
            style={{
              position: "absolute",
              right: 10,
              top: 38,
              cursor: "pointer",
              color: "#aaa",
            }}
          >
            👁️
          </span>
        </div>
        <div style={{ marginBottom: 16, position: "relative" }}>
          <label
            htmlFor="passwordConfirm"
            style={{ display: "block", marginBottom: 4 }}
          >
            비밀번호 확인
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            value={form.passwordConfirm}
            onChange={handleChange}
            placeholder="비밀번호를 다시 입력하세요"
            style={{ width: "100%", padding: 10 }}
            type={showPw2 ? "text" : "password"}
          />
          <span
            onClick={() => setShowPw2((v) => !v)}
            style={{
              position: "absolute",
              right: 10,
              top: 38,
              cursor: "pointer",
              color: "#aaa",
            }}
          >
            👁️
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
          8자 이상, 영문, 숫자, 특수문자 포함
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>
            <input
              type="checkbox"
              name="agreeAll"
              checked={form.agreeAll}
              onChange={handleChange}
            />{" "}
            전체 동의
          </label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>
            <input
              type="checkbox"
              name="agreeTerms"
              checked={form.agreeTerms}
              onChange={handleChange}
            />{" "}
            이용약관 동의 (필수)
          </label>
          <span style={{ float: "right", color: "#888", cursor: "pointer" }}>
            보기
          </span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>
            <input
              type="checkbox"
              name="agreePrivacy"
              checked={form.agreePrivacy}
              onChange={handleChange}
            />{" "}
            개인정보처리방침 동의 (필수)
          </label>
          <span style={{ float: "right", color: "#888", cursor: "pointer" }}>
            보기
          </span>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label>
            <input
              type="checkbox"
              name="agreeMarketing"
              checked={form.agreeMarketing}
              onChange={handleChange}
            />{" "}
            마케팅 정보 수신 동의 (선택)
          </label>
        </div>
        {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            background: "#888",
            color: "#fff",
            border: 0,
            borderRadius: 6,
            fontSize: 18,
          }}
        >
          회원가입
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
