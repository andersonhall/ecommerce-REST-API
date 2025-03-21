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

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
