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
      console.log(comm.score);
      userComment = false;
      if(comm.email == email || email == "mariamaynard@google.com") {
        userComment = true;
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
  const emoji = sentimentEmoji(comment.score);
  comElem.appendChild(nameElem);
  nameElem.appendChild(emoji);
  comElem.appendChild(commTextElem);
  // make the delete button
  if(userComment){
    const deleteButtonElement = document.createElement('button');
    deleteButtonElement.innerText = 'Delete';
    deleteButtonElement.addEventListener('click', () => {
      deleteComment(comment);
      // Remove the task from the DOM.
      comElem.remove();
    });
    comElem.appendChild(deleteButtonElement);
  }
  return comElem;
}

/** Tells the server to delete the task. */
function deleteComment(comment) {
  const params = new URLSearchParams();
  params.append('id', comment.id);
  fetch('/delete-comment', {method: 'POST', body: params});
}

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

