const express = require('express');
const router = express.Router();
const db = require('../models');
const crypto = require('crypto');
const helpers = require('./helpers/authHelpers');
const jwt = require('jsonwebtoken');
var sgMail = require('@sendgrid/mail');
// var nodemailer = require('nodemailer');
// var sgTransport = require('nodemailer-sendgrid-transport');

// var options = {
//    auth: {
//      api_user: process.env.Nodemailer_API_USER,
//      api_key: process.env.Nodemailer_API_KEY
//    }
//  }
//  var client = nodemailer.createTransport(sgTransport(options));
// register
router.post('/register', (req, res) => {
   if (!req.body.displayName || !req.body.password || !req.body.email) {
      return res.status(400).json({ msg: new Error('Please put all data on body.') });
   }
   const user = {
      displayName: req.body.displayName,
      email: req.body.email,
      salt: helpers.getSalt()
   }
   user.emailToken = jwt.sign({
      displayName: user.displayName,
      email: user.email
   }, process.env.REACT_APP_JWT_SECRET, {expiresIn: '24h'});

   user.hash = helpers.getHash(user.salt, req.body.password);
   // sendgrid
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
 

   // var email = {
   //    from: 'noreply@jumpingJalapinoRabbit.com',
   //    to: 'huq.farjana03@gmail.com',
   //    subject: 'Email Activation',
   //    text: 'Click the link to activate your email',
   //    // <p>To confirm your registration, please click the following link:</p>
   //    // <a href="http://localhost:3000/activate/${emailToken}">http://localhost:3000/activate</a>`,
   //    html: '<strong><b>Hello</b></strong>'
   //    // <p>To confirm your registration, please click the following link:</p>
   //    // <a href="http://localhost:3000/activate/${emailToken}">http://localhost:3000/activate</a>`
   //  };
    
   //  client.sendMail(email, function(err, info){
   //      if (err ){
   //        console.log(err);
   //      }
   //      else {
   //        console.log('Message sent: ' + info.response);
   //      }
   //  });
   
   db.User.create(user)
      .then(resp => {
         console.log("User data", resp);     
         res.json(resp); 
         //res.status(201).json({ msg: 'Account registered. Please check your email to activate your account.' });
      })
         
      .catch(err => res.status(400).json({ msg: err.toString() }));
    
      sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);
      const msg = {
        to: 'huq.farjana03@gmail.com',
        from: 'test@example.com',
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      };
      sgMail.send(msg);
     
});

// login
router.post('/login', (req, res) => {
   console.log('login route hit');
   if (!req.body.password || !req.body.email) {
      return res.status(400).json({ msg: new Error('Please put all data on body.') });
   }
   db.User.findOne({ email: req.body.email })
      .then(resp => {
         if (helpers.checkIfValidPass(resp, req.body.password)) {
            var expiry = new Date();
            expiry.setDate(expiry.getDate() + 7);

            res.json({
               userID: resp._id,
               displayName: resp.displayName,
               email: resp.email,
               date: resp.date,
               emailToken: resp.emailToken,
               token: jwt.sign({
                  exp: parseInt(expiry.getTime() / 1000),
                  userID: resp._id,
                  displayName: resp.displayName,
                  email: resp.email,
                  date: resp.date,
               }, process.env.REACT_APP_JWT_SECRET)
            });
         } else {
            throw new Error('Incorrect password.');
         }
      })
      .catch(err => res.status(400).json({ msg: err.toString() }));
});

module.exports = router;