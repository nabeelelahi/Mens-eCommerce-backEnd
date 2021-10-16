var cors = require('cors')
const express = require("express");
const app = express();
const path = require("path");
const { mail, contactUsEmail, orderPlaceEmail } = require("./services/mail/index");
// for diffrent type of data parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/ecommerce.com/backend/api/v1/uploads/",
  express.static(path.join(__dirname, "uploads"))
);
app.use(cors())

// file upload library
const multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname + "/uploads");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname + "." + file.mimetype.split("/")[1]);
    },
  }),
});

// database library
//  const mongoose = require("mongoose");
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require("mongodb").ObjectID;

const PORT = 7000;

const baseURL = "/ecommerce.com/backend/api/v1";

const connectionString =
  "mongodb+srv://Nabeel:html5css3@cluster0.aouf6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const connectionConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};


app.listen(
  PORT,
  console.log(`server has started successfully on port : ${PORT}`)
);

const client = new MongoClient(connectionString, connectionConfig);

if (client.isConnected()) {
  execute();
}
else {
  client.connect().then(function () {
    execute();
  });
}

function execute() {

  // Auth Api's

  app.get(`${baseURL}/login/:email/:password`, (req, res) => {
    const { email, password } = req.params;

    client.db("e-commerce").collection("user").findOne({ Email: email }, function (err, result) {
      if (err) {
        res.json({
          success: false,
          message: err,
        });
      }
      if (!result) {
        res.json({
          success: false,
          message: "no such user",
        });
      } else {
        if (String(result.Password) === String(password)) {
          res.json({
            success: true,
            info: result,
          });
        }
        else {
          res.json({
            success: false,
            message: "password is incorrect"
          })
        }
      }
    });

    return res;
  });

  app.post(`${baseURL}/register/step2`, (req, res) => {

    const { Email } = req.body;

    let info = req.body;

    console.log(info)

    // 1. check first if user exists
    client.db("e-commerce").collection("user").findOne(
      { Email },
      function (err, result) {
        if (err) {
          res.json({
            success: false,
            message: err,
          });
        }
        if (!result) {
          // then save the user
          client.db("e-commerce").collection("user").insertOne(info, function (err, result) {
            if (err) throw err;
            res.json({
              success: true,
              message: "user registered successfully",
              info,
            });
          });
        }
        else {
          res.json({
            success: false,
            message: "user already exists",
          });
        }
      }
    );

    return res;
  });

  app.get(`${baseURL}/register/step1/:Email/:Password`, (req, res) => {

    const { Email, Password } = req.params;

    const code = `EQ-${Math.floor(Math.random() * 100000)}`;

    const mailData = { email: Email, password: Password, code }


    client.db("e-commerce").collection("user").findOne(
      { Email },
      function (err, result) {
        if (err) {
          res.json({
            success: false,
            message: err,
          });
        }
        if (!result) {
          mail(mailData).then((mailResult) => {
            res.json({
              success: mailResult,
              code,
            })
          })
        }
        else {
          res.json({
            success: false,
            message: "user already exists",
          });
        }
      }
    );

    return res;
  });

  app.get(`${baseURL}/forgot-password/:Email`, (req, res) => {

    const { Email } = req.params;

    const code = `EQ-${Math.floor(Math.random() * 100000)}`;

    const mailData = { email: Email, code }

    client.db("e-commerce").collection("user").findOne({ Email }, function (err, result) {
      if (err) {
        res.json({
          success: false,
          message: err,
        });
      }
      if (!result) {
        res.json({
          success: false,
          message: "No such account correspond to your given email.",
        });
      } else {
        mail(mailData).then((mailResult) => {
          res.json({
            success: mailResult,
            code,
          })
        })
      }
    });

    return res;
  });

  app.patch(`${baseURL}/update-password/:Email`, (req, res) => {

    const { Password } = req.body;

    const { Email } = req.params;

    client.db("e-commerce").collection("user").findOneAndUpdate(
      {
        Email
      },
      { $set: { Password: Password } },
      (err, result) => {
        if (!err) {
          res.json({
            success: true,
            message: "Password updated successfully please log in to access your account.",
          });
        }
        if (err) {
          res.json({
            success: false,
            message: err,
          });
        }
      }
    );


    return res;
  });


  // User End API's

  app.get(`${baseURL}/user/get/category`, (req, res) => {

    client.db("e-commerce").collection("category")
      .find({})
      .toArray((err, result) => {
        if (result) {
          res.json({
            success: true,
            category: result,
          });
        }
        if (err) {
          res.json({
            success: false,
            message: err,
          });
        }
        if (!result) {
          res.json({
            success: true,
            category: [],
          });
        }
      });

    return res;
  });

  app.get(`${baseURL}/user/get/products/:categoryId`, (req, res) => {
    const { customerId } = req.params;

    client.db("e-commerce").collection("Orders")
      .find({
        customerId: String(customerId),
        status: "active",
      })
      .toArray((err, result) => {
        if (!err) {
          res.json({
            success: true,
            orders: result,
          });
        }

        if (err) {
          res.json({
            success: false,
            message: err,
          });
        }

        if (!result) {
          res.json({
            success: true,
            orders: [],
          });
        }
      });

    return res;
  });

  app.post(`${baseURL}/user/imagesearch`, (req, res) => {

    const searchResults = req.body
    const allResults = []
    // console.log(searchResults.length);

    // check first if product 1 exist exist
    for (var i = 0; i < searchResults.length; i++)
      client.db("e-commerce").collection("product").findOne({ image: searchResults[i] }, function (err, result) {
        if (err) {
          res.json({
            success: false,
            message: err,
          });
        }
        if (!result) {
          res.json({
            success: false,
            message: "no such product",
          });
        } else {
          allResults.push(result);
          if (allResults.length == searchResults.length) {
            res.json({
              success: true,
              results: allResults,
            })
          }
        }
      });

    return res;
  });

  app.post(
    `${baseURL}/contact-us`,
    (req, res) => {

      const mailData = req.body

      contactUsEmail(mailData).then((mailResult) => {
        if (mailResult) {
          res.json({
            success: true,
            message: 'your query has been sent'
          })
        }
        else {
          res.json({
            success: false,
            message: 'we are afraid something went wrong'
          })
        }
      })

      return res;
    }
  );



  // Admin End API's

  app.get(`${baseURL}/admin/get/users/`, (req, res) => {

    client.db("e-commerce").collection("user")
      .find({})
      .toArray((err, result) => {
        if (!err) {
          res.json({
            success: true,
            users: result,
          });
        }

        if (err) {
          res.json({
            success: false,
            message: err,
          });
        }

        if (!result) {
          res.json({
            success: true,
            users: [],
          });
        }
      });

    return res;
  });

  app.get(`${baseURL}/admin/get/orders`, (req, res) => {

    client.db("e-commerce").collection("order")
      .find({})
      .toArray((err, result) => {
        if (!err) {
          res.json({
            success: true,
            orders: result,
          });
        }

        if (err) {
          res.json({
            success: false,
            message: err,
          });
        }

        if (!result) {
          res.json({
            success: false,
            orders: 'not fount',
          });
        }
      });

    return res;
  });

  app.get(`${baseURL}/admin/get/products`, (req, res) => {

    client.db("e-commerce").collection("product")
      .find()
      .toArray((err, result) => {
        if (!err) {
          res.json({
            success: true,
            products: result,
          });
        } else {
          res.json({
            success: false,
            message: err,
          });
        }
      });

    return res;
  });

  //Product Management API's

  app.post(
    `${baseURL}/new/product/:categoryId`,
    upload.single("productPhoto"),
    (req, res) => {

      let image;



      let product = { ...req.body }

      if (req.file) {
        const { originalname, mimetype } = req.file;
        image =
          "/ecommerce.com/backend/api/v1/uploads/" +
          originalname +
          "." +
          mimetype.split("/")[1];
        product.image = image;
      }

      client.db("e-commerce").collection("product").insertOne(
        product,
        (err, result) => {
          if (!err) {
            res.json({
              success: true,
              message: "product added successfully",
              info: product
            });
          } else {
            res.json({
              success: false,
              message: err,
            });
          }
        }
      );

      return res;
    }
  );

  app.delete(
    `${baseURL}/product/delete/product/:productId`,
    (req, res) => {

      const { productId } = req.params;

      client.db("e-commerce").collection("product").findOneAndDelete(
        { _id: ObjectID(productId) },
        (err, result) => {
          if (!err) {
            res.json({
              success: true,
              message: "product deleted successfully",
            });
          } else {
            res.json({
              success: false,
              message: err,
            });
          }
        }
      );

      return res;
    }
  );


  // Order Api's For User

  app.post(`${baseURL}/create/order`, (req, res) => {
    let orderInfo = { ...req.body };

    // 1. check first if user exists
    client.db("e-commerce").collection("order").insertOne(
      orderInfo,
      (err, result) => {
        if (!err) {
          orderPlaceEmail(orderInfo).then((emailResult) => {
            if (emailResult) {
              res.json({
                success: true,
                message: "order created successfully",
              });
            }
            else{
              res.json({
                success: true,
                message: 'email not send'
              })
            }
          })

        } else {
          res.json({
            success: false,
            message: err,
          });
        }
      }
    );

    return res;
  });

  app.get(`${baseURL}/user/get/active/orders/:userId`, (req, res) => {
    const { userId } = req.params;

    client.db("e-commerce").collection("order")
      .find({
        agencyId: String(userId),
        status: "active",
      })
      .toArray((err, result) => {
        if (!err) {
          res.json({
            success: true,
            orders: result,
          });
        }

        if (err) {
          res.json({
            success: false,
            message: err,
          });
        }

        if (!result) {
          res.json({
            success: true,
            orders: [],
          });
        }
      });

    return res;
  });

  app.get(`${baseURL}/user/get/completed/orders/:userId`, (req, res) => {
    const { userId } = req.params;

    client.db("e-commerce").collection("order")
      .find({
        userId: String(userId),
        status: "completed",
      })
      .toArray((err, result) => {
        if (!err) {
          res.json({
            success: true,
            orders: result,
          });
        }

        if (err) {
          res.json({
            success: false,
            message: err,
          });
        }

        if (!result) {
          res.json({
            success: true,
            orders: [],
          });
        }
      });

    return res;
  });


  app.delete(`${baseURL}/admin/delete/order/:orderId`, (req, res) => {
    const { orderId } = req.params;

    client.db("e-commerce").collection("order").findOneAndDelete(
      {
        _id: ObjectID(orderId),
      },
      (err, result) => {
        if (!err) {
          res.json({
            success: true,
            message: "order deleted successfully",
          });
        }

        if (err) {
          res.json({
            success: false,
            message: err,
          });
        }
      }
    );
    return res;
  });


  // Review Api

  app.post(`${baseURL}/addreview/:productId`, (req, res) => {
    let Info = { ...req.body };
    client.db("e-commerce").collection("review").insertOne(
      Info,
      (err, result) => {
        if (!err) {
          res.json({
            success: true,
            message: "review created successfully",
            info: Info
          });
        } else {
          res.json({
            success: false,
            message: err,
          });
        }
      }
    );

    return res;
  });

  app.get(`${baseURL}/user/get/review`, (req, res) => {

    client.db("e-commerce").collection("review")
      .find({})
      .toArray((err, result) => {
        if (result) {
          res.json({
            success: true,
            review: result,
          });
        }
        if (err) {
          res.json({
            success: false,
            message: err,
          });
        }
        if (!result) {
          res.json({
            success: true,
            review: [],
          });
        }
      });

    return res;
  });

}