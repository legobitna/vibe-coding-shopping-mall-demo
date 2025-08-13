const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // 주문 기본 정보
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 주문 상품 정보
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    // 총 금액
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // 배송 정보
    shippingAddress: {
      recipient: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      detailAddress: {
        type: String,
      },
      zipCode: {
        type: String,
      },
      deliveryRequest: {
        type: String,
        maxlength: 100,
      },
    },

    // 결제 정보
    paymentMethod: {
      type: String,
      required: true,
      enum: ["신용카드", "계좌이체", "카카오페이", "네이버페이"],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["결제대기", "결제완료", "결제실패", "결제취소"],
      default: "결제대기",
    },
    paymentData: {
      imp_uid: {
        type: String,
        sparse: true, // 중복 방지를 위한 스파스 인덱스
      },
      merchant_uid: {
        type: String,
        unique: true, // 중복 주문 방지
        required: true,
      },
      paid_amount: {
        type: Number,
        min: 0,
      },
      apply_num: {
        type: String, // 카드 승인번호
      },
      payment_method_type: {
        type: String, // 실제 사용된 결제 수단
      },
    },

    // 주문 상태
    orderStatus: {
      type: String,
      required: true,
      enum: [
        "주문확인",
        "상품준비중",
        "배송시작",
        "배송중",
        "배송완료",
        "주문취소",
      ],
      default: "주문확인",
    },
  },
  {
    timestamps: true,
  }
);

// 주문 번호 자동 생성 메소드
orderSchema.statics.generateOrderNumber = async function () {
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10).replace(/-/g, "");

  // 오늘 날짜의 마지막 주문 번호 찾기
  const lastOrder = await this.findOne({
    orderNumber: { $regex: `^ORD-${dateString}` },
  }).sort({ orderNumber: -1 });

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split("-")[2]);
    sequence = lastSequence + 1;
  }

  return `ORD-${dateString}-${sequence.toString().padStart(3, "0")}`;
};

// 총 금액 계산 메소드
orderSchema.methods.calculateTotalAmount = function () {
  this.totalAmount = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};

// 주문 생성 전 주문 번호 자동 생성 및 총 금액 계산
orderSchema.pre("save", async function (next) {
  // orderNumber가 없는 경우에만 자동 생성
  if (this.isNew && !this.orderNumber) {
    try {
      this.orderNumber = await this.constructor.generateOrderNumber();
    } catch (error) {
      return next(error);
    }
  }

  // 총 금액 계산
  this.calculateTotalAmount();
  next();
});

// 사용자와 상품 정보를 함께 가져오는 정적 메소드
orderSchema.statics.findByUserWithDetails = function (userId) {
  return this.find({ user: userId })
    .populate("user", "name email")
    .populate("items.product", "name price category image sku")
    .sort({ createdAt: -1 });
};

// 인덱스 설정
orderSchema.index({ user: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
