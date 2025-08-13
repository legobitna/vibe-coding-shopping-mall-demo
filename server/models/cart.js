const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 총 금액과 총 수량을 자동으로 계산하는 메소드
cartSchema.methods.calculateTotals = function () {
  this.totalItems = this.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  this.totalAmount = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};

// 아이템 추가/업데이트 전에 총계 자동 계산
cartSchema.pre("save", function (next) {
  this.calculateTotals();
  next();
});

// 인덱스 설정 (사용자당 하나의 장바구니)
cartSchema.index({ user: 1 }, { unique: true });

// 상품과 사용자 정보를 함께 가져오는 정적 메소드
cartSchema.statics.findByUserWithDetails = function (userId) {
  return this.findOne({ user: userId })
    .populate("user", "name email")
    .populate("items.product", "name price category image sku");
};

module.exports = mongoose.model("Cart", cartSchema);
