const express = require("express");
const morgan = require("morgan");
const path = require("path");
const app = express();
const port = process.env.PORT || 3001;
// const prooductrouter = require("./Router/router.js");
const axios = require("axios");
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "../public")));
// app.use("/api/products/", prooductrouter);
/**
 * get request to fetch all the products with details.
 
 */
app.get("/api/products/:product_id", async (req, res) => {
  var data = [];
  await axios
    .get(
      `https://app-hrsei-api.herokuapp.com/api/fec2/hrnyc/products/${req.params.product_id}/related`,
      {
        headers: {
          Authorization: "0ec7eaa38b73c53816ae2e49dba24eb182006618",
        },
        _id: req.params.product_id,
      }
    )
    .then(async (related) => {
      //loop to get each product
      for (var i = 0; i < related.data.length; i++) {
        await axios
          .get(
            `https://app-hrsei-api.herokuapp.com/api/fec2/hrnyc/products/${related.data[i]}`,
            {
              headers: {
                Authorization: "0ec7eaa38b73c53816ae2e49dba24eb182006618",
              },
            }
          )
          .then((product) => {
            data.push(product.data);
          })
          .catch((err) => console.log(err));
        // this get request to get the style from the related data
        await axios
          .get(
            `https://app-hrsei-api.herokuapp.com/api/fec2/hrnyc/products/${related.data[i]}/styles`,
            {
              headers: {
                Authorization: "0ec7eaa38b73c53816ae2e49dba24eb182006618",
              },
            }
          )
          .then((style) => {
            if (style.data.results[0].photos) {
              data[i].url = style.data.results[0].photos[0];
            }
          })
          .catch((err) => console.log(err));

        await axios
          .get(
            `https://app-hrsei-api.herokuapp.com/api/fec2/hrnyc/reviews?product_id=${related.data[i]}`,
            {
              headers: {
                Authorization: "0ec7eaa38b73c53816ae2e49dba24eb182006618",
              },
              _id: req.params.product_id,
            }
          )
          .then(async (reviews) => {
            console.log(reviews.data);
            if (reviews.data.results) {
              data[i].rating = reviews.data.results;
              console.log(data[i].rating);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => console.log(err));

  res.send(data);
});

app.listen(port, () => {
  console.log(`server running at: http://localhost:${port}`);
});
