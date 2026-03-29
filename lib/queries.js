import pool from "./db";

export const fetchDashboardData = async (userId) => {
    try {

        const { rows } = await pool.query(
            `SELECT username, naira_balance, naira_token, refill
            FROM users
            JOIN click_earning ON users.id = click_earnin.user_id
            WHERE users.id = $1`,[userId]
        )

        return rows[0];

    } catch (err) {
        console.error(err)
    }
}

export const fetchProfileData = async (userId) => {
    try {

        const { rows } = await pool.query(
            `SELECT firstname, lastname, username, email, state, account_name, bank_name, account_number
            FROM users
            LEFT JOIN users_withdrawal_detail ON users.id = users_withdrawal_detail.user_id
            WHERE users.id = $1`, [userId]
        )

        return rows[0];

    } catch (err) {
        console.error(err)
    }
}
