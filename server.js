const express = require("express");
const cors = require("cors");
const knex = require("knex");

const app = express();
app.use(express.json());
app.use(cors());

const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

app.get("/", (req, res) => {
  res.send("This is server for Sample-Report.");
});

app.post("/addReport", (req, res) => {
  let { id, line, data } = req.body;
  console.log(id, line, data[0], data[1]);
  db.transaction((trx) => {
    trx
      .insert({
        id: id,
        data: data,
      })
      .into(`${line}`)
      .returning("*")
      .then((report) => {
        res.json(report[0]);
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json("Unable to add record"));
});

app.get("/getReport/:id/:line", (req, res) => {
  const { id, line } = req.params;
  db.transaction((trx) => {
    trx
      .select(report)
      .table(`${line}`)
      .where("id", id)
      .then((report) => res.send(report[0].data))
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json("x"));
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`App is now running on Port ${process.env.PORT}`);
});

// EXAMPLE OF USING KNEX WITHOUT TRANSACTION
// app.get("/getReport/:id/:line", (req, res) => {
//   const { id, line } = req.params;
//   db.select()
//     .table(`${line}`)
//     .where("id", id)
//     .then((report) => res.send(report[0].data));
// });
