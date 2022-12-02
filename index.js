const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { application } = require('express');
require('dotenv').config();
const port = process.env.PORT || 5000;


const app = express();

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kyk1ijo.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function api() {
    try {
        const categoriesColl = client.db('assignment12').collection('category');
        const iphoneColl = client.db('assignment12').collection('iphone');
        const samsungColl = client.db('assignment12').collection('samsung');
        const huaweiColl = client.db('assignment12').collection('one-plus');
        const userColl = client.db('assignment12').collection('user');
        const blogColl = client.db('assignment12').collection('blog');
        const allProductColl = client.db('assignment12').collection('products');
        const bookedColl = client.db('assignment12').collection('booked');
        const adsColl = client.db('assignment12').collection('ads');


        app.get('/', async (req, res) => {
            const query = {};
            const options = await categoriesColl.find(query).toArray();
            res.send(options);
        });
        app.get('/iPhone', async (req, res) => {
            const query = {};
            const options = await iphoneColl.find(query).toArray();
            res.send(options);
        });
        app.get('/Samsung', async (req, res) => {
            const query = {};
            const options = await samsungColl.find(query).toArray();
            res.send(options);
        });
        app.get('/Huawei', async (req, res) => {
            const query = {};
            // console.log(query);
            const options = await huaweiColl.find(query).toArray();
            // console.log(options);
            res.send(options);
        });


        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            const query = { userEmail: email }
            // console.log(query);
            const result = await userColl.findOne(query);
            // console.log(result);
            res.send({ isAdmin: result?.userRole === 'Admin' })
        });

        app.get('/all', async (req, res) => {
            const query = {}
            // console.log(query)
            // const options = {
            //     // sort matched documents in descending order by rating
            //     // sort: { "imdb.rating": -1 },
            //     // Include only the `title` and `imdb` fields in the returned document
            //     projection: { _id: 0, userName: 1, userRole: 1 },
            // };
            const user = await userColl.find(query).toArray();
            // console.log(user);
            res.send(user);
        });
        app.get('/buyer1admin', async (req, res) => {
            const query = { userRole: "Buyer" }
            const user = await userColl.find(query).toArray();
            // console.log(user);
            res.send(user);
        });
        app.get('/seller1admin', async (req, res) => {
            const query = { userRole: "Seller" }
            const user = await userColl.find(query).toArray();
            console.log(user);
            res.send(user);
        });


        /////// ok


        //////


        app.get('/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const user = await userColl.findOne(query);
            res.send({ isBuyer: user?.userRole === 'Buyer' })
        });
        app.get('/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const user = await userColl.findOne(query);
            res.send({ isSeller: user?.userRole === 'Seller' })
        });
        app.get('/blog', async (req, res) => {
            const query = {};
            const blogs = await blogColl.find(query).toArray();
            res.send(blogs)
        });

        // Seller Product Gets Based On email

        app.get('/sellerProductsByEmail', async (req, res) => {
            email = req.query.email;
            // console.log(email);
            const query = { userEmail: email };
            const product = await allProductColl.find(query).toArray();
            res.send(product);
        });

        // Buyer Get his product by his email

        app.get('/buyerProductsByEmail', async (req, res) => {
            email = req.query.email;
            // console.log(email);
            const query = { userEmail: email };
            const product = await bookedColl.find(query).toArray();
            res.send(product);
        });

        // Get the ads

        app.get('/ads', async (req, res) => {
            const query = {};
            const options = await adsColl.find(query).toArray();
            res.send(options);
        });

        //  Post Register data

        app.post('/register', async (req, res) => {
            const user = req.body;
            console.log(user);
            const email = req.body.userEmail;
            console.log(email);
            const existUser = await userColl.findOne({ userEmail: email });
            console.log(existUser);
            // if (existUser) {
            //     return res.send({ status: 0, message: 'User Already Exist. Try Another' })
            // }
            const result = await userColl.insertOne(user);
            res.send(result);
        });


        // Seller Added Product post

        app.post('/allProducts', async (req, res) => {
            const product = req.body;
            const result = await allProductColl.insertOne(product);
            res.send(result);
        });

        // Buyer booked Product post
        app.post('/booked', async (req, res) => {
            const product = req.body;
            const result = await bookedColl.insertOne(product);
            res.send(result);
        });

        // Ads post

        app.post('/ads', async (req, res) => {
            const product = req.body;
            const result = await adsColl.insertOne(product);
            res.send(result);
        });




        // User Verified By Admin

        app.put('/user/verify/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    status: 'Verified'
                }
            }
            const updatedUser = await userColl.updateOne(query, updatedDoc, options,);
            res.send(updatedUser);
        })

        // Delete Buyer & Seller by Admin

        app.delete('/deletingUser/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await userColl.deleteOne(query);
            res.send(user);
        });

        // Delete Product from Seller's All product

        app.delete('/deletingProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await allProductColl.deleteOne(query);
            res.send(user);
        });


    }
    finally {

    }
}
api();




app.get('/', async (req, res) => {
    res.send('Server is Running Successfull')
});

app.listen(port, () => console.log(`Server is Running on port ${port}`));