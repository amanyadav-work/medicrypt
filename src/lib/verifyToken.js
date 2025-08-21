const { jwtVerify } = require("jose");

export const verifyToken = async (req) => {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return payload;
  } catch (err) {
    return null;
  }
}