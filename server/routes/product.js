const express = require("express");
const router = express.Router();
const Product = require("../models/product");

// 상품 생성
router.post("/", async (req, res) => {
  try {
    const { sku, name, price, category, image, description } = req.body;
    const product = new Product({
      sku,
      name,
      price,
      category,
      image,
      description,
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 전체 상품 조회 (페이지네이션 포함)
router.get("/", async (req, res) => {
  try {
    // 쿼리 파라미터에서 page와 limit 가져오기
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 2; // 기본 2개씩

    // limit이 0이거나 'all'이면 모든 상품 가져오기 (메인페이지용)
    const getAllProducts = req.query.limit === "0" || req.query.limit === "all";

    const skip = getAllProducts ? 0 : (page - 1) * limit;

    // 검색 조건 (선택사항)
    const searchQuery = {};
    if (req.query.search) {
      searchQuery.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { category: { $regex: req.query.search, $options: "i" } },
        { sku: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // 전체 상품 개수 조회
    const totalItems = await Product.countDocuments(searchQuery);

    // 상품 목록 조회
    let productsQuery = Product.find(searchQuery).sort({ createdAt: -1 });

    if (!getAllProducts) {
      productsQuery = productsQuery.skip(skip).limit(limit);
    }

    const products = await productsQuery;

    if (getAllProducts) {
      // 모든 상품을 가져올 때는 간단한 응답
      res.json(products);
    } else {
      // 페이지네이션 정보 계산
      const totalPages = Math.ceil(totalItems / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      res.json({
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          limit,
          hasNext,
          hasPrev,
        },
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 단일 상품 조회
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 상품 수정
router.put("/:id", async (req, res) => {
  try {
    const { sku, name, price, category, image, description } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { sku, name, price, category, image, description },
      { new: true, runValidators: true }
    );
    if (!product)
      return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 상품 삭제
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
    res.json({ message: "상품이 삭제되었습니다." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
