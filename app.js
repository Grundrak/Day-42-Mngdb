
const { error } = require("console");
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const PORT = 3000;
const path = require('path');
require('dotenv').config();
let db;
const client = new MongoClient(process.env.URL,  {
  serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
  }
}
);
async function connectmngdb() {
 try{
  await client.connect();
  db = client.db("DataMng"); // connect db to DataMng
  console.log('Great work You are Connected to MongoDb');
  return db
 }catch(err){
  console.error(err.message);
  throw err;
 }
}
connectmngdb();

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('view engine','ejs');
app.set('views','./views');

app.use((req,res,next) => {
  const crDate = new Date();
  const request = req.method;
  const url = req.originalUrl;
  console.log(` The request : ${request} \n Executed at : ${crDate} \n Whit Url :${url}`);
  next();
})

app.use('public',(req ,res ,next) =>{
  res.set('Cache-Control', 'public, max-age =2628000');
  const expire = new Date(Date.now() +2628000 * 1000);
  res.set('Expires', expire.toUTCString());
  console.log(expire);
  next()
})

app.get('/products', async (req ,res) => {
    
     try {
      console.log(db);
      const productsmn = db.collection("Products");
      console.log(productsmn);
      const products = await productsmn.find({}).toArray();
      console.log(products);
      res.render("home", { products });
        } catch (err) {
      res.status(500).send('Error fetching data from Mngdb');
    }
})


app.get("/products/:id", async (req, res) => {
  const productId = parseInt(req.params.id);
  try{
    const product = await db.collection('Products').findOne({ id: productId });
    if (product) {
      res.render('productDetails',{ product });
    } else {
      res.status(404).send();
    }
  }catch(err){
    res.status(500).send('Error fetching data from Mngdb');
  }
});

app.get("/products/p/search", async (req, res) => {
  const searchquery = req.query.name;
  const minPrice = parseFloat(req.query.minPrice);
  const maxPrice = parseFloat(req.query.maxPrice);
  const category = req.query;

  try {
    const query = {};

    if (category) {
      query.category = category;
    }

    if (searchquery) {
      query.name = { $regex: new RegExp(searchquery, "i") };
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice !== undefined) {
      query.price = { $gte: minPrice };
    } else if (maxPrice !== undefined) {
      query.price = { $lte: maxPrice };
    }

    const products = await db.collection('Products').find(query).toArray();
    res.render('search', { products });
  } catch (err) {
    res.status(500).send('Error fetching data from Mngdb');
  }
});


app.post("/products", (req, res) => {
    const {name,price} = req.query
  const createproduct = {id : products.length++, name, price};
  products.push(createproduct);
  if (createproduct) {
    res.status(201).send("Done the product added");
  } else {
    res.status(400).send(); }
});
app.put("/products/:id", (req, res) => {
  const index = products.find((index) => index.id === parseInt(req.params.id));
  const update = req.body;
  if (index !== -1) {
    products[index] = { ...products[index], ...update };
    res.sendStatus(201);
  } else {
    res.sendStatus(404);
  }
});

app.delete("/products/:id", (req, res) => {
  let product = product.find(
    (product) => product.id === parseInt(req.params.id)
  );
  if (product !== -1) {
    product.splice(product, 1);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});
async function createIndexes() {
  const client = new MongoClient(process.env.URL, { useUnifiedTopology: true });

  try {
    await client.connect();
    await db.collection('Products').createIndex({ name: 1 })
    console.log('Indexes created successfully.');
  } catch (err) {
    console.error('Error creating indexes:', err);
  } finally {
    client.close();
  }
}
createIndexes()
app.listen(PORT, () => {
  console.log(`server on port ${PORT}`);
});


