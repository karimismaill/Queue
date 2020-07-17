


  var firebaseConfig = {
    apiKey: "AIzaSyBJ-iH-4Ur9IYcwXgobnTJGo_13gqXqLho",
    authDomain: "queue-karim.firebaseapp.com",
    databaseURL: "https://queue-karim.firebaseio.com",
    projectId: "queue-karim",
    storageBucket: "queue-karim.appspot.com",
    messagingSenderId: "328339795968",
    appId: "1:328339795968:web:3beed401dad4ebcc86e8e5",
    measurementId: "G-BWJNPZRZFC"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  var firestore = firebase.firestore();
  var loader = document.getElementById("loader");
  loader.style.display = "none";
  emailInput = document.getElementById("email");
  passwordInput = document.getElementById("password");

  //var emailField = document.getElementById("email");
  //var passwordField = document.getElementById("password");
  const auth = firebase.auth();


  passwordInput.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      //event.preventDefault();
      // Trigger the button element with a click
      document.getElementById("login").click();
      //$('#login')[0].click();
      //console.log("enter clicked!!!");
    }
  });

emailInput.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    //event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("login").click();
    //$('#login')[0].click();
    //console.log("enter clicked!!!");
  }
});


  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      window.location.href = "home.html";
    } else {
      console.log("LOGGED OUT");
      //window.location.href = "login.html";
    }
  });


  function login(){
    if(document.getElementById("email").value.length == 0 || document.getElementById("password").value.length == 0)
    {
      window.alert("Please enter a valid username and password");
    }
    else{
      loader.style.display = "block";
      var email = document.getElementById("email").value;
      var password = document.getElementById("password").value;

      auth.signInWithEmailAndPassword(email, password).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log("Error during login" + error);
      });
    }
  }
