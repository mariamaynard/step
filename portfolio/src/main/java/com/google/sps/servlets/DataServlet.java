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

  @Override
  public void init() {
    datastore = DatastoreServiceFactory.getDatastoreService();
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    //get the comments from the data store sorted by their time stamp so they will show up in order
    Query query = new Query("Task").addSort("timestamp", SortDirection.DESCENDING);
    // check how many comments we want to show
    String num = request.getParameter("commNum");
    max = Integer.parseInt(num);
    PreparedQuery results = datastore.prepare(query);
    List<String> cmntsList = new ArrayList<>();
    // return the correct number of comments
    for (Entity entity : results.asIterable(FetchOptions.Builder.withLimit(max))) {
      String comment = (String) entity.getProperty("comment");
      cmntsList.add(comment);
    }
    Gson gson = new Gson();
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(cmntsList));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String text = request.getParameter("comment");
    long timestamp = System.currentTimeMillis();
    if(text != null){
      //store the comment as an entity with the timestamp and the comment
      Entity taskEntity = new Entity("Task");
      taskEntity.setProperty("timestamp", timestamp);
      taskEntity.setProperty("comment", text);
      //add the comment to the datastore so that we can get it back later
      DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
      datastore.put(taskEntity);
    }
    response.setContentType("text/html");
    response.getWriter().println("done");
  }
}