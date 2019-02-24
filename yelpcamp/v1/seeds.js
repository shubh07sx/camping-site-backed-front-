var mongoose = require("mongoose");
var Campground= require("./models/campgrounds.js");
var Comment= require("./models/comments.js");
var data = [
        {
            name: "RISING SUN ",
            image: "https://images.unsplash.com/photo-1526064965790-830f5207ab7e?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=f1ac21abf5aec26a012bb7c25a754796&auto=format&fit=crop&w=500&q=60",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            name: "LAKY LAKE",
            image: "https://images.unsplash.com/photo-1473713984581-b8918cc3652e?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d0b711da885120b59a94bce6d3163d35&auto=format&fit=crop&w=500&q=60",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."


        },
        {
            name: "SNOWY DREADS",
            image: "https://images.unsplash.com/photo-1515744770672-01ed446cc7b2?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d654e85f8a312b267794f2163bca29e1&auto=format&fit=crop&w=500&q=60",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."


        }
];
function seedDB(){
// Remove all the campgrounds 
Campground.remove({},function(err){
   if(err){
   console.log(err);
    }
    console.log("removed campgrounds");
     //we need to loop through the data made above and then create the campgrounds
        data.forEach(function(seed){
            Campground.create(seed,function(err,campground){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("added a campground");
                    // create a comment 
                    Comment.create(
                        {
                         text: "A good place for adventure  but i wish there was internet.:)(",
                         author: "shubh"
                        },function(err, comment){
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    campground.comments.push(comment);
                                    campground.save();
                                    console.log("added a new comment");
                                }
                        });
                }
            });
        });
    
});
}

module.exports=seedDB;