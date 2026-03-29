import { hash } from "bcrypt";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { fetchDashboardData, fetchProfileData } from "../lib/queries.js";
import pool from "../lib/db.js";

export const createUser = async (req, res) => {

   try {

    const { firstname, lastname, username, email, password, state, terms } = req.body;

    if (!firstname || !lastname || !username || !email || !password || !state) {
        return res.json({
            success: false,
            message: "fill in all the required input fields"
        });
    }

    if (!terms) {
        return res.json({
            success: false,
            message: "accept terms and conditions to continue"
        });
    }

    try {

        const { rows } = await pool.query(
            "SELECT username, email FROM admin WHERE username = $1 OR email = $2",
            [username, email]
        )
        
        const existingUser = rows[0];

        if (existingUser.email === email && existingUser.username === username) {
            return res.json({
            success: false,
            message: "username and email already exists",
            })
        }

        if (existingUser.email === email || existingUser.username === username) {
            return res.json({
            success: false,
            message: 
            existingUser.email === email
            ? "email already exists"
            : "username credentials already exists",
           })
        }
    

    } catch (err) {
        return res.json({
            success: false,
            message: "something went wrong"
        })
    }

    const hashpassword = await hash(password, 10);

    try {
        await pool.query("BEGIN");

        const { rows } = await pool.query(
            `INSERT INTO users 
            (firstname, lastname, username, email, password, state)
            VALUES
            ($1, $2, $3, $4, $5, %6) RETURNING id`, 
            [firstname, lastname, username, email, hashpassword, state]
        );

        await pool.query(
            `INSERT INTO click_earning (user_id) VALUES ($1)`,
            [rows[0].id]
        );
        
        await pool.query("COMMIT");

        return res.json({
            success: true,
            message: "account created successfully"
        })

    } catch (err) {
        await pool.query("ROLLBACK");
        return res.json({
            success: false,
            message: "something went wrong"
        })
    }

   } catch (err) {
    console.error("createUser server error: " + err);
    return res.json({
        success: false,
        message: "request failed"
    })
   }
}

export const loginUser = async (req, res) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.json({
                success: false,
                message: "fill in both fields to continue"
            })
        }

        const { rows } = await pool.query(
            `SELECT * FROM users WHERE username = $1`,
            [username]
        )

        const user = rows[0];

        if (!user || user.length === 0) {
            return res.json({
                success: false,
                message: "user not found"
            })
        }

        if (!user.is_active) {
            return res.json({
                success: false,
                message: "account is disabled. contact customer care to activate account"
            })
        }

        if (user.role !== "user") {
            return res.json({
                success: false,
                message: "invalid credentials authentication"
            })
        }

        const matchPassword = await compare(password, user.password);

        if (!matchPassword) {
            return res.json({
                success: false,
                message: "incorrect password"
            })
        }

        const usertoken = jwt.sign(
            {id: user.id,
             active: user.is_active,
             role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("usertoken", usertoken, {
            httpOnly: true,
            secure: false,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000,
        })

        const dashboard = await fetchDashboardData(user.id);
        const profile = await fetchProfileData(user.id);

        return res.json({
            success: true,
            message: "login successfull",
            dashboard,
            profile
        })

    } catch (err) {
     console.error("loginUser server error: " + err);
     return res.json({
        success: false,
        message: "request failed"
    }) 
    }
}

export const logoutUser = async (req, res) => {

    res.clearCookie("usertoken", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    }
    );
    
    return res.json({
        success: true,
        message: "logout successfully"
    })

}