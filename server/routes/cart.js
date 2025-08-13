const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authenticateToken } = require("../middlewares/auth");

// 장바구니 아이템 개수 조회 (빠른 조회용) - 먼저 배치
router.get("/count", authenticateToken, cartController.getCartCount);

// 장바구니 조회 (사용자별)
router.get("/", authenticateToken, cartController.getCart);

// 장바구니에 아이템 추가
router.post("/", authenticateToken, cartController.addToCart);

// 장바구니 아이템 수량 수정 (productId 기반)
router.put(
  "/update",
  authenticateToken,
  cartController.updateCartItemByProductId
);

// 장바구니 아이템 수량 수정 (itemId 기반)
router.put("/item/:itemId", authenticateToken, cartController.updateCartItem);

// 장바구니에서 특정 아이템 삭제 (productId 기반)
router.delete(
  "/remove",
  authenticateToken,
  cartController.removeCartItemByProductId
);

// 장바구니에서 특정 아이템 삭제 (itemId 기반)
router.delete(
  "/item/:itemId",
  authenticateToken,
  cartController.removeCartItem
);

// 장바구니 전체 비우기
router.delete("/clear", authenticateToken, cartController.clearCart);

module.exports = router;
