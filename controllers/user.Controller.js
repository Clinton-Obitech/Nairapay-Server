import pool from "../lib/db.js";
import { fetchDashboardData, fetchProfileData } from "../lib/queries.js"

export const getDashboard = async (req, res) => {
    try {
        const data = await fetchDashboardData(req.user.id);

        return res.json({
            success: true,
            dashboard: data
        })

    } catch (err) {
        console.error("getUser server error: " + err);
        return res.json({
            success: false,
            message: "something went wrong"
        })
    }
}

export const getProfile = async (req, res) => {
    try {
        const data = await fetchProfileData(req.user.id);

        return res.json({
            success: true,
            profile: data
        })

    } catch (err) {
        console.error("getProfile server error: " + err);
        return res.json({
            success: false,
            message: "something went wrong"
        })
    }
}

export const updateUser = async (req, res) => {

    const { firstname, lastname, username, email } = req.body;

    try {

        if (!firstname||!lastname||!username||!email) {
        return res.json({
            success: false,
            message: "empty field detected"
        })
        }

        await pool.query(
            `UPDATE users 
            SET firstname = $1, lastname = $2, username = $3, email = $4 WHERE id = $5`
            [firstname, lastname, username, email, req.user.id]
        )

        const dashboard = await fetchDashboardData(req.user.id);
        const profile = await fetchProfileData(req.user.id);
    
        return res.json({
            success: true,
            message: "profile update successful",
            dashboard,
            profile
        })
    } catch (err) {
        console.error("updateUser server error: " + err);
        return res.json({
            success: false,
            message: "something went wrong"
        })
    }

}

export const updateWithdrawalDetails = async (req, res) => {
    try {
        const { account_name, bank_name, account_number } = req.body;

        if (!account_name || !bank_name || !account_number) {
            return res.json({
                    success: false,
                    message: "cannot set empty fields as withdrawal details"
                })
        }

        const { rows } = await pool.query(
            "SELECT * FROM users_withdrawal_detail WHERE user_id = $1",
            [req.user.id]
        )

        if (rows.length === 0) {

            await pool.query(
                `INSERT INTO users_withdrawal_detail 
                (user_id, account_name, bank_name, account_number)
                VALUES
                ($1, $2, $3, $4)`, [req.user.id]
            )

            const profile = await fetchProfileData(req.user.id);

            return res.json({
            success: true,
            message: "withdrawal details created successfully",
            profile
            })

        } else {

        await pool.query(
            `UPDATE users_withdrawal_detail
            SET account_name = $1, bank_name = $2, account_number = $3
            WHERE user_id = $4`, [account_name, bank_name, account_number, req.user.id]
        )

        const profile = await fetchProfileData(req.user.id);

        return res.json({
            success: true,
            message: "withdrawal details updated successfully",
            profile
        })
    }
    } catch (err) {
        console.error("updateWithdrawal server error: " + err);
        return res.json({
            success: false,
            message: "something went wrong",
        })
    }
}
                