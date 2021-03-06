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

package com.google.sps.data;

// a comment object that holds the information from the comment
public final class Comment {

  private final String name;
  private final String text;
  private final String email;
  private final long timestamp;
  private final long id;
  private final float score;
  private final String date;

  public Comment(String name, String comment, String email, Long timestamp, long id, float score, String date) {
    if(name == ""){
      this.name = "Anonymous";
    } else {
      this.name = name;
    }
    this.text = comment;
    this.email = email;
    this.timestamp = timestamp;
    this.id = id;
    this.score = score;
    this.date = date;
  }
}