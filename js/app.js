'use strict';

var blogApp = angular.module('blogApp', [
    'ngRoute'
]);

blogApp.config(function($routeProvider, $locationProvider) {

    $routeProvider.
        when('/', {
            templateUrl: 'partials/blog.html',
            controller: 'indexCtrl'
        }).
        when('/blog/:postId', {
            templateUrl: 'partials/post.html',
            controller: 'blogPostCtrl'
        }).
        otherwise({
            redirectTo: '/'
        });
});



//Controller
blogApp.controller('appCtrl', function($scope, $routeParams, blogService) {



    $scope.currentYear = new Date().getFullYear();

});

blogApp.controller('indexCtrl', function($scope, $routeParams, blogService) {

    $scope.loading = true; //show loading spinner until not loading

    //init
    $scope.index = []; //array that will contain the location of all the files we need
    $scope.posts = []; //array that will be filled by the blogService


    $scope.blogOrderOption = "order";

    // retrieve the data from the service
    function getData() {
        blogService.getIndexData().then(
            function(data) {
                $scope.index = data;

                // Now we have the list of files
                // We can retrieve each file and add it to $scope.data
                for(var i = 0; i < $scope.index.posts.length; i++){ //for each item in the index
                    blogService.getData($scope.index.posts[i]).then( //call the getData service
                        function(data){

                            $scope.posts.push({
                                "title" : data.title,
                                "dateCreated" : data.date,
                                "name" : data.name,
                                "author" : data.author,
                                "content" : data.content,
                                "tags" : data.tags,
                                "blurb" : data.blurb,
                                "order" : data.order
                            });

                        },
                        function(err){
                            console.log("error getting file with id: " + i);
                        }
                    )
                }

                $scope.loading = false; //we have finished loading

            },
            function() {
                console.log("error getting index file");
                $scope.loading = false; //we have finished loading
            });
    }


    getData();

    $scope.postContent = function(content, blurb){
        if(blurb){ // Display the blurb if there is one
            return blurb;
        }
        else{ // otherwise, display the full content
            return content;
        }
    };

    $scope.setColor = function(id){
        return "blog-container__header--" + id;
    }
});

blogApp.controller('blogPostCtrl', function($scope, $routeParams, blogService) {

    $scope.loading = true; //show loading spinner until not loading

    $scope.currentPost = "";

    $scope.postId = $routeParams.postId;



    function getCurrentPost() {

        var post = $routeParams.postId;


        blogService.getData(post).then( //call the getData service
            function (data) {
                $scope.currentPost = data;
                $scope.loading = false; //we have finished loading
            },
            function (err) {
                console.log("error getting file with id: " + post);
                $scope.loading = false; //we have finished loading
            }
        )
    }

    getCurrentPost();

    $scope.setColor = function(id){
        return "blog-container__header--" + id;
    }
});


//Service
blogApp.factory('blogService', function($http, $q) {
    return {
        /**
         * Gets the index.json file that contains the location of each post's JSON file
         * @returns {*} contents of index.json
         */
        getIndexData: function() {
            var deferred = $q.defer();
            $http.get('data/index.json')
                .success(function(data) {
                    deferred.resolve(data);
                }).error(function(msg, code) {
                    deferred.reject(msg);
                    console.log("error: " + msg);
                });
            return deferred.promise;
        },

        /**
         * Returns the JSON for a specified id
         * @param id name of the file, including .json file extension
         * @returns {*} contents of the requested JSON file
         */
        getData: function(id) {

            if(id){
                var deferred = $q.defer();
                $http.get('data/' + id + '/blog.json')
                    .success(function(data) {
                        deferred.resolve(data);
                    }).error(function(msg, code) {
                        deferred.reject(msg);
                        console.log("error: " + msg);
                    });
                return deferred.promise;
            }

        }
    }
});
