var express = require("express")
  , stylus = require('stylus')
  , ff = require('ff')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , bcrypt = require('bcrypt')
  , SALT_WORK_FACTOR = 10
  , cloudinary = require('cloudinary')
  , fs = require('fs')

/////////////////////////////////////////////////////////////////////
//database stuff
/////////////////////////////////////////////////////////////////////
var uristring = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/'

var theport = process.env.PORT || 5000;

mongoose.connect(uristring, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

/////////////////////////////////////////////////////////////////////
//cloudinary
/////////////////////////////////////////////////////////////////////
cloudinary.config({ 
  cloud_name: 'hevuo97wt', 
  api_key: '998917412177184', 
  api_secret: '0s4KcIeAuFS56mwaa8GFWtoWjY4' 
});


/////////////////////////////////////////////////////////////////////
//schemas
/////////////////////////////////////////////////////////////////////
var collectionSchema = new mongoose.Schema({
    name: { type: String, required: true }
  , description: String
  , pictures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Picture' }]
})
var Collection = mongoose.model('Collection', collectionSchema)

var pictureSchema = new mongoose.Schema({
    url: { type: String, required: true }
  , description: String
})
var Picture = mongoose.model('Picture', pictureSchema)

var userSchema = new mongoose.Schema({
    username: { type: String, required: true, index: { unique: true } }
  , password: { type: String, required: true }
})
userSchema.pre('save', function (next) {
  var user = this

  if(!user.isModified('password')) return next()

  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if(err) return next(err)

    bcrypt.hash(user.password, salt, function (err, hash) {
      if(err) return next(err)

      user.password = hash
      next()
    })
  })
})
userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if(err) return cb(err)

    cb(null, isMatch)
  })
}
var User = mongoose.model('User', userSchema)

/////////////////////////////////////////////////////////////////////
//the app
/////////////////////////////////////////////////////////////////////
var app = express();

app.locals.api_key = cloudinary.config().api_key;
app.locals.cloud_name = cloudinary.config().cloud_name;

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
  .use(express.cookieParser())
  .use(express.bodyParser())
  .use(express.session({ secret: 'wut am i doing' }))
  .use(passport.initialize())
  .use(passport.session())

/////////////////////////////////////////////////////////////////////
//authentication
/////////////////////////////////////////////////////////////////////
passport.use(new LocalStrategy(function (username, password, done) {
  var f = ff(function () {
    User.findOne({username: username}, f.slot())
  }, function (user) {
    if(!user) return done(null, false)

    user.comparePassword(password, function (err, isMatch) {
      if(err) return done(err)

      if(isMatch) return done(null, user)
      else return done(null, false)
    })
  })
}))


passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    if(user) done(null, user)
    else done('no user')
  });
});

var ensureLoggedIn = function (req, res, next) {
  if(!req.isAuthenticated()) res.redirect('/login')
  else next()
}

/////////////////////////////////////////////////////////////////////
//routes
/////////////////////////////////////////////////////////////////////
app.get('/', function(request, response) {
  response.render('index')
});

app.get('/login', function (req, res) {
  res.render('login', {
    title: 'Log In'
  })
})
app.post('/login', passport.authenticate('local', { successReturnToOrRedirect: '/admin', failureRedirect: '/login' }));

app.get('/admin', ensureLoggedIn, function(req, res){
  cloudinary.api.resources(function(items){
    var f = ff(function () {
      Picture.find().exec(f.slot())
    }, function(pictures){
      res.render('admin', { 
          images: items.resources
        , cloudinary: cloudinary
        , pictures: pictures
      })
    })
  })
})

app.post('/newPicture', ensureLoggedIn, function (req, res) {
  var f = ff(function () {
    Collection.findOne({ name: req.body.collectionName }).exec(f.slot())
    new Picture({
        url: req.body.pictureUrl
      , description: req.body.description
    }).save(f.slot())
  }, function (collection, picture) {
    if(collection) {
      collection.pictures.push(picture)
      collection.save(f.slot())
    }
  }, function () {
    res.redirect('/admin')
  })
})

///////////////////////////////////////////////////////////////////
//the server
///////////////////////////////////////////////////////////////////
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});