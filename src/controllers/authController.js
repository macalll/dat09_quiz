const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/index"); // Import model User từ Sequelize

const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Kiểm tra nếu email hoặc username đã tồn tại
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email đã được sử dụng" });

        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) return res.status(400).json({ message: "Username đã tồn tại" });

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({ message: "Đăng ký thành công", user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ", error });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra người dùng có tồn tại không
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Mật khẩu không đúng" });

        // Tạo token JWT
        const token = jwt.sign(
            { id: user.user_id, role: user.role },
            "your_secret_key",
            { expiresIn: "1h" }
        );

        // Trả về đầy đủ thông tin người dùng
        res.json({
            message: "Đăng nhập thành công",
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ", error });
    }
};

const updateUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userId = req.user.id; // Lấy ID từ token đã xác thực

        // Tìm người dùng theo ID
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

        // Cập nhật thông tin nếu có
        if (username) user.username = username;
        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        // Lưu thay đổi
        await user.save();

        res.json({ message: "Cập nhật thông tin thành công", user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ", error });
    }
};

module.exports = { register, login, updateUser };
