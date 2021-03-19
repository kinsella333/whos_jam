const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../mongo_config/keys");
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const Admin = require("../../models/Admin");
const Game = require("../../models/Game");

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/admin_login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid)  return res.status(400).json(errors);
  const id = req.body.id;
  const password = req.body.pin;

  // Find user by email
  Admin.findOne({ id }).then(admin => {
    if (!admin)  return res.status(404).json({ emailnotfound: "No Admin By That ID" });
    let TIME_OUT = 60*24

    // Check password
    bcrypt.compare(password, admin.password).then(isMatch => {
      if (isMatch) {
        const payload = {
          id: admin.id
        };

        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          (err, token) => {
            if (token){
              Game.findOne({ creater:id }).then(game => {
                  var expire = new Date()
                  if(game && game.status != 'E'){
                    expire.setMinutes(expire.getMinutes() + 60*24);

                    res.cookie('game',game.id,{
                        signed:true,
                        expires:expire
                    });
                  }

                  expire = new Date()
                  expire.setMinutes(expire.getMinutes() + TIME_OUT);

                  res.cookie('admin',id,{
                      signed:true,
                      expires:expire
                  });
                  res.status(200).send('http://'+req.headers.host+'/admin')
              });
            }else{
              res.status(400).json({badtoken: "Error in Token Creation"})
            }
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

router.get('/admin_login', function(req, res, next) {
  res.render('admin_login.njk')
})

router.get('/admin_logout', function(req, res, next) {
  let user_token = req.signedCookies['admin'];
  let spotify_token = req.signedCookies['spotify'];
  let game_token = req.signedCookies['game'];

  if (user_token) res.clearCookie('user')
  if (spotify_token) res.clearCookie('spotify')
  if (game_token) res.clearCookie('game')
  res.redirect('/api/admins/admin_login')
})

router.get('/admin_tokenize', function(req, res, next) {
  let user_token = req.signedCookies['admin'];

  if (user_token) res.redirect('/admin')
  else res.redirect('/api/admins/admin_login')
})

// // @route POST api/users/register
// // @desc Register user
// // @access Public
// router.post("/register", (req, res) => {
//   // Form validation
// const { errors, isValid } = validateRegisterInput(req.body);
// // Check validation
//   if (!isValid) {
//     return res.status(400).json(errors);
//   }
// User.findOne({ email: req.body.email }).then(user => {
//     if (user) {
//       return res.status(400).json({ email: "Email already exists" });
//     } else {
//       const newUser = new User({
//         name: req.body.name,
//         email: req.body.email,
//         password: req.body.password
//       });
// // Hash password before saving in database
//       bcrypt.genSalt(10, (err, salt) => {
//         bcrypt.hash(newUser.password, salt, (err, hash) => {
//           if (err) throw err;
//           newUser.password = hash;
//           newUser
//             .save()
//             .then(user => res.json(user))
//             .catch(err => console.log(err));
//         });
//       });
//     }
//   });
// });

module.exports = router;
