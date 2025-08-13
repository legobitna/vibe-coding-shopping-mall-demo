const Cart = require("../models/cart");
const Product = require("../models/product");

// 장바구니 조회 (사용자별)
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findByUserWithDetails(req.userId);

    if (!cart) {
      // 장바구니가 없으면 빈 장바구니 생성
      cart = new Cart({
        user: req.userId,
        items: [],
      });
      await cart.save();
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 장바구니에 아이템 추가
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // 상품 존재 확인
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
    }

    // 사용자의 장바구니 조회 또는 생성
    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = new Cart({
        user: req.userId,
        items: [],
      });
    }

    // 이미 장바구니에 있는 상품인지 확인
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // 이미 있는 상품이면 수량 증가
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // 새로운 상품이면 추가
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    await cart.save();

    // 상품 정보와 함께 응답
    const updatedCart = await Cart.findByUserWithDetails(req.userId);
    res.status(201).json(updatedCart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 장바구니 아이템 수량 수정
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "수량은 1개 이상이어야 합니다." });
    }

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ error: "장바구니를 찾을 수 없습니다." });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ error: "해당 상품을 장바구니에서 찾을 수 없습니다." });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findByUserWithDetails(req.userId);
    res.json(updatedCart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 장바구니에서 특정 아이템 삭제
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ error: "장바구니를 찾을 수 없습니다." });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ error: "해당 상품을 장바구니에서 찾을 수 없습니다." });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const updatedCart = await Cart.findByUserWithDetails(req.userId);
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 장바구니 전체 비우기
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ error: "장바구니를 찾을 수 없습니다." });
    }

    cart.items = [];
    await cart.save();

    const updatedCart = await Cart.findByUserWithDetails(req.userId);
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 장바구니 아이템 개수 조회 (빠른 조회용)
exports.getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    const count = cart ? cart.totalItems : 0;
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 장바구니 아이템 수량 수정 (productId 기반)
exports.updateCartItemByProductId = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "수량은 1개 이상이어야 합니다." });
    }

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ error: "장바구니를 찾을 수 없습니다." });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ error: "해당 상품을 장바구니에서 찾을 수 없습니다." });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findByUserWithDetails(req.userId);
    res.json(updatedCart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 장바구니에서 특정 아이템 삭제 (productId 기반)
exports.removeCartItemByProductId = async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ error: "장바구니를 찾을 수 없습니다." });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ error: "해당 상품을 장바구니에서 찾을 수 없습니다." });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const updatedCart = await Cart.findByUserWithDetails(req.userId);
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
