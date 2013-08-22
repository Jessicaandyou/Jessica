var express = require("express")
  , stylus = require('stylus')
  , ff = require('ff')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , bcrypt = require('bcrypt')
  , SALT_WORK_FACTOR = 10

/////////////////////////////////////////////////////////////////////
//database stuff
/////////////////////////////////////////////////////////////////////
// var uristring = 
//   process.env.MONGOLAB_URI || 
//   process.env.MONGOHQ_URL || 
//   'mongodb://localhost/'

// var theport = process.env.PORT || 5000;

// mongoose.connect(uristring, function (err, res) {
//   if (err) { 
//     console.log ('ERROR connecting to: ' + uristring + '. ' + err);
//   } else {
//     console.log ('Succeeded connected to: ' + uristring);
//   }
// });


/////////////////////////////////////////////////////////////////////
//schemas
/////////////////////////////////////////////////////////////////////
// var userSchema = new mongoose.Schema({
//     username: { type: String, required: true, index: { unique: true } }
//   , password: { type: String, required: true }
// })
// userSchema.pre('save', function (next) {
//   var user = this

//   if(!user.isModified('password')) return next()

//   bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
//     if(err) return next(err)

//     bcrypt.hash(user.password, salt, function (err, hash) {
//       if(err) return next(err)

//       user.password = hash
//       next()
//     })
//   })
// })
// userSchema.methods.comparePassword = function (candidatePassword, cb) {
//   bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
//     if(err) return cb(err)

//     cb(null, isMatch)
//   })
// }
// var User = mongoose.model('User', userSchema)

// new User({
//     username: 'david'
//   , password: '123'
// }).save()

// var f = ff(function () {
//   User.find(f.slot())
// }, function (users) {
//   console.log('number of users; '+users.length)
//   console.log(users[0].username)
//   console.log(users[0].password)
// })
/////////////////////////////////////////////////////////////////////
//the app
/////////////////////////////////////////////////////////////////////
var app = express();

function compile (str, path) {
  return stylus(str)
    .set('filename', path)
}

console.log('dirname: '+__dirname)
app.use(express.logger())
  .set('views', __dirname + '/views')
  .set('view engine', 'jade')
  .use(stylus.middleware({
      src: __dirname + '/public'
    , compile: compile
  }))
  .use(express.static(__dirname+'/public'))
  // .use(express.cookieParser())
  .use(express.bodyParser())
  // .use(express.session({ secret: 'wut am i doing' }))
  // .use(passport.initialize())
  // .use(passport.session())

/////////////////////////////////////////////////////////////////////
//authentication
/////////////////////////////////////////////////////////////////////
// passport.use(new LocalStrategy(function (username, password, done) {
//   console.log('\n\n\nin LOCAL Strategy \n\n\n\n\n')
//   var f = ff(function () {
//     User.findOne({username: username}, f.slot())
//   }, function (user) {
//     if(!user) {
//       console.log('no user')
//       return done(null, false)
//     }

//     user.comparePassword(password, function (err, isMatch) {
//       if(err) {
//         console.log('err in comparing password')
//         return done(err)
//       }

//       if(isMatch) {
//         console.log('IS MATCH')
//         return done(null, user)
//       }
//       else {
//         console.log('IS NOT MATCH')
//         return done(null, false)
//       }
//     })
//   })
// }))


// passport.serializeUser(function(user, done) {
//   done(null, user._id);
// });

// passport.deserializeUser(function(id, done) {
//   User.findById(id, function(err, user) {
//     if(user) done(null, user)
//     else done('no user')
//   });
// });

// var ensureLoggedIn = function (req, res, next) {
//   if(!req.isAuthenticated()) res.redirect('/login')
//   else next()
// }

/////////////////////////////////////////////////////////////////////
//routes
/////////////////////////////////////////////////////////////////////
app.get('/', function(request, response) {
  response.render('index')
});

// app.get('/login', function (req, res) {
//   res.render('login', {
//     title: 'Log In'
//   })
// })
// app.post('/login', passport.authenticate('local', { successReturnToOrRedirect: '/admin/view', failureRedirect: '/login' }));


///////////////////////////////////////////////////////////////////
//the server
///////////////////////////////////////////////////////////////////
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});