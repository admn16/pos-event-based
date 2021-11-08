import express from "express";

const PORT =  process.env.PORT || 4000;

const app = express();

app.get('/', (req, res) => {
  res.send({
    test: 'EATS API'
  })
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
