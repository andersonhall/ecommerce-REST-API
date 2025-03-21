import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  database: "ecommerce",
});

export const query = (text, params, callback) => {
  return pool.query(text, params, callback);
};
