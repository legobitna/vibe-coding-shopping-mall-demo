const jwt = require("jsonwebtoken");

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "인증 토큰이 필요합니다." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userType = decoded.userType;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "토큰이 만료되었습니다." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "유효하지 않은 토큰입니다." });
    }
    return res.status(401).json({ error: "인증에 실패했습니다." });
  }
};

// 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // 토큰이 없어도 통과
      req.userId = null;
      req.userEmail = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userType = decoded.userType;
    next();
  } catch (err) {
    // 토큰이 유효하지 않아도 통과 (비로그인 사용자로 처리)
    req.userId = null;
    req.userEmail = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
};
