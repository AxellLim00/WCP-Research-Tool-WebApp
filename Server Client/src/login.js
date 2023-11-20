import $ from "jquery";
import io from "socket.io-client";
import { showAlert } from "./utils/html-utils.js";

$(function () {
  console.log("Starting");
  const socket = io();
  const login_button = $("#loginBtn");
  const username_input = $(".login_form input[name=user]");
  const password_input = $(".login_form input[name=password]");

  login_button.on("click", async function () {
    $("#no-username").hide();
    $("#no-password").hide();
    let username = username_input.val();
    let password = password_input.val();
    if (!username || !password) {
      if (username.length == 0) $("#no-username").show();
      if (password.length == 0) $("#no-password").show();
      return;
    }
    try {
      socket.auth = { username, password };
      socket.disconnect();
      socket.connect();
      login_button.prop("disabled", true);
      username_input.prop("disabled", true);
      password_input.prop("disabled", true);
    } catch (error) {
      showAlert(`<b>ERROR!</b> ${error}`);
      console.error("Authentication error:", error);
    }
  });

  socket.on("authenticated", (token) => {
    login_button.prop("disabled", false);
    username_input.prop("disabled", false);
    password_input.prop("disabled", false);

    sessionStorage.setItem("token", token);
    location.href += "research-tool";
  });

  socket.on("fail authenticated", (error) => {
    console.log("fail to authenticate");
    if (error.status === 404)
      showAlert(
        `<b>Authentication Failed:</b> Username or password is incorrect`
      );
    else
      showAlert(
        `<b>Authentication error:</b> ${error.status}, ${error.message}`
      );
    login_button.prop("disabled", false);
    username_input.prop("disabled", false);
    password_input.prop("disabled", false);
  });
});
