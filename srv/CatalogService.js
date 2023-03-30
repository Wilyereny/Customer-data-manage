const cds = require("@sap/cds");
const MongoClient = require("mongodb").MongoClient;
const dotenv = require('dotenv');
dotenv.config();
//Create .env file with Host_URL and keep the MongoDB there
const uri = process.env.HOST_URL;

const db_name = "BPATest";
const client = new MongoClient(uri);
const ObjectID = require('mongodb').ObjectId

async function _createCustomer(req) {
    await client.connect();
    var db = await client.db(db_name);
    var customer = await db.collection("customer");
    const results = await customer.insertOne(req.data);

    if(results.insertedId) {
        req.data.id = results.insertedId;
    }
    return req.data;
}

async function _getCustomerByCountry(req) {
    await client.connect();   
    var db = await client.db(db_name);
    var customer = await db.collection("customer");
    const results = await customer.aggregate([{ $match: { address: "EGEHaina" } },
                    { $group: { _id: "$country", count: { $sum: 1 } } },
                    { $sort: {count: -1} }])

    return results.toArray();
}

async function _getCustomers(req) {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    var db = await client.db(db_name);
    var filter, results, limit, offset;

    if(req.query.SELECT.one) {
        var sId = req.query.SELECT.from.ref[0].where[2].val;
        filter = {_id: new ObjectID(sId)};
    }
        
    if(req.query.SELECT.limit) {
        limit = req.query.SELECT.limit.rows.val;
        if (req.query.SELECT.limit.offset) {
        offset = req.query.SELECT.limit.offset.val;
            offset = req.query.SELECT.limit.rows.val;
        } else {
            offset = 0 
        }
    } else {
        limit = 1000;
        offset = 0 
    }

    var collection_Customers = await db.collection("customer"); 
    results = await collection_Customers
                    .find(filter)
                    .limit(offset + limit)
                    .toArray();
    results = results.slice(offset)

    for(var i = 0; i < results.length; i++) {
        results[i].id = results[i]._id.toString();
    }
    return results;
}

async function _updateCustomer(req) {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    var db = await client.db(db_name);
    var sapUsers = await db.collection("customer");
    var data = req.data;
    var sId = new ObjectID(data.id);
    delete data.id;
    const results = await sapUsers.updateOne({ _id: sId }, { $set: data });

    if (results.modifiedCount === 1) { 
        delete data._id;
        data.id = sId;
        return data;
    } else {
        console.log(results.result); 
        return results.result;
    }
}

async function _deleteCustomer(req) {
    await client.connect();
    var db = await client.db(db_name);
    var sapUsers = await db.collection("customer");
    var data = req.data;
    var sId = new ObjectID(data.id);
    const results = await sapUsers.deleteOne({_id: sId}); 
    return results;
}


module.exports = cds.service.impl(function() {
    const {customer} = this.entities;
    this.on("INSERT", customer, _createCustomer) ; // Even handler para
    this.on("READ", customer, _getCustomers); //Event handler para leer
    this.on("getCustomerByCountry", _getCustomerByCountry);
    this.on("UPDATE", customer, _updateCustomer),
    this.on("DELETE", customer, _deleteCustomer) 
});

