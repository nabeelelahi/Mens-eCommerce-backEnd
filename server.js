var cors = require('cors')
const express = require("express");
const app = express();
const path = require("path");
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

const client = new MongoClient(connectionString,connectionConfig);

if (client.isConnected()) {
  execute();
} else {
  client.connect().then(function () {
    execute();
  });
}

function execute() {

  app.get(`${baseURL}`, (req, res) => {

    const categories =  [
      {
        name:'Jeans',
        image: 'http://localhost:7000/ecommerce.com/backend/api/v1/uploads/jeans.jpeg'
      },
      {
        name:'Shirt',
        image: 'http://localhost:7000/ecommerce.com/backend/api/v1/uploads/shirt.jpeg'
      },
      {
        name:'T-shirt',
        image: 'http://localhost:7000/ecommerce.com/backend/api/v1/uploads/t-shirt.jpeg'
      },
      {
        name:'Shoes',
        image: 'http://localhost:7000/ecommerce.com/backend/api/v1/uploads/shoes.jpeg'
      },
      {
        name:'ShalwarKameez',
        image: 'http://localhost:7000/ecommerce.com/backend/api/v1/uploads/kurta.jpeg'
      },
      {
        name:'Formal',
        image: 'http://localhost:7000/ecommerce.com/backend/api/v1/uploads/formal.jpeg'
      },
    ]

    categories.forEach(category=>{
      client.db("e-commerce").collection("category").findOne(
        { name: category.name },
        function (err, result) {
          if (err) {
            res.json({
              success: false,
              message: err,
            });
          }
          if (result) {
            res.json({
              success: false,
              message: err,
            });
          }
          if (!result) {
            client.db("e-commerce").collection("category").insertOne(category,(err,result)=>{
              if (err) {
                res.json({
                  success: false,
                  message: err,
                });
              }
            })
          }
        })
    })



    return res.send("Working fine")
  })


// Auth Api's
app.get(`${baseURL}/login/:email/:assword`, (req, res) => {
  const { email, password } = req.params;
  const creds = { email, password };

  // mongoose.createConnection(
  //   connectionString,
  //   connectionConfig,
  //   function (err, db) {
  //     if (err) throw err;
  //   }
  // );

  // 1. check first if user exists
  client.db("e-commerce").collection("user").findOne(creds, function (err, result) {
    if (err) {
      // db.close();
      res.json({
        success: false,
        message: err,
      });
    }
    if (!result) {
      // db.close();
      res.json({
        success: false,
        message: "no such user",
      });
    } else {
      // db.close();
      res.json({
        success: true,
        info: result,
      });
    }
  });

  return res;
});

app.post(`${baseURL}/register`, (req, res) => {
  const { Name, Email, Password, Phone } = req.body;
  let info = { Name, Email, Password, Phone, image: "" };
  console.log(info)
  // 1. check first if user exists
  client.db("e-commerce").collection("user").findOne(
    { email: info.Email },
    function (err, result) {
      if (err) {
        // db.close();
        res.json({
          success: false,
          message: err,
        });
      }
       if (!result) {
        client.db("e-commerce").collection("user").findOne(
          { phone: info.Phone },
          function (err, result) {
            if (err) {
              // db.close();
              res.json({
                success: false,
                message: err,
              });
            }
            if (!result) {
              // then save the user
              client.db("e-commerce").collection("user").insertOne(info, function (err, result) {
                if (err) throw err;
                // db.close();
                res.json({
                  success: true,
                  message: "user registered successfully",
                  info,
                });
              });
            } else {
              // db.close();
              res.json({
                success: false,
                message: "user already exists",
              });
            }
          }
        );
      } else {
        // db.close();
        res.json({
          success: false,
          message: "user already exists",
        });
      }
    }
  );

  return res;
});




// Profile Management API's
app.patch(`${baseURL}/user/edit/profile/:userId`, (req, res) => {
  const { userId } = req.params;
  const { userInfo } = req.body;

  client.db("e-commerce").collection("user").findOneAndUpdate(
    { _id: ObjectID(userId) },
    { $set: userInfo },
    { returnOriginal: false },
    function (err, result) {
      if (err) throw err;
      if (result.lastErrorObject.updatedExisting) {

        res.json({
          success: true,
          user: result.value,
        });
      }
    }
  );
  return res;
});

app.patch(`${baseURL}/user/edit/profile-image/:userId`,
  upload.single("userProfileImage"),
  (req, res) => {

    const { userId } = req.params;
    const { originalname, mimetype } = req.file;
    const image =
      "/ecommerce.com/backend/api/v1/uploads/" +
      originalname +
      "." +
      mimetype.split("/")[1];

    client.db("e-commerce").collection("user").findOneAndUpdate(
      { _id: ObjectID(userId) },
      { $set: { image } },
      { returnOriginal: false },
      function (err, result) {
        if (err) throw err;
        if (result.lastErrorObject.updatedExisting) {
  
          res.json({
            success: true,
            user: result.value,
          });
        }
      }
    );

    return res;
  }
);

app.patch(`${baseURL}/admin/edit/profile/:adminId`, (req, res) => {
  const { adminId } = req.params;
  const { adminInfo } = req.body;

  client.db("e-commerce").collection("admin").findOneAndUpdate(
    { _id: ObjectID(adminId) },
    { $set: agencyInfo },
    { returnOriginal: false },
    function (err, result) {
      if (err) throw err;
      if (result.lastErrorObject.updatedExisting) {

        res.json({
          success: true,
          user: result.value,
        });
      }
    }
  );

  return res;
});

app.patch(
  `${baseURL}/admin/edit/profile-image/:adminId`,
  upload.single("adminProfileImage"),
  (req, res) => {

    const { adminId } = req.params;
    const { originalname, mimetype } = req.file;
    const image =
      "/ecommerce.com/backend/api/v1/uploads/" +
      originalname +
      "." +
      mimetype.split("/")[1];

    client.db("e-commerce").collection("admin").findOneAndUpdate(
      { _id: ObjectID(adminId) },
      { $set: { image } },
      { returnOriginal: false },
      function (err, result) {
        if (err) throw err;
        if (result.lastErrorObject.updatedExisting) {
  
          res.json({
            success: true,
            user: result.value,
          });
        }
      }
    );

    return res;
  }
);



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
  for(var i=0; i<searchResults.length; i++)
  client.db("e-commerce").collection("product").findOne({image: searchResults[i]}, function (err, result) {
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
      if(allResults.length == searchResults.length){
         res.json({
           success: true,
           results: allResults,
         })
      }
    }
  });

  return res;
});



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
          orders:  'not fount',
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

app.patch(
  `${baseURL}/edit/product/:productId`,
  upload.single("productImage"),
  (req, res) => {

    const { productId } = req.params;

    let image;
    let product = req.body
    
    if (req.file) {
      const { originalname, mimetype } = req.file;
      image =
        "/ecommerce.com/backend/api/v1/uploads/" +
        originalname +
        "." +
        mimetype.split("/")[1];
      product.image = image;
    }

    client.db("e-commerce").collection("product").findOneAndUpdate(
      { _id: ObjectID(productId) }, // query object to locate the object to modify
      { $inc: product  }, //document (object) with the fields/vals to be updated
      { new: true, }, 
      (err, result) => {
        if (!err) {
          res.json({
            success: true,
            message: "product updated successfully",
            product: result.value,
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
        res.json({
          success: true,
          message: "order created successfully",
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


// Order Api's For Admin

app.patch(
  `${baseURL}/admin/patch/order/mark-as-completed/:orderId`,
  (req, res) => {

    const { orderId } = req.params;

    client.db("e-commerce").collection("order").findOneAndUpdate(
      {
        _id: ObjectID(orderId),
      },
      { $set: { status: "completed" } },
      (err, result) => {
        if (!err) {
          res.json({
            success: true,
            message: "order updated successfully",
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
  }
);

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

}

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