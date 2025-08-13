const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");

// 포트원 결제 검증 함수
const verifyPayment = async (imp_uid, merchant_uid, amount) => {
  // 개발환경에서는 결제 검증 건너뛰기 옵션
  if (
    process.env.NODE_ENV === "development" &&
    process.env.SKIP_PAYMENT_VERIFICATION === "true"
  ) {
    console.log("개발환경: 결제 검증을 건너뜁니다.");
    return {
      verified: true,
      payment: {
        pay_method: "card",
        status: "paid",
        amount: amount,
        merchant_uid: merchant_uid,
      },
    };
  }

  try {
    // 포트원 API 키 확인
    const imp_key = process.env.IAMPORT_API_KEY;
    const imp_secret = process.env.IAMPORT_API_SECRET;

    if (!imp_key || !imp_secret) {
      throw new Error("포트원 API 키가 설정되지 않았습니다");
    }

    // 포트원 Access Token 발급
    const tokenResponse = await fetch("https://api.iamport.kr/users/getToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imp_key: imp_key,
        imp_secret: imp_secret,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("포트원 토큰 발급 실패");
    }

    const tokenData = await tokenResponse.json();
    const access_token = tokenData.response.access_token;

    // 결제 정보 조회
    const paymentResponse = await fetch(
      `https://api.iamport.kr/payments/${imp_uid}`,
      {
        method: "GET",
        headers: {
          Authorization: access_token,
        },
      }
    );

    if (!paymentResponse.ok) {
      throw new Error("결제 정보 조회 실패");
    }

    const paymentData = await paymentResponse.json();
    const payment = paymentData.response;

    // 결제 검증
    if (payment.status !== "paid") {
      throw new Error("결제가 완료되지 않았습니다");
    }

    if (payment.merchant_uid !== merchant_uid) {
      throw new Error("주문번호가 일치하지 않습니다");
    }

    if (payment.amount !== amount) {
      throw new Error("결제 금액이 일치하지 않습니다");
    }

    return {
      verified: true,
      payment: payment,
    };
  } catch (error) {
    console.error("결제 검증 실패:", error);
    return {
      verified: false,
      error: error.message,
    };
  }
};

// 주문 생성 (장바구니에서 주문으로 전환)
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, paymentData } = req.body;

    // 필수 배송 정보 검증
    if (
      !shippingAddress ||
      !shippingAddress.recipient ||
      !shippingAddress.phone ||
      !shippingAddress.address
    ) {
      return res.status(400).json({ error: "배송 정보가 누락되었습니다." });
    }

    // 결제 방법 검증
    if (!paymentMethod) {
      return res.status(400).json({ error: "결제 방법이 누락되었습니다." });
    }

    // 결제 데이터 검증
    if (!paymentData || !paymentData.merchant_uid || !paymentData.imp_uid) {
      return res.status(400).json({ error: "결제 정보가 누락되었습니다." });
    }

    // 주문 중복 체크 (merchant_uid 기준)
    const existingOrder = await Order.findOne({
      "paymentData.merchant_uid": paymentData.merchant_uid,
    });

    if (existingOrder) {
      return res.status(400).json({
        error: "이미 처리된 주문입니다.",
        orderNumber: existingOrder.orderNumber,
      });
    }

    // 사용자의 장바구니 조회
    const cart = await Cart.findByUserWithDetails(req.userId);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "장바구니가 비어있습니다." });
    }

    // 결제 금액 검증 (포트원 API 호출)
    const verificationResult = await verifyPayment(
      paymentData.imp_uid,
      paymentData.merchant_uid,
      paymentData.paid_amount
    );

    if (!verificationResult.verified) {
      return res.status(400).json({
        error: `결제 검증 실패: ${verificationResult.error}`,
      });
    }

    // 장바구니 총액과 결제 금액 비교
    if (cart.totalAmount !== paymentData.paid_amount) {
      return res.status(400).json({
        error: "주문 금액과 결제 금액이 일치하지 않습니다.",
      });
    }

    // 주문 번호 생성
    const orderNumber = await Order.generateOrderNumber();

    // 주문 아이템 생성
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price,
    }));

    // 주문 생성
    const order = new Order({
      orderNumber,
      user: req.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: "결제완료", // 결제 성공 후 호출되므로 결제완료로 설정
      orderStatus: "주문확인", // 주문 생성 시 초기 상태
      paymentData: {
        imp_uid: paymentData.imp_uid,
        merchant_uid: paymentData.merchant_uid,
        paid_amount: paymentData.paid_amount,
        apply_num: paymentData.apply_num,
        payment_method_type: verificationResult.payment.pay_method,
      },
    });

    await order.save();

    // 장바구니 비우기
    cart.items = [];
    await cart.save();

    // 생성된 주문 정보를 상품 정보와 함께 반환
    const savedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("items.product", "name price category image sku");

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("주문 생성 에러:", err);
    res.status(400).json({ error: err.message });
  }
};

// 사용자의 주문 목록 조회
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findByUserWithDetails(req.userId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 특정 주문 상세 조회
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("items.product", "name price category image sku");

    if (!order) {
      return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
    }

    // 본인의 주문만 조회 가능 (관리자는 모든 주문 조회 가능)
    if (order.user._id.toString() !== req.userId && req.userType !== "admin") {
      return res.status(403).json({ error: "접근 권한이 없습니다." });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 주문 상태 업데이트 (관리자 전용)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    // 관리자 권한 확인
    if (req.userType !== "admin") {
      return res.status(403).json({ error: "관리자 권한이 필요합니다." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
    }

    order.orderStatus = orderStatus;
    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("items.product", "name price category image sku");

    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 결제 상태 업데이트
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
    }

    // 본인의 주문만 수정 가능 (관리자는 모든 주문 수정 가능)
    if (order.user.toString() !== req.userId && req.userType !== "admin") {
      return res.status(403).json({ error: "접근 권한이 없습니다." });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("items.product", "name price category image sku");

    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 모든 주문 조회 (관리자 전용)
exports.getAllOrders = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.userType !== "admin") {
      return res.status(403).json({ error: "관리자 권한이 필요합니다." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price category image sku")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments();

    res.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 주문 취소
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
    }

    // 본인의 주문만 취소 가능
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({ error: "접근 권한이 없습니다." });
    }

    // 취소 가능한 상태 확인
    if (
      order.orderStatus === "배송시작" ||
      order.orderStatus === "배송중" ||
      order.orderStatus === "배송완료"
    ) {
      return res
        .status(400)
        .json({ error: "배송이 시작된 주문은 취소할 수 없습니다." });
    }

    if (order.orderStatus === "주문취소") {
      return res.status(400).json({ error: "이미 취소된 주문입니다." });
    }

    order.orderStatus = "주문취소";
    order.paymentStatus = "결제취소";
    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("items.product", "name price category image sku");

    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
