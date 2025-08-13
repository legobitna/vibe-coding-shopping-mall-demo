import React, { useState } from "react";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

const categories = ["상의", "하의", "악세사리"];

// 환경변수에서 Cloudinary 정보 읽기
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function ProductCreatePage() {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cloudinary 위젯 열기
  const openCloudinaryWidget = () => {
    if (!window.cloudinary) {
      alert("Cloudinary 위젯 로드 실패");
      return;
    }
    if (!cloudName || !uploadPreset) {
      alert("Cloudinary 환경변수가 설정되지 않았습니다.");
      return;
    }
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ["local", "url", "camera"],
        multiple: false,
        cropping: false,
        folder: "products",
        maxFileSize: 2 * 1024 * 1024, // 2MB
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setImage(result.info.secure_url);
        }
      }
    );
    widget.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          name,
          price: Number(price),
          category,
          image,
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "상품 등록에 실패했습니다.");
      } else {
        navigate("/admin/products");
      }
    } catch (err) {
      setError("서버와의 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#f7f8fa", height: "100vh", overflowY: "auto" }}>
      <Navbar user={{ name: "관리자", user_type: "admin" }} cartItemCount={0} />
      <div
        style={{
          maxWidth: 480,
          margin: "40px auto",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          padding: 36,
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: 26,
            marginBottom: 24,
          }}
        >
          상품 등록
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ fontWeight: 500, marginBottom: 4, display: "block" }}
            >
              SKU
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 16,
              }}
              placeholder="SKU를 입력하세요"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ fontWeight: 500, marginBottom: 4, display: "block" }}
            >
              상품명
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 16,
              }}
              placeholder="상품명을 입력하세요"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ fontWeight: 500, marginBottom: 4, display: "block" }}
            >
              가격
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min={0}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 16,
              }}
              placeholder="가격을 입력하세요"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ fontWeight: 500, marginBottom: 4, display: "block" }}
            >
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 16,
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ fontWeight: 500, marginBottom: 4, display: "block" }}
            >
              대표 이미지
            </label>
            <button
              type="button"
              onClick={openCloudinaryWidget}
              style={{
                width: "100%",
                padding: "10px 0",
                borderRadius: 6,
                border: "1px solid #ddd",
                background: "#f7f8fa",
                fontSize: 16,
                fontWeight: 500,
                cursor: "pointer",
                marginBottom: 8,
              }}
            >
              Cloudinary로 이미지 업로드
            </button>
            {image && (
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <img
                  src={image}
                  alt="미리보기"
                  style={{
                    maxWidth: 200,
                    maxHeight: 200,
                    borderRadius: 8,
                    border: "1px solid #eee",
                  }}
                />
                <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
                  미리보기
                </div>
              </div>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ fontWeight: 500, marginBottom: 4, display: "block" }}
            >
              설명 (선택)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 16,
                minHeight: 80,
              }}
              placeholder="상품 설명을 입력하세요"
            />
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
              marginBottom: 8,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "등록 중..." : "상품 등록"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProductCreatePage;
