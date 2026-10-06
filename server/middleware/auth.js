import jwt from "jsonwebtoken";

// Middleware to authenticate JWT token
export const authenticate = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Authentication failed. Token missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user object { id, role, email, studentId } to req
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Middleware to restrict access based on roles (e.g. "student" or "admin")
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};

export default authenticate;

