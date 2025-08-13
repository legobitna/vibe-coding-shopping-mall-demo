const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken } = require("../middlewares/auth");

// 유저 생성
router.post("/", userController.createUser);

// 유저 전체 조회
router.get("/", userController.getUsers);

// 내 정보 조회 (토큰 필요)
router.get("/me", authenticateToken, userController.getMe);

// 유저 단일 조회
router.get("/:id", userController.getUserById);

// 유저 수정
router.put("/:id", userController.updateUser);

// 유저 삭제
router.delete("/:id", userController.deleteUser);

// 로그인
router.post("/login", userController.loginUser);

module.exports = router;
