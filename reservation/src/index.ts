import express from "express";

const PORT = 4000;

const app = express();

app.get('/', (req, res) => {
  res.send({
    test: 12343
  })
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
