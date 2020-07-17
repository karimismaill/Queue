
// Your web app's Firebase configuration
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
const auth = firebase.auth();
var zatoona = document.getElementById('zatoona');
var dateTag = document.getElementById('date');
var timeTag = document.getElementById('time');
var elapsedHourTag = document.getElementById('elapsed-hours');
var elapsedMinuteTag = document.getElementById('elapsed-minutes');
var elapsedSecondTag = document.getElementById('elapsed-seconds');
var serviceTag = document.getElementById('service');
var analyticsProcessedText = document.getElementById('processed-green-text');
var analyticsWaitingText = document.getElementById('pending-orange-text');
var analyticsLateText = document.getElementById('late-red-text');
var globalUser;
var i = 1;
$("#center-console").hide();
$("#old-btn").hide();
$("#elapsed-section").hide();
console.log(new Date().getTime());
//setTimeout(function(){ console.log(new Date().getTime()); }, 3000);





// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawChart);

// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart() {

  // Create the data table.
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Topping');
  data.addColumn('number', 'Slices');
  data.addRows([
    ['< 5 minutes', 2],
    ['6 -15 minutes', 3],
    ['16-25 minutes', 1],
    ['> 25 minutes', 1],
  ]);

  // Set chart options
  var options = {'title':'Fulfillment time of tickets',
                 'width':1000,
                 //pieHole: 0.4,
                 is3D: true,
                 'height':500};

  // Instantiate and draw our chart, passing in some options.
  var chart1 = new google.visualization.PieChart(document.getElementById('chart_div1'));
  var chart2 = new google.visualization.BarChart(document.getElementById('chart_div2'));
  //var chart3 = new google.visualization.PieChart(document.getElementById('chart_div3'));
  chart1.draw(data, options);
  chart2.draw(data, options);
  //chart3.draw(data, options);
}








updateLiveQueue = function(user, selected){


  firestore.collection("/Users").where("uid", "==", user.uid).get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        firestore.collection("/Organizations/" + doc.data().org + "/Branches/" + doc.data().branch +"/Services/" + selected + "/Queue").onSnapshot(function(collection){
          firestore.collection("/Organizations/" + doc.data().org + "/Branches/" + doc.data().branch +"/Services/" + selected + "/Queue").get().then(res  =>  {
            if(res.size == 0)
            {
              $("#live-queue-container").append($(
                '<h3 class="no-tickets" style"text-align: center;">No Upcoming Tickets</h3>'
              ))
            }
            firestore.collection("/Organizations/" + doc.data().org + "/Branches/" + doc.data().branch + "/Services/" + selected + "/Queue").where("status", "==", "waiting").orderBy("timestamp").get().then(function(querySnapshot) {
                        $('.one-ticket').remove();
                        querySnapshot.forEach(function(doc) {
                          var ts = doc.data().timestamp;
                          var ts_ms = doc.data().timestamp*1;
                          var date_ob = new Date(ts_ms);
                          var hours = ("0" + date_ob.getHours()).slice(-2);
                          var minutes = ("0" + date_ob.getMinutes()).slice(-2);
                        //$('.no-tickets').remove();
                        $("#live-queue-container").append($(
                          '<div class="one-ticket">' +
                            '<h3 id="number" class="ticket-info-text">' + doc.data().number + '</h3>' +
                            '<h3 id="arrival" class="ticket-info-text">'+
                            hours + ":" + minutes +
                            '</h3>'+
                            //'<h3 id="elapsedTime" class="ticket-info-text">00:21:32</h3>' +
                          '</div>'
                        ))
                  });
              })
          });
        });


      });
  });




}

//updateLiveQueue();

getUserDetails = function(user){
  var obj;
  return firestore.collection("/Users").where("uid", "==", user.uid).get();
}

getServices = function(user){

  firestore.collection("/Users").where("uid", "==", user.uid).get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {

        firestore.collection("/Organizations/" + doc.data().org + "/Branches/" + doc.data().branch + "/Services").get().then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                    $("#services-dropdown").append($('<option id="'+"option"+window.i+'">' + doc.id + "</option>"));
              });
          })
      });
  });
}

callNext = function(user){
  user = firebase.auth().currentUser;
  var currentTicketNumber;
  firestore.collection("/Users").where("uid", "==", user.uid).get().then(function(querySnapshot){
    querySnapshot.forEach(function(doc){
      var org = doc.data().org;
      var branch = doc.data().branch;
      //set current ticket to complete
      firestore.collection("/Organizations/" + doc.data().org + "/Branches/" + doc.data().branch +"/Services/" + $( "#services-dropdown option:selected").text() + "/Queue").where("status", "==", "serving").orderBy("timestamp").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          firestore.collection("/Organizations/" + org + "/Branches/" + branch +"/Services/" + $( "#services-dropdown option:selected").text() + "/Queue").doc(doc.id).set({
            number: doc.data().number,
            service: doc.data().service,
            timestamp: doc.data().timestamp,
            id: doc.id,
            startTimestamp: doc.data().startTimestamp,
            closedTimestamp: new Date().getTime(),
            status: "complete"
          })
          .then(function() {
            console.log("Document successfully written!");
          })
          .catch(function(error) {
            console.error("Error writing document: ", error);
          });
        });
      })

      //set next ticket to serving
      firestore.collection("/Organizations/" + doc.data().org + "/Branches/" + doc.data().branch +"/Services/" + $( "#services-dropdown option:selected").text() + "/Queue").where("status", "==", "waiting").orderBy("timestamp").limit(1).get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          firestore.collection("/Organizations/" + org + "/Branches/" + branch +"/Services/" + $( "#services-dropdown option:selected").text() + "/Queue").doc(doc.id).set({
            number: doc.data().number,
            service: doc.data().service,
            timestamp: doc.data().timestamp,
            id: doc.id,
            startTimestamp: new Date().getTime(),
            status: "serving"
          })
          .then(function() {
            console.log("Document successfully written!");
          })
          .catch(function(error) {
            console.error("Error writing document: ", error);
          });
        });
      })
    });
  })
}

fillFieldsBasedOnLoggedInUser = function(user, selected){

  console.log("USER ID IS " + user.uid);
  firestore.collection("/Users").where("uid", "==", user.uid).get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
          $("#name-tag").html("Welcome, " + doc.data().name);
          if(doc.data().org == "HSBC"){
            $("#organization-logo").attr("src","images/hsbc.png")
            $('body').css({
                background: "linear-gradient(to right, #c31432, #240b36)"
            });
          }
          else if(doc.data().org == "Emirates NBD"){
            $("#organization-logo").attr("src","images/nbdLogo.png")
            $('body').css({
                //background: "linear-gradient(to bottom, #3594DD, #4563DB, #5036D5, #5B16A9)"
                //background: "linear-gradient(to bottom, #3594DD, #4563DB)"
                //background: "linear-gradient(to right, #373B44, #4286f4)"
                background: "linear-gradient(to right, #1488CC, #2B32B2)"

            });
          }
          if($( "#services-dropdown option:selected").text() == "--Select Service--"){
            $("#center-console").hide();
          }
          else{
            $("#center-console").show();
            var size;
            firestore.collection("/Organizations/" + doc.data().org + "/Branches/" + doc.data().branch +"/Services/" + selected + "/Queue").onSnapshot(function(collection){
              firestore.collection("/Organizations/" + doc.data().org + "/Branches/" + doc.data().branch +"/Services/" + selected + "/Queue").get().then(res  =>  {
                if(res.size == 0){
                  zatoona.innerText = "Empty";
                  $("#service").hide();
                  $(".queue-details").hide();
                  $("#loadButton").hide();
                }
                else{
                  $("#service").show();
                  $(".queue-details").show();
                  $("#loadButton").show();
                  firestore.collection("/Organizations/" + doc.data().org + "/Branches/" + doc.data().branch +"/Services/" + selected + "/Queue").where("status", "==", "serving").get().then(function(querySnapshot) {
                      querySnapshot.forEach(function(doc) {
                        console.log("TICKETT" + doc.data().number);
                          zatoona.innerText = doc.data().number;
                          serviceTag.innerText = selected;

                          //TIMESTAP CODE --------------------------------------------------------------------
                          var ts = doc.data().timestamp;
                          // convert unix timestamp to milliseconds
                          var ts_ms = doc.data().timestamp*1;
                          // initialize new Date object
                          var date_ob = new Date(ts_ms);
                          // year as 4 digits (YYYY)
                          var year = date_ob.getFullYear();
                          // month as 2 digits (MM)
                          var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                          // date as 2 digits (DD)
                          var date = ("0" + date_ob.getDate()).slice(-2);
                          // hours as 2 digits (hh)
                          var hours = ("0" + date_ob.getHours()).slice(-2);
                          // minutes as 2 digits (mm)
                          var minutes = ("0" + date_ob.getMinutes()).slice(-2);
                          // seconds as 2 digits (ss)
                          var seconds = ("0" + date_ob.getSeconds()).slice(-2);
                          //TIMESTAP CODE --------------------------------------------------------------------

                          dateTag.innerText = year + "-" + month + "-" + date;
                          timeTag.innerText = hours + ":" + minutes;
                          setElapsed(doc.data().timestamp);
                          console.log("DATABASE TIME = " + doc.data().timestamp);
                      });
                  })
                }
              });

              //POPULATE ANALYTICS - PROCESSED TODAY
              firestore.collection("/Organizations/" + doc.data().org + "/Branches/" + doc.data().branch +"/Services/" + selected + "/Queue").where("status", "==", "complete").get().then(res  =>  {
                analyticsProcessedText.innerText = res.size;
              });

              //POPULATE ANALYTICS - WAITING IN QUEUE
              firestore.collection("/Organizations/" + doc.data().org + "/Branches/" + doc.data().branch +"/Services/" + selected + "/Queue").where("status", "==", "waiting").get().then(res  =>  {
                analyticsWaitingText.innerText = res.size;
              });


              firestore.collection("/Organizations/" + doc.data().org + "/Branches/" + doc.data().branch +"/Services/" + $( "#services-dropdown option:selected").text() + "/Queue").where("status", "==", "complete").get().then(function(querySnapshot) {
                var count = 0;
                querySnapshot.forEach(function(doc) {

                  var delta = (parseInt(doc.data().closedTimestamp, 10) - parseInt(doc.data().startTimestamp, 10))/60/1000;
                  if(delta > 3){
                    count++;
                  }
                  //console.log("DURATION = " + (doc.data().closedTimestamp - doc.data().startTimestamp)/60/1000);
                });
                analyticsLateText.innerText = count;
              })

            })
          }
      });
    });
}

setElapsed = function(stamp){
  setInterval(function() {
      var delta = Date.now() - stamp; // milliseconds elapsed since start
      elapsedMinuteTag.innerText= (Math.floor(delta / 1000/60 %60)); // in seconds
      elapsedHourTag.innerText= Math.floor(delta/1000/3600); // in seconds
      elapsedSecondTag.innerText = (Math.floor(delta / 1000))-(Math.floor(delta / 1000/60))*60;
  }, 1000);
  setInterval(1000);
}

firebase.auth().onAuthStateChanged(function(user) {
  var obj;
  if (user) {
    //console.log(getUserDetails(user));
    getUserDetails(user).then(function(querySnapshot){
      querySnapshot.forEach(function(doc){
      });
    })
    getServices(user);
    fillFieldsBasedOnLoggedInUser(user, $( "#services-dropdown option:selected" ).text());
  } else {
    console.log("LOGGED OUT");
    window.location.href = "index.html";
  }
});

logout = function(){
  swalWithBootstrapButtons.fire({
    title: 'Are you sure you want to sign out?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sign out',
    cancelButtonText: 'Cancel',
    reverseButtons: true
  }).then((result) => {
    if (result.value) {
      auth.signOut();
    }
  })
}

getRealtimeUpdates = function(selected){

  var size;
  firestore.collection("/Organizations/Emirates NBD/Branches/MOE/Services/" + selected + "/Queue").onSnapshot(function(collection){

    firestore.collection("/Organizations/Emirates NBD/Branches/MOE/Services/" + selected + "/Queue").get().then(res  =>  {
      if(res.size == 0){
        zatoona.innerText = "Empty";
      }
      else{
        firestore.collection("/Organizations/Emirates NBD/Branches/MOE/Services/" + selected + "/Queue").where("status", "==", "serving").get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                zatoona.innerText = doc.data().number;
                serviceTag.innerText = selected;

                //TIMESTAP CODE --------------------------------------------------------------------
                var ts = doc.data().timestamp;
                // convert unix timestamp to milliseconds
                var ts_ms = doc.data().timestamp*1;
                // initialize new Date object
                var date_ob = new Date(ts_ms);
                // year as 4 digits (YYYY)
                var year = date_ob.getFullYear();
                // month as 2 digits (MM)
                var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                // date as 2 digits (DD)
                var date = ("0" + date_ob.getDate()).slice(-2);
                // hours as 2 digits (hh)
                var hours = ("0" + date_ob.getHours()).slice(-2);
                // minutes as 2 digits (mm)
                var minutes = ("0" + date_ob.getMinutes()).slice(-2);
                // seconds as 2 digits (ss)
                var seconds = ("0" + date_ob.getSeconds()).slice(-2);
                //TIMESTAP CODE --------------------------------------------------------------------

                dateTag.innerText = year + "-" + month + "-" + date;
                timeTag.innerText = hours + ":" + minutes;
                setElapsed(doc.data().timestamp);
                console.log("DATABASE TIME = " + doc.data().timestamp);
            });
        })
      }
    });
  })
}


populateAnalytics = function(){

}


//getRealtimeUpdates($( "#services-dropdown option:selected" ).text());

jQuery(document).ready(function(){
  $("#services-dropdown").change(function() {
    fillFieldsBasedOnLoggedInUser(firebase.auth().currentUser, $( "#services-dropdown option:selected").text());
    $('.one-ticket').remove();
    updateLiveQueue(firebase.auth().currentUser, $( "#services-dropdown option:selected").text());
  });
});

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-danger',
    cancelButton: 'cancel-btn btn btn-secondary'
  },
  buttonsStyling: false
})


//THIS IS HOW YOU RETREIVE FROM FIRESTORE WITH A BUTTON CLICK
  /*loadButton.addEventListener("click", function(){
    docRef.get().then(function(doc){
    if(doc && doc.exists){
      const myData = doc.data();
      zatoona.innerText = myData.Current;
      //alert(myData.Current);
    }
  })
})*/

//THIS IS HOW YOU RETREIVE FROM FIRESTORE LIVE!!!
/*getRealtimeUpdates = function(){
  docRef.onSnapshot(function(doc){
    if(doc && doc.exists){
      //const myData = doc.data();
      //zatoona.innerText = myData.number;
    myData = doc.where("status", "==", "waiting").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
        });
    })
      //const myData = doc.where("status", "==", "waiting");
      zatoona.innerText = myData.number;
    }
  })
}*/
