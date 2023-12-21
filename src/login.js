import $ from "jquery";
import socket from "./utils/socket-utils.js";
import { showAlert } from "./utils/html-utils.js";

$(function () {
  console.log("Starting");
  const $loginButton = $("#loginBtn");
  const $usernameInput = $(".login_form input[name=user]");
  const $passwordInput = $(".login_form input[name=password]");

  $loginButton.on("click", async function () {
    $("#no-username").hide();
    $("#no-password").hide();
    let username = $usernameInput.val();
    let password = $passwordInput.val();
    if (!username || !password) {
      if (username.length === 0) $("#no-username").show();
      if (password.length === 0) $("#no-password").show();
      return;
    }
    try {
      socket.auth = { username, password };
      socket.disconnect();
      socket.connect();
      $loginButton.prop("disabled", true);
      $usernameInput.prop("disabled", true);
      $passwordInput.prop("disabled", true);
    } catch (error) {
      showAlert(`<b>ERROR!</b> ${error}`);
      console.error("Authentication error:", error);
    }
  });

  socket.on("authenticated", (token) => {
    $loginButton.prop("disabled", false);
    $usernameInput.prop("disabled", false);
    $passwordInput.prop("disabled", false);

    sessionStorage.setItem("token", token);
    sessionStorage.setItem("username", $usernameInput.val());
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
    $loginButton.prop("disabled", false);
    $usernameInput.prop("disabled", false);
    $passwordInput.prop("disabled", false);
  });
});
