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

import com.google.appengine.api.datastore.*;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.HashMap;
import com.google.gson.Gson;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

   @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    PrintWriter out = response.getWriter();
    UserService userService = UserServiceFactory.getUserService();
    String url;
    String loggedIn;
    HashMap<String, String> returnVals = new HashMap<String, String>();
    // If user is not logged in
    if (!userService.isUserLoggedIn()) {
      url = userService.createLoginURL("/comments.html");
      loggedIn = "0";
    } else {
      // User is logged in
      url = userService.createLogoutURL("/comments.html");
      loggedIn = "1";
      returnVals.put("email", userService.getCurrentUser().getEmail());
    }
    returnVals.put("url", url);
    returnVals.put("loggedIn", loggedIn);
    Gson gson = new Gson();
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(returnVals));
  }
}
