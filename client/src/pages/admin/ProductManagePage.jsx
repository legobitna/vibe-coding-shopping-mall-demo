import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

function ProductManagePage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 2,
    hasNext: false,
    hasPrev: false,
  });
  const navigate = useNavigate();

  // 상품 목록 가져오기
  const fetchProducts = async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "2",
      });

      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`${API_BASE_URL}/products?${params}`);
      if (!response.ok) {
        throw new Error("상품 목록을 가져오는데 실패했습니다.");
      }
      const data = await response.json();
      setProducts(data.products);
      setFilteredProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      console.error("상품 목록 가져오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 상품 목록 가져오기
  useEffect(() => {
    fetchProducts();
  }, []);

  // 검색 기능 (서버 사이드 검색으로 변경)
  const handleSearch = (term) => {
    setSearchTerm(term);
    fetchProducts(1, term); // 검색 시 첫 페이지로 이동
  };

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    fetchProducts(newPage, searchTerm);
  };

  // 상품 삭제 함수
  const handleDelete = async (productId) => {
    if (window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("상품 삭제에 실패했습니다.");
        }

        alert("상품이 성공적으로 삭제되었습니다.");

        // 삭제 후 현재 페이지 새로고침
        fetchProducts(pagination.currentPage, searchTerm);
      } catch (err) {
        alert(err.message);
        console.error("상품 삭제 실패:", err);
      }
    }
  };

  // 상품 편집 함수
  const handleEdit = (productId) => {
    // 실제로는 편집 페이지로 이동
    console.log("편집:", productId);
    alert("편집 기능은 개발 중입니다.");
  };

  return (
    <div style={{ background: "#f7f8fa", minHeight: "100vh" }}>
      <Navbar user={{ name: "관리자", user_type: "admin" }} cartItemCount={0} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 0 64px" }}>
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
              상품 관리
            </h1>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => fetchProducts(pagination.currentPage, searchTerm)}
              style={{
                background: "#f3f4f6",
                color: "#666",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 16,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              disabled={loading}
              title="새로고침"
            >
              🔄
            </button>
            <Link
              to="/admin/products/create"
              style={{ textDecoration: "none" }}
            >
              <button
                style={{
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 18 }}>+</span>새 상품 등록
              </button>
            </Link>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: 24,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="text"
                placeholder="상품명으로 검색..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 40px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 16,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  fontSize: 16,
                }}
              >
                🔍
              </span>
            </div>
            <button
              style={{
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "12px 20px",
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              🔽 필터
            </button>
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
            <button
              onClick={() => fetchProducts(pagination.currentPage, searchTerm)}
              style={{
                marginLeft: 12,
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "4px 12px",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 상품 목록 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}
        >
          {/* 테이블 헤더 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 120px 100px 120px",
              gap: 16,
              padding: "20px 24px",
              background: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              fontSize: 14,
              fontWeight: 600,
              color: "#6b7280",
            }}
          >
            <div>이미지</div>
            <div>상품명</div>
            <div>카테고리</div>
            <div>가격</div>
            <div style={{ textAlign: "center" }}>액션</div>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div
              style={{
                padding: "60px 0",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 16,
              }}
            >
              상품 목록을 불러오는 중...
            </div>
          )}

          {/* 상품 목록 */}
          {!loading &&
            filteredProducts.map((product) => (
              <div
                key={product._id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 120px 100px 120px",
                  gap: 16,
                  padding: "20px 24px",
                  borderBottom: "1px solid #f3f4f6",
                  alignItems: "center",
                }}
              >
                {/* 상품 이미지 */}
                <div>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      objectFit: "cover",
                      background: "#f3f4f6",
                    }}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/60x60/f0f0f0/888?text=IMG";
                    }}
                  />
                </div>

                {/* 상품명 */}
                <div>
                  <div
                    style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}
                  >
                    {product.name}
                  </div>
                  <div style={{ fontSize: 13, color: "#9ca3af" }}>
                    SKU: {product.sku}
                  </div>
                </div>

                {/* 카테고리 */}
                <div style={{ fontSize: 14, color: "#6b7280" }}>
                  {product.category}
                </div>

                {/* 가격 */}
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>
                    ₩{product.price.toLocaleString()}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <button
                    onClick={() => handleEdit(product._id)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 8,
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 16,
                      color: "#6b7280",
                      "&:hover": { background: "#f3f4f6" },
                    }}
                    title="편집"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 8,
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 16,
                      color: "#ef4444",
                      "&:hover": { background: "#fef2f2" },
                    }}
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

          {/* 상품이 없을 때 */}
          {!loading && filteredProducts.length === 0 && !error && (
            <div
              style={{
                padding: "60px 0",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 16,
              }}
            >
              {searchTerm ? "검색 결과가 없습니다." : "등록된 상품이 없습니다."}
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              marginTop: 32,
            }}
          >
            {/* 이전 페이지 버튼 */}
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              style={{
                background: pagination.hasPrev ? "#fff" : "#f3f4f6",
                color: pagination.hasPrev ? "#374151" : "#9ca3af",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 14,
                cursor: pagination.hasPrev ? "pointer" : "not-allowed",
              }}
            >
              ← 이전
            </button>

            {/* 페이지 번호들 */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  style={{
                    background:
                      pageNum === pagination.currentPage ? "#111" : "#fff",
                    color:
                      pageNum === pagination.currentPage ? "#fff" : "#374151",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 14,
                    cursor: "pointer",
                    minWidth: 40,
                  }}
                >
                  {pageNum}
                </button>
              )
            )}

            {/* 다음 페이지 버튼 */}
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              style={{
                background: pagination.hasNext ? "#fff" : "#f3f4f6",
                color: pagination.hasNext ? "#374151" : "#9ca3af",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 14,
                cursor: pagination.hasNext ? "pointer" : "not-allowed",
              }}
            >
              다음 →
            </button>
          </div>
        )}

        {/* 페이지네이션 정보 */}
        {!loading && !error && pagination.totalItems > 0 && (
          <div
            style={{
              textAlign: "center",
              marginTop: 16,
              color: "#6b7280",
              fontSize: 14,
            }}
          >
            전체 {pagination.totalItems}개 상품 중{" "}
            {(pagination.currentPage - 1) * pagination.limit + 1}-
            {Math.min(
              pagination.currentPage * pagination.limit,
              pagination.totalItems
            )}
            개 표시
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductManagePage;
