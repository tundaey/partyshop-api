var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var options = {
    auth: {
        api_key: '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'
    }
}

var mailer = nodemailer.createTransport(sgTransport(options));

module.exports = function(db, req, res){
   var email = {
            to: req.body.email,
            from:'jobs@fixam.com',
            subject:'New Invitation',
            text: req.body.message
        }

        mailer.sendMail(email, function(err, response) {
            if (err) { 
                console.log(err)
                res.json({status: false, message: 'Error sending invite'}) 
            }
            console.log('email response',response);
            res.json({status: true, message: 'Invite sent successfully'})
        });
}

            
