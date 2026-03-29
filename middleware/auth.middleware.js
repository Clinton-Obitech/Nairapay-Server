import jwt from "jsonwebtoken";

export default async function userAuth(req, res, next) {
    const token = req.cookies.usertoken;

    if (!token) {
        return res.json({
            success: false,
            message: "not authenticated"
       })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (err) {
        console.error(err);
        return res.json({
            success: false,
            message: "invalid token"
        })
    }
}