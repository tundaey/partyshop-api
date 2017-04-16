var ObjectID = require('mongodb').ObjectID;

module.exports = function(db, req){
    var collection = db.collection('products');

    var getProducts = function(callback){
         var page = parseInt(req.query.offset);
         var size = parseInt(req.query.limit);
         var skip = page > 0 ? ((page - 1) * size) : 0
        collection.find({}, {}, {skip: skip, limit: size}).toArray(function(err, docs){
            collection.count({}, function(err, totalPages){
                var returnObject = {docs: docs, totalPages: totalPages}  
                callback(returnObject); 
            });  
                  
        })
    }
    
    var getProduct = function(callback){
        console.log('params', req.params)
        var idString = req.params.id
        collection.findOne({"_id": new ObjectID(idString)}, function(err, product){
            console.log(product)
            callback(product)
        })
    }

    var searchProducts = function(callback){
        collection.find({
            "$text": {
                "$search": req.body.query
            }
        }, {
            name: 1,
            description: 1,
            _id: 1,
            textScore: {
                $meta: "textScore"
            }
        }, {
            sort: {
                textScore: {
                $meta: "textScore"
            },
            limit: 20
        }
    }).toArray(function(err, items) {
        console.log('items', items)
        callback(items)
        })
    }

     var sendInvite = function(callback){
         var email = {
             to: req.body.email,
            from:'jobs@fixam.com',
            subject:'New Invitation',
            text: req.body.message
         }

         mailer.sendMail(email, function(err, response) {
            if (err) { 
                console.log(err)
            }
            console.log('email response',response);
            callback(response);      
        });
     }

    return {
        getProducts: getProducts,
        searchProducts: searchProducts,
        getProduct: getProduct,
        sendInvite: sendInvite
    }   
}
