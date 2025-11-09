"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const uploads_routes_1 = __importDefault(require("./routes/uploads.routes"));
const auth_middleware_1 = require("./middleware/auth.middleware");
require("./config/firebase"); // Initialize Firebase
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
    credentials: true
}));
app.use(express_1.default.json());
// Protected Routes
app.use('/api/uploads', auth_middleware_1.authMiddleware, uploads_routes_1.default);
// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
