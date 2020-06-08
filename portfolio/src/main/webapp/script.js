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

//updates the comments on the page
var max;
var sort;

function getComment(fromApply) {
  if(fromApply === true || max == null) {
    max = document.getElementById('commNum').value;
    sort = document.getElementById('sort').value;
  }
  fetch('/get-comment?commNum=' + max + '&sort=' + sort).then(response => response.json()).then((comnts) => {
    const commentList = document.getElementById('comments');
    commentList.innerHTML = '';
    // add all of the comments to the comment container
    comnts.forEach((comm) => {
      commentList.appendChild(createCommentElement(comm));
    })
  });
}

// method that gets the comment that the user wants to post and adds it to the page
function postComment(e) {
  e.preventDefault();
  var comment = document.getElementById('comment').value;
  var name = document.getElementById("name").value;
  document.getElementById('myForm').reset();
  // make the post request with the comment as a parameter
  const requestPost = new Request('/get-comment?comment=' + comment + '&name=' + name, {method: 'POST'});
  fetch(requestPost).then(response => response.text()).then(text => {
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
  const requestPost = new Request('/delete-comment', {method: 'POST'});
  fetch(requestPost).then(response => response.text()).then(text => {
    if(text != ""){
      getComment();
    }
  });
}

function createCommentElement(comment) {
  const comElem = document.createElement('dt');
  comElem.className = 'comment';
  comElem.innerText = comment.name;
  const commTextElem = document.createElement('dd');
  commTextElem.innerText = comment.text;
  comElem.appendChild(commTextElem);
  return comElem;
}

