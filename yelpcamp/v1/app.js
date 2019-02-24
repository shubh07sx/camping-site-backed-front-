var express=require("express");
var app=express();
var bodyparser=require("body-parser");
var mongoose=require("mongoose");
var passport= require("passport");
var LocalStrategy= require("passport-local");
var methodOverride= require("method-override");
var Campground=require("./models/campgrounds.js");
var Comment   = require("./models/comments.js");
var User      = require("./models/user");
var seedDB=require("./seeds.js");
// we are using the seeds file which removes all the campgrounds first 
//seedDB(); // seed the database 
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyparser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
console.log(__dirname);
//PASSPORT CONFIGURATION 
app.use(require("express-session")({
    secret: "hello there i am shubh",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
//here we are using the built in functions which comes with passport local mongoose package 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    next();
});

app.get("/",function(req,res){
    res.render("landing");
    console.log(req.user);
});
app.get("/campgrounds",function(req,res){
    // now we retrieve the data from the database instead of using the array 
    Campground.find({},function(err,allcampgrounds){
        if(err){
            console.log("oh snap! error");
            console.log(err);
        }
        else{
           res.render("campgrounds/index",{campgrounds: allcampgrounds, currentUser: req.user});
        }
    });
    
});
app.post("/campgrounds",function(req,res){
    //we need to take the info from the form when the user submits and add it to the campgrounds array
    var name=req.body.name;
    var image=req.body.image;
    var desc=req.body.description;
    var author= {    
        id: req.user._id,
        username: req.user.username
    };
    var newcampgrounds={name: name , image: image, description: desc , author: author};
    //now we need to create the campground 
    Campground.create(newcampgrounds,function(err,newlycreated){
        if(err){
            console.log(err);
        }
        else{
            //now redirect the page to campgrounds 
             res.redirect("/campgrounds");
        }
    });
    
});
app.get("/campgrounds/new",isLoggedIn,function(req,res){
    res.render("campgrounds/new");
});
// THIS URL WILL COME AFTER THE FORM URL OTHERWISE IT WILL TREAT THE /campgrounds/new as the info page about some image 
app.get("/campgrounds/:id",isLoggedIn,function(req,res){
    //find the campground with the unique id 
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundcampground){
       if(err){
           console.log(err);
       } 
       else{
           //show if comment is included 
           console.log(foundcampground);
           //render the show the page
           res.render("campgrounds/show",{campground: foundcampground});
       }
    });
});
//===================
// COMMENT ROUTES 
//===================
app.get("/campgrounds/:id/comments/new",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
        }
        else{
            
            res.render("comments/new",{campground:campground});
        }
    });
});
app.post("/campgrounds/:id/comments",isLoggedIn,function(req,res){
    // first we will find a specific campground by id 
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            res.rdirect('/campgrounds/');
            
        }
        else{
            // then we need to create the comment 
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    console.log(err);
                }
                else{
                // we now need to replace the name of the user which is logged in 
                comment.author.id=req.user._id;
                comment.author.username= req.user.username;
                //then save it 
                comment.save();
                // then we will save the the specific comment to the specific campgrounds and push it into the comments array
                campground.comments.push(comment);
                //save the campgrounds again 
                campground.save();
                // then we need to redirect to the the comments page for the specific campground 
                res.redirect('/campgrounds/' + req.params.id);
                }
            });
        }
    });
});
//=====================
//AUTHENTICATION ROUTES
//=====================
//REGISTER ROUTE 
app.get("/register",function(req,res){
    res.render("register");
});
app.post("/register",function(req,res){
    //we are using user.register built in function which will create a new user which requires the user name 
    //username is given by req.body.username, password and then if everything is correct then it will authenticate the user 
    //using passport.authenticate which is a built in function which comes from passport local mongoose 
    //here first the user is registered with a unique username then authentication is performed
    User.register(new User({username: req.body.username}), req.body.password, function(err,user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/campgrounds")
        });
    });
});
//LOGIN ROUTE 
app.get("/login",function(req,res){
   res.render("login"); 
});
//login logic we have to write the middleware
//middleware which authenticates the user which preassumes the user has already registered 
app.post("/login",passport.authenticate("local",{
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}),function(req,res){
});
//LOGOUT ROUTE
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/campgrounds");
});
//EDIT ROUTE
app.get("/campgrounds/:id/edit",function(req,res){
    Campground.findById(req.params.id,function(err,foundcampground){
       if(err){
           res.redirect("/campgrounds");
       } 
       else{
            res.render("campgrounds/edit",{campground: foundcampground});
        }
    });
});
//UPDATE ROUTE
app.put("/campgrounds/:id",function(req,res){
   Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground){
      if(err){
          res.redirect("/campgrounds");
      } 
      else{
          res.redirect("/campgrounds/"+ req.params.id);
      }
   }); 
});
//DELETE ROUTE 
app.delete("/campgrounds/:id",function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/campgrounds");
        }
        else
        {
            res.redirect("/campgrounds");
        }
    });
});
//middleware so that the user can only add the comment only if he/she is logged in 
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
app.listen(process.env.PORT,process.env.IP,function(){
   console.log("The YelpCamp Server has Started!"); 
});