import pool from "../../lib/db.js";
import { fetchDashboardData } from "../../lib/queries.js";

export const userClick = async (req, res) => {

    try {

        const { rows } = await pool.query(
            "SELECT refill, naira_token FROM click_earning WHERE user_id = $1",
            [req.user.id]
        )

        if (rows[0].refill === 0) {

            await pool.query(
                "UPDATE click_earning SET completed_at = NOW() WHERE user_id = $1",
                [req.user.id]
            )

            return res.json({
               success: false,
               message: "click exhusted, wait for refill after 24hours"
            })
        }

        await pool.query(
            `UPDATE click_earning SET refill = refill - 1, naira_token = naira_token + 1
            WHERE user_id = $1`, [req.user.id]
        )

        const dashboard = await fetchDashboardData(req.user.id);
        
        return res.json({
           success: true,
           dashboard
        })

    } catch (err) {
        console.error("userClick server error: " + err);
        return res.json({
            success: false,
            message: "something went wrong",
        })
    }
        
}

export const userCollect = async (req, res) => {

    try {

        const { rows } = await pool.query(
            `SELECT naira_token FROM click_earning WHERE user_id = $1`,
            [req.user.id]
        )

        const naira_token = rows[0].naira_token;

        if (naira_token > 0) {
            await pool.query("BEGIN")

            await pool.query(
                `UPDATE click_earning SET naira_token = naira_token - ${naira_token}
                WHERE user_id = $1`, [req.user.id]
            )

            await pool.query(
                `UPDATE users SET naira_balance = naira_balance + ${naira_token}
                WHERE id = $1`, [req.user.id]
            )

            await pool.query("COMMIT")

            const dashboard = await fetchDashboardData(req.user.id);

            return res.json({
              success: true,
              message: "Nairatoken Collected Succesfully",
              dashboard
            })

    } else {
        return res.json({
            success: false,
            message: "insufficient nairatoken"
        })
    }

    } catch (err) {
        await pool.query("ROLLBACK")

        console.error("userCollect server error: " + err);
        return res.json({
            success: false,
            message: "something went wrong",
        })
    }

}

export const userReset = async (req, res) => {

    try {

        const result = await pool.query(
            `UPDATE click_earning SET refill = 1000, completed_at = NULL
            WHERE user_id = $1 AND completed_at <= NOW() - INTERVAL '24 hours'
            `, [req.user.id]
        )

        if (result.rowCount === 0) {
           return;
        }

        const dashboard = await fetchDashboardData(req.user.id);

        return res.json({
            success: true,
            message: "click refilled. continue earning",
            dashboard
        })

    } catch (err) {
        console.error("userReset server error: " + err);
        return res.json({
            success: false,
            message: "something went wrong",
        })
    }

}