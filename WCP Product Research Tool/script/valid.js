//Validtion Code For Inputs
$(function () {
  const WORKFLOW_API = new WorkFlowAPI();
  $("#loginBtn").on("click", async function () {
    $("#no-username").hide();
    $("#no-password").hide();

    let username = $(".login_form input[name=user]").val();
    let password = $(".login_form input[name=password]").val();
    if (!username || !password) {
      if (username.length == 0) $("#no-username").show();
      if (password.length == 0) $("#no-password").show();
      return;
    }
    try {
      let response = await WORKFLOW_API.authenticate(username, password);
      if (response.status === "error") {
        if (response.error.response.status === 404)
          showAlert(
            `<b>Authentication Failed:</b> Username or password is incorrect`
          );
        else showAlert(
          `<b>Authentication error:</b> ${response.error.response.status}, ${response.error}`
        );
        return;
      }
      // When successful login, save JWT Token
      sessionStorage.setItem("token", response.data.token);
      // Move to main screen
      location.href = "../html/layout.html";
      return;
    } catch (error) {
      showAlert(`<b>ERROR!</b> ${error}`);
      console.error("Authentication error:", error);
    }
    return;
  });
});
