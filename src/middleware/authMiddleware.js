const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    // Lấy token từ header
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Không có token, truy cập bị từ chối" });
    }

    try {
        // Xóa chuỗi "Bearer " nếu có
        const tokenValue = token.replace("Bearer ", "");
        
        // Xác minh token
        const decoded = jwt.verify(tokenValue, "your_secret_key");

        // Lưu thông tin user vào request
        req.user = decoded;

        next(); // Chuyển sang middleware hoặc controller tiếp theo
    } catch (error) {
        res.status(403).json({ message: "Token không hợp lệ" });
    }
};

module.exports = authMiddleware;
