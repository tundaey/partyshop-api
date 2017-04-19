const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
// let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'kochcode@gmail.com',
//         pass: 'razzyd123'
//     }
// });

var sgTransport = require('nodemailer-sendgrid-transport');

var options = {
    auth: {
        api_key: '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'
    }
}

var mailer = nodemailer.createTransport(sgTransport(options));


module.exports = function(app, express, db){
    var apiRouter = express.Router();
    

    apiRouter.get('/products', function(req, res, next){
        var product = require('./productModel')(db, req);
        product.getProducts(function(products){
            res.json({products: products.docs, pages: products.totalPages});
        })
    })

    apiRouter.post('/search', function(req, res, next){
        console.log('body', req.body)
        var page = parseInt(req.query.offset);
         var size = parseInt(req.query.limit);
         var skip = page > 0 ? ((page - 1) * size) : 0
        db.collection('products').find({
            "$text": {
                "$search": req.body.query
            }
        }, {
            name: 1,
            advertiser_name: 1,
            image_original:1,
            affiliate_link: 1,
            price: 1,
            _id: 1,
            textScore: {
                $meta: "textScore"}
            },  {
                sort: {
                    textScore: {
                        $meta: "textScore"
                    },
                }
                
            }).skip(req.body.offset).limit(req.body.limit).toArray(function(err, items) {
                if(err) 
                    return res.json({status: false, message: "Error searching for products: "+err});
                res.send({status: true, searchedProducts: items});
        })
    })

    apiRouter.post('/invite', function(req, res, next){
        console.log('req body', req.body)
        if(req.body.products){
            var products = req.body.products;
            var emailProduct = '<ul>'
            products.forEach(function(product) {
                emailProduct = emailProduct + '<li>Gift: ' + product.name + '         ' + ' Link: ' + product.affiliate_link + '      </li>'  
            });
            var emailProduct = emailProduct + '</ul>'
        }

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Party Shopper 👻" <foo@partyshopper.com>', // sender address
            to: req.body.email, // list of receivers
            subject: 'New Invitation ✔', // Subject line
            html: `<p>${req.body.message}</p> <p>on ${req.body.date} at ${req.body.location}</p> with the following suggested gifts:        ${emailProduct}` 
        };

        mailer.sendMail(mailOptions, function(err, response) {
            if (err) { 
                console.log(err)
                res.json({status: false, message: 'Error sending invite'}) 
            }
            console.log('email response',response);
            res.json({status: true, message: 'Invite sent successfully'})
        });
    })




    apiRouter.get('/products/:id', function(req, res, next){
        var product = require('./productModel')(db, req);
        product.getProduct(function(product){
            res.json({product: product})
        })
    })

    return apiRouter;
}