const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const db = require("./db/index");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "The app is working" });
});

// get products
app.get("/products", async (req, res) => {
  const result = await db.query(`SELECT * FROM products ORDER BY product_id`);
  res.send(result.rows);
});

// get product by id
app.get("/products/:productId", async (req, res) => {
  const { productId } = req.params;
  const result = await db.query(
    `SELECT * FROM products WHERE product_id = $1`,
    [productId]
  );
  if (result.rows.length === 0) {
    return res.status(404).send({ message: "Product not found" });
  }
  res.status(200).send(result.rows[0]);
});

// create product
app.post("/products", async (req, res) => {
  const { name, price, description } = req.body;
  const result = await db.query(
    `INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING *`,
    [name, price, description]
  );
  const id = result.rows[0].id;
  return res
    .status(201)
    .send({ message: "New product created", product: result.rows[0] });
});
// update product
app.put("/products/:productId", async (req, res) => {
  const { productId } = req.params;
  const { name, price, description } = req.body;
  const result = await db.query(
    `UPDATE products SET name = $1, price = $2, description = $3 WHERE product_id = $4 RETURNING *`,
    [name, price, description, productId]
  );
  if (result.rows.length === 0) {
    return res.status(404).send({ message: "Product not found" });
  }
  return res
    .status(200)
    .send({ message: "Product updated", product: result.rows[0] });
});

// delete product
app.delete("/products/:productId", async (req, res) => {
  const { productId } = req.params;
  const result = await db.query(
    `DELETE FROM products WHERE product_id = $1 RETURNING *`,
    [productId]
  );
  if (result.rows.length === 0) {
    return res.status(404).send({ message: "Product not found" });
  }
  return res.status(204).send();
});

// register a user
app.post("/register", async (req, res, next) => {
  const { password, email, first_name, last_name } = req.body;
  let user = await db.query(`SELECT * FROM users where email = $1`, [email]);
  if (user.rows.length > 0) {
    return res
      .status(400)
      .send({ message: "User already exists with that email address." });
  }
  user = await db.query(
    `INSERT INTO users (password, email, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *`,
    [password, email, first_name, last_name]
  );
  return res.status(201).send(user.rows[0]);
});

// login user
app.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await db.query(
    `SELECT * from users WHERE email = $1 AND password = $2`,
    [email, password]
  );
  if (user.rows.length === 0) {
    return res.send({ message: "Email and password combination not found." });
  }
  res.send({ message: "User logged in.", user: user.rows[0] });
});

// get users
app.get("/users", async (req, res) => {
  const result = await db.query(`SELECT * FROM users ORDER BY user_id`);
  res.send(result.rows);
});

// get user by id
app.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  const result = await db.query(`SELECT * FROM users WHERE user_id = $1`, [
    userId,
  ]);
  if (result.rows.length === 0) {
    return res.status(404).send({ message: "User not found" });
  }
  res.status(200).send(result.rows[0]);
});

// update user
app.put("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  const { email, password, first_name, last_name } = req.body;
  const result = await db.query(
    `UPDATE users SET email = $1, password = $2, first_name = $3, last_name = $4 WHERE user_id = $5 RETURNING *`,
    [email, password, first_name, last_name, userId]
  );
  if (result.rows.length === 0) {
    return res.status(404).send({ message: "User not found" });
  }
  return res
    .status(200)
    .send({ message: "User updated", user: result.rows[0] });
});

// delete user
app.delete("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  const result = await db.query(
    `DELETE FROM users WHERE user_id = $1 RETURNING *`,
    [userId]
  );
  if (result.rows.length === 0) {
    return res.status(404).send({ message: "User not found" });
  }
  return res.status(204).send();
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
