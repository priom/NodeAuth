var express = require('express');
var router = express.Router();
// passport
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// handle file upload
var multer = require('multer');
var upload = multer({ dest: './uploads' });
// handling User model
var User = require('../models/user');


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

/* user register */
router.get('/register', function(req, res, next) {
    res.render('register', {
      'title': 'Register'
    });
});

/* user login */
router.get('/login', function(req, res, next) {
    res.render('login', {
      'title': 'LogIn'
    });
});

// post user register form data
router.post('/register', upload.single('profileimage'), function(req, res, next) {
    // get form values
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    // check for image field
    if (req.file) {
      console.log('Uploading File...');

      var profileImageOriginalName = req.file.originalname;
      var profileImageName = req.file.name;
      var profileImageMime = req.file.mimetype;
      var profileImageExt = req.file.extension;
      var profileImageSize = req.file.size;

    } else  {
      var profileImageName = 'noimage.png';
    }

    // form validation
    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('email', 'Email is required!').notEmpty();
    req.checkBody('email', 'Email not valid!').isEmail();
    req.checkBody('username', 'Userame is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    // error checking
    var errors = req.validationErrors();

    if (errors) {
      res.render('register', {
        // print errors if any
        errors: errors,
        name: name,
        email: email,
        username: username,
        password: password,
        password2: password2
      });
    } else {
      // create new user object
      var newUser = new User({
        name: name,
        email: email,
        username: username,
        password: password,
        profileimage: profileImageName
      });

      // create new user
      User.createUser(newUser, function(err, user) {
          if(err) throw err;
          console.log(user);
      });

      // success msg after register
      req.flash('success', 'Congratulations! You are now registered successfully and may log in');

      // redirect to login after registered
      res.location('/');
      res.redirect('/');
    }
});

// serialize & deserialize user id
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

// user login authentication
passport.use(new LocalStrategy(
    function(username, password, done){
        User.getUserByUsername(username, function(err, user) {
            if(err) throw err;

            if(!user){
                console.log('Unknown User!');
                return done(null, false, { message: 'Unknown User' });
            }

            User.comparePassword(password, user.password, function(err, isMatch) {
                if(err) throw err;
                if(isMatch) {
                    return done(null, user);
                } else {
                    console.log('Invalid Password!');
                    return done(null, false, { message: 'Invalid Password' });
                }
            });
        });
    }
));

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: 'Invalid username or password!'
    }), function(req, res) {
        console.log('Authentication Successful');
        req.flash('success', 'You are logged in');
        // res.location('/');
        res.redirect('/');
});


module.exports = router;
