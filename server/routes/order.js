const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticateToken } = require("../middlewares/auth");

// 주문 생성 (장바구니에서 주문으로 전환)
router.post("/", authenticateToken, orderController.createOrder);

// 내 주문 목록 조회
router.get("/my", authenticateToken, orderController.getMyOrders);

// 모든 주문 조회 (관리자 전용)
router.get("/all", authenticateToken, orderController.getAllOrders);

// 특정 주문 상세 조회
router.get("/:orderId", authenticateToken, orderController.getOrderById);

// 주문 상태 업데이트 (관리자 전용)
router.put(
  "/:orderId/status",
  authenticateToken,
  orderController.updateOrderStatus
);

// 결제 상태 업데이트
router.put(
  "/:orderId/payment-status",
  authenticateToken,
  orderController.updatePaymentStatus
);

// 주문 취소
router.put("/:orderId/cancel", authenticateToken, orderController.cancelOrder);

module.exports = router;
