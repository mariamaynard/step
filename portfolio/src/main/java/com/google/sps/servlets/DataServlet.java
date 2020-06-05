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

package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import java.util.ArrayList;
import com.google.gson.Gson;
import java.util.List;
import com.google.sps.data.Comment;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.datastore.FetchOptions;

/** Servlet that returns some example content. TODO: modify this file to handle comments data */
@WebServlet("/get-comment")
public class DataServlet extends HttpServlet {

  DatastoreService datastore;
  int max;
  String sort;

  @Override
  public void init() {
    datastore = DatastoreServiceFactory.getDatastoreService();
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    //get the comments from the data store sorted by their time stamp so they will show up in order
    sort = request.getParameter("sort");
    Query query = getSort();
    // check how many comments we want to show
    String num = request.getParameter("commNum");
    max = Integer.parseInt(num);
    PreparedQuery results = datastore.prepare(query);
    List<Comment> cmntsList = new ArrayList<>();
    // return the correct number of comments
    for (Entity entity : results.asIterable(FetchOptions.Builder.withLimit(max))) {
      Comment comment = new Comment((String)entity.getProperty("name"), (String)entity.getProperty("comment"));
      cmntsList.add(comment);
    }
    Gson gson = new Gson();
    response.setContentType("application/json;");
    response.setCharacterEncoding("UTF-8");
    response.getWriter().println(gson.toJson(cmntsList));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String text = request.getParameter("comment");
    String name = request.getParameter("name");
    long timestamp = System.currentTimeMillis();
    if(text != null){
      //store the comment as an entity with the timestamp and the comment
      Entity taskEntity = new Entity("Task");
      taskEntity.setProperty("timestamp", timestamp);
      taskEntity.setProperty("comment", text);
      taskEntity.setProperty("name", name);
      //add the comment to the datastore so that we can get it back later
      DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
      datastore.put(taskEntity);
    }
    // let the next thing know that this method is done
    response.setContentType("text/html");
    response.getWriter().println("done");
  }

  private Query getSort() {
    Query query;
    if(sort.equals("Newest")) {
      query = new Query("Task").addSort("timestamp", SortDirection.DESCENDING);
    } else if(sort.equals("Oldest")) {
      query = new Query("Task").addSort("timestamp", SortDirection.ASCENDING);
    } else if (sort.equals("A")){
      query = new Query("Task").addSort("name", SortDirection.ASCENDING);
    } else {
      query = new Query("Task").addSort("name", SortDirection.DESCENDING);
    }
    return query;
  }
}