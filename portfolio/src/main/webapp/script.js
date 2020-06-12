// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var max;
var sort;
var filter;
var email;
var userComment;
var admin;
var own = [];

function getComment(fromApply) {
  if(fromApply === true || max == null) {
    max = document.getElementById('commNum').value;
    sort = document.getElementById('sort').value;
    filter = document.getElementById('filter').value;
  }
  fetch('/get-comment?commNum=' + max + '&sort=' + sort + '&filter=' + filter).then(response => response.json()).then((comnts) => {
    const commentList = document.getElementById('comments');
    commentList.innerHTML = '';
    // add all of the comments to the comment container
    comnts.forEach((comm) => {
      userComment = false;
      if (comm.email == email) {
        userComment = true;
      }
      if (email == "mariamaynard@google.com") {
        admin = true;
      }
      commentList.appendChild(createCommentElement(comm));
    })
  });
}

// method that gets the comment that the user wants to post and adds it to the page
function postComment(e) {
  e.preventDefault();
  var comment = document.getElementById('comment').value;
  var name = document.getElementById("name").value;
  // make the post request with the comment as a parameter
  const requestPost = new Request('/get-comment?comment=' + comment + '&name=' + name, {method: 'POST'});
  fetch(requestPost).then(response => response.text()).then(text => {
    document.getElementById('myForm').reset();
    if(text != ""){
      getComment();
    }
  });
}

// method that updates the max number of comments that show up on the page
function applyOptions(e) {
  e.preventDefault();
  getComment(true);
}

//method that updates the sort method of the comments

// deletes all the comments from the page
function deleteCom() {
  // send the post request to delete
  const params = new URLSearchParams();
  params.append('id', 0);
  const requestPost = new Request('/delete-comment', {method: 'POST', body: params});
  fetch(requestPost).then(response => response.text()).then(text => {
    if(text != ""){
      getComment();
    }
  });
}

//makes the comment element with the name of the user, and  their comment
function createCommentElement(comment) {
  const comElem = document.createElement('div');
  comElem.className = 'comment';
  // give the name a header format
  const nameElem = document.createElement('h4');
  nameElem.id = 'name';
  nameElem.innerText = comment.name;
  // add in their comment
  const commTextElem = document.createElement('p');
  commTextElem.innerText = comment.text;
  const emojiLabel = document.createElement('label');
  emojiLabel.innerText = "Feeling";
  emojiLabel.for = "emoji";
  const emoji = sentimentEmoji(comment.score);
  emoji.id = "emoji";
  const dateElem = document.createElement('h5');
  dateElem.innerText = comment.date;
  // make the delete button
  if(userComment || admin){
    const deleteButtonElement = document.createElement('button');
    deleteButtonElement.className = "trash";
    const deleteIcon = document.createElement('i');
    deleteIcon.className = "fas fa-trash-alt";
    deleteButtonElement.addEventListener('click', () => {
      deleteComment(comment);
      // Remove the task from the DOM.
      comElem.remove();
    });
    deleteButtonElement.appendChild(deleteIcon);
    nameElem.appendChild(deleteButtonElement);
  }
  comElem.appendChild(nameElem);
  comElem.appendChild(dateElem);
  comElem.appendChild(emojiLabel);
  comElem.appendChild(emoji);
  comElem.appendChild(commTextElem);
  return comElem;
}

/** Tells the server to delete the task. */
function deleteComment(comment) {
  const params = new URLSearchParams();
  params.append('id', comment.id);
  fetch('/delete-comment', {method: 'POST', body: params});
}

// when the pageloads, checks if the person is logged in and loads the comments
function load(){
  fetch('/login').then(response => response.json()).then((loginInfo) => {
    email = loginInfo.email;
    if(loginInfo.loggedIn === '1'){
      document.getElementById('commSec').style.display = 'block';
      document.getElementById('loginSec').style.display = 'none';
      getUserLoggedIn(loginInfo);
      if(email == "mariamaynard@google.com") {
        document.getElementById('deleteSec').style.display = "block";
      }
    } else {
      document.getElementById('commSec').style.display = 'none';
      document.getElementById('loginSec').style.display = 'block';
      askLogIn(loginInfo);
    }
  });
  getComment();
}

// get and display the information when a user is logged in
function getUserLoggedIn(loginInfo) {
  const userInfo = document.getElementById('userInfo');
  const userEmail = document.createElement('label');
  userEmail.for = 'loginButton';
  userEmail.innerHTML = "Logged in as " + loginInfo.email;
  const logout = document.createElement('a');
  logout.innerHTML = 'Logout';
  logout.className = 'loginButton';
  logout.id = 'logout';
  logout.href = loginInfo.url;
  userInfo.appendChild(userEmail);
  const lineBreak = document.createElement('br');
  userInfo.appendChild(logout);
  userInfo.appendChild(lineBreak);
  userInfo.appendChild(lineBreak);
}

// ask the user to login so they can post a comment
function askLogIn(loginInfo) {
  const loginSection = document.getElementById('loginSec');
  const login = document.createElement('a');
  login.innerHTML = 'Login';
  login.className = 'loginButton';
  login.href = loginInfo.url;
  const lineBreak = document.createElement('br');
  loginSection.appendChild(lineBreak);
  loginSection.appendChild(lineBreak);
  loginSection.appendChild(login);
}

/* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
function responsive() {
  var x = document.getElementById("mynavbar");
  if (x.className === "navbar") {
    x.className += " responsive";
  } else {
    x.className = "navbar";
  }
}

// pick the emoji that works with the sentiment score
function sentimentEmoji(score){
  if(score < 0.2 && score > -0.2){
    var emoji;
    // score betweeb -0.2 and 0.2
    emoji = document.createElement('i');
    emoji.className = "far fa-meh";
  } else if(score > 0.6) {
    // score greater than 0.6
    emoji = document.createElement('i');
    emoji.className = "far fa-laugh-beam";
  } else if(score > 0.2) {
    // score is between 0.2 and 0.6
    emoji = document.createElement('i');
    emoji.className = "far fa-smile-beam";
  } else if(score < -0.6) {
    // score less that -0.6
    emoji = document.createElement('i');
    emoji.className = "far fa-angry";
  } else {
    // the score is between -0.6 and -0.2
    emoji = document.createElement('i');
    emoji.className = "far fa-frown-open";
  }
  return emoji;
}

/** Creates a map and adds it to the page. */
function createMap() {
  var pushpin = 'http://maps.google.com/mapfiles/kml/pushpin/wht-pushpin.png';
  const map = new google.maps.Map(
    document.getElementById('map'),
    {center: {lat: 30.349544, lng: -97.717009}, zoom: 10.5,
      styles: [
        {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{color: '#263c3f'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{color: '#6b9a76'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{color: '#38414e'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{color: '#212a37'}]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{color: '#9ca5b3'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{color: '#746855'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{color: '#1f2835'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{color: '#f3d19c'}]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{color: '#2f3948'}]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{color: '#17263c'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{color: '#515c6d'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{color: '#17263c'}]
        }
      ]}
    );
  var mobile = false;
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    mobile = true;
  }
  console.log(mobile);
  const wellsBranch = new google.maps.Marker({
    position: {lat: 30.444568, lng: -97.679799},
    map: map,
    // title: 'Wells Branch',
    icon: pushpin,
  });

  const utTower = new google.maps.Marker({
    position: {lat: 30.286080, lng: -97.739346},
    map: map,
    // title: 'The University of Texas at Austin',
    icon: pushpin
  });

  const mcneil = new google.maps.Marker({
    position: {lat: 30.449402, lng: -97.733259},
    map: map,
    // title: 'McNeil High School',
    icon: pushpin
  });

  const pedernales = new google.maps.Marker({
    position: {lat: 30.308199, lng: -98.257773},
    map: map,
    // title: 'Pedernales Falls',
    icon: pushpin
  });

  const prfd = new google.maps.Marker({
    position: {lat: 30.260400, lng: -97.704324},
    map: map,
    // title: 'Puerto Rican Cultural Center',
    icon: pushpin
  });

  const mckinney = new google.maps.Marker({
    position: {lat: 30.1836, lng: -97.7222},
    map: map,
    // title: 'McKinney Falls',
    icon: pushpin
  });
  
  const rowingDock = new google.maps.Marker({
    position: {lat: 30.274764, lng: -97.774275},
    map: map,
    // title: 'The Rowing Dock',
    icon: pushpin
  });

  const mozarts = new google.maps.Marker({
    position: {lat: 30.295456, lng: -97.784190},
    map: map,
    // title: "Mozart's Cafe",
    icon: pushpin
  });

  const bonnell = new google.maps.Marker({
    position: {lat: 30.320766, lng: -97.773340},
    map: map,
    // title: "Mount Bonnell",
    icon: pushpin
  });

  const barton = new google.maps.Marker({
    position: {lat: 30.263999, lng: -97.770975},
    map: map,
    // title: "Barton Springs",
    icon: pushpin
  });

  const domain = new google.maps.Marker({
    position: {lat: 30.400604, lng: -97.725121},
    map: map,
    // title: "The Domain",
    icon: pushpin
  });

  const ladybirdWildflower = new google.maps.Marker({
    position: {lat: 30.185474, lng: -97.873261},
    map: map,
    // title: "Lady Bird Johnson Wildflower Center",
    icon: pushpin
  }); 

  if(!mobile) {
     var wbString = '<h3>Wells Branch</h3>'+
        "<p style = 'font-size: 12px'> I grew up here.</p>";

    var infowindowWB = new google.maps.InfoWindow({
      content: wbString
    });

    wellsBranch.addListener('mouseover', function() {
      infowindowWB.open(map, wellsBranch);
    });

    wellsBranch.addListener('mouseout', function() {
      timeoutID = setTimeout(function() {
        infowindowWB.close();
      }, 200);
    });

    var utString = '<h3>University of Texas</h3>'+
        "<p style = 'font-size: 12px'> Where I go to college.</p>";

    var infowindowUT = new google.maps.InfoWindow({
      content: utString
    });
    
    utTower.addListener('mouseover', function() {
      infowindowUT.open(map, utTower);
    });

    utTower.addListener('mouseout', function() {
      timeoutID = setTimeout(function() {
          infowindowUT.close();
      }, 200);
    });

    var mcneilString = '<h3>McNeil High School</h3>'+
        "<p style = 'font-size: 12px'>Where I went to high school.</p>";

    var infowindowMN = new google.maps.InfoWindow({
      content: mcneilString
    });
    
    mcneil.addListener('mouseover', function() {
      infowindowMN.open(map, mcneil);
    });

    mcneil.addListener('mouseout', function() {
      timeoutID = setTimeout(function() {
          infowindowMN.close();
      }, 200);
    });

    var pedString = '<h3>Pedernales Falls</h3>'+
        "<p style = 'font-size: 12px'>My favorite state park.</p>";

    var infowindowPF = new google.maps.InfoWindow({
      content: pedString
    });
    
    pedernales.addListener('mouseover', function() {
      infowindowPF.open(map, pedernales);
    });

    pedernales.addListener('mouseout', function() {
      timeoutID = setTimeout(function() {
          infowindowPF.close();
      }, 200);
    });

    var mfString = '<h3>McKinney Falls</h3>'+
        "<p style = 'font-size: 12px'>My favorite place to swim.</p>";

    var infowindowMK = new google.maps.InfoWindow({
      content: mfString
    });
    
    mckinney.addListener('mouseover', function() {
      infowindowMK.open(map, mckinney);
    });

    mckinney.addListener('mouseout', function() {
      timeoutID = setTimeout(function() {
          infowindowMK.close();
      }, 200);
    });

    var rdString = '<h3>The Rowing Dock</h3>'+
        "<p style = 'font-size: 12px'>Where I go paddle boarding.</p>";

    var infowindowRD = new google.maps.InfoWindow({
      content: rdString
    });
    
    rowingDock.addListener('mouseover', function() {
      infowindowRD.open(map, rowingDock);
    });

    rowingDock.addListener('mouseout', function() {
      timeoutID = setTimeout(function() {
          infowindowRD.close();
      }, 200);
    });

    var prString = '<h3>Puerto Rican Cultural Center</h3>'+
        "<p style = 'font-size: 12px'>My mom's cultural center.</p>";

    var infowindowPR = new google.maps.InfoWindow({
      content: prString
    });
    
    prfd.addListener('mouseover', function() {
      infowindowPR.open(map, prfd);
    });

    prfd.addListener('mouseout', function() {
      timeoutID = setTimeout(function() {
          infowindowPR.close();
      }, 200);
    });

    var mcString = "<h3>Mozart's Cafe</h3>"+
        "<p style = 'font-size: 12px'>My favorite coffe shop.</p>";

    var infowindowMC = new google.maps.InfoWindow({
      content: mcString
    });
    
    mozarts.addListener('mouseover', function() {
      infowindowMC.open(map, mozarts);
    });

    mozarts.addListener('mouseout', function() {
      timeoutID = setTimeout(function() {
          infowindowMC.close();
      }, 200);
    });

    var mbString = "<h3>Mount Bonnell</h3>"+
        "<p style = 'font-size: 12px'>A place I love to watch the sunset.</p>";

    var infowindowMB = new google.maps.InfoWindow({
      content: mbString
    });
    
    bonnell.addListener('mouseover', function() {
      infowindowMB.open(map, bonnell);
    });

    bonnell.addListener('mouseout', function() {
      timeoutID = setTimeout(function() {
          infowindowMB.close();
      }, 200);
    });

    var bsString = "<h3>Barton Springs</h3>"+
      "<p style = 'font-size: 12px'>A great swimming hole.</p>";

    var infowindowBS = new google.maps.InfoWindow({
      content: bsString
    });
    
    barton.addListener('mouseover', function() {
      infowindowBS.open(map, barton);
    });

    barton.addListener('mouseout', function() {
      timeoutID = setTimeout(function() {
          infowindowBS.close();
      }, 200);
    });

    var tdString = "<h3>The Domain</h3>"+
        "<p style = 'font-size: 12px'>My favorite place to go shopping.</p>";

    var infowindowDM = new google.maps.InfoWindow({
        content: tdString
    });
    
    domain.addListener('mouseover', function() {
      infowindowDM.open(map, domain);
    });

    domain.addListener('mouseout', function() {
      timeoutID = setTimeout(function() {
          infowindowDM.close();
      }, 200);
    });

    var lbString = "<h3>Lady Bird Johnson Wildflower Center</h3>"+
        "<p style = 'font-size: 12px'>A pretty place to see flowers.</p>";

    var infowindowLB = new google.maps.InfoWindow({
      content: lbString
    });
    
    ladybirdWildflower.addListener('mouseover', function() {
      infowindowLB.open(map, ladybirdWildflower);
    });

    ladybirdWildflower.addListener('mouseout', function() {
      timeoutID = setTimeout(function() {
          infowindowLB.close();
      }, 200);
    });
  } else {

    var wbString = '<h3>Wells Branch</h3>'+
        "<p style = 'font-size: 12px'> I grew up here.</p>";

    var infowindowWB = new google.maps.InfoWindow({
      content: wbString
    });
  
    wellsBranch.addListener('click', function() {
      infowindowWB.open(map, wellsBranch);
    });

    var utString = '<h3>University of Texas</h3>'+
        "<p style = 'font-size: 12px'> Where I go to college.</p>";

    var infowindowUT = new google.maps.InfoWindow({
          content: utString
      });
    
    utTower.addListener('click', function() {
      infowindowUT.open(map, utTower);
    });

    var mcneilString = '<h3>McNeil High School</h3>'+
        "<p style = 'font-size: 12px'>Where I went to high school.</p>";

    var infowindowMN = new google.maps.InfoWindow({
          content: mcneilString
      });
    
    mcneil.addListener('click', function() {
      infowindowMN.open(map, mcneil);
    });

    var pedString = '<h3>Pedernales Falls</h3>'+
        "<p style = 'font-size: 12px'>My favorite state park.</p>";

    var infowindowPF = new google.maps.InfoWindow({
          content: pedString
      });
    
    pedernales.addListener('click', function() {
      infowindowPF.open(map, pedernales);
    });

    var mfString = '<h3>McKinney Falls</h3>'+
        "<p style = 'font-size: 12px'>My favorite place to swim.</p>";

    var infowindowMK = new google.maps.InfoWindow({
          content: mfString
      });
    
    mckinney.addListener('click', function() {
      infowindowMK.open(map, mckinney);
    });

    var rdString = '<h3>The Rowing Dock</h3>'+
        "<p style = 'font-size: 12px'>Where I go paddle boarding.</p>";

    var infowindowRD = new google.maps.InfoWindow({
          content: rdString
      });
    
    rowingDock.addListener('click', function() {
      infowindowRD.open(map, rowingDock);
    });

    var prString = '<h3>Puerto Rican Cultural Center</h3>'+
        "<p style = 'font-size: 12px'>My mom's cultural center.</p>";

    var infowindowPR = new google.maps.InfoWindow({
          content: prString
      });
    
    prfd.addListener('click', function() {
      infowindowPR.open(map, prfd);
    });

    var mcString = "<h3>Mozart's Cafe</h3>"+
        "<p style = 'font-size: 12px'>My favorite coffe shop.</p>";

    var infowindowMC = new google.maps.InfoWindow({
          content: mcString
      });
    
    mozarts.addListener('click', function() {
      infowindowMC.open(map, mozarts);
    });

    var mbString = "<h3>Mount Bonnell</h3>"+
        "<p style = 'font-size: 12px'>A place I love to watch the sunset.</p>";

    var infowindowMB = new google.maps.InfoWindow({
          content: mbString
      });
    
    bonnell.addListener('click', function() {
      infowindowMB.open(map, bonnell);
    });

    var bsString = "<h3>Barton Springs</h3>"+
      "<p style = 'font-size: 12px'>A great swimming hole.</p>";

    var infowindowBS = new google.maps.InfoWindow({
      content: bsString
    });
    
    barton.addListener('click', function() {
      infowindowBS.open(map, barton);
    });

    var tdString = "<h3>The Domain</h3>"+
        "<p style = 'font-size: 12px'>My favorite place to go shopping.</p>";

    var infowindowDM = new google.maps.InfoWindow({
        content: tdString
    });
    
    domain.addListener('click', function() {
      infowindowDM.open(map, domain);
    });

    var lbString = "<h3>Lady Bird Johnson Wildflower Center</h3>"+
        "<p style = 'font-size: 12px'>A pretty place to see flowers.</p>";

    var infowindowLB = new google.maps.InfoWindow({
      content: lbString
    });
    
    ladybirdWildflower.addListener('click', function() {
      infowindowLB.open(map, ladybirdWildflower);
    });
  }
}
