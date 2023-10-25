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
        showAlert(`<b>ERROR!</b> ${response.error}`);
        return;
      }
      if (response.status != 200) {
        showAlert(`<b>Login Failed!</b> Invalid username or password.`);
        console.error(
          `Authentication Failed: ${response.status} ${response.data}, ${response.error}`
        );
        return;
      }
      location.href = "../html/layout.html";
      // When successful login, save JWT Token
      sessionStorage.setItem("token", response.data.JWT);
      return;
    } catch (error) {
      showAlert(`<b>ERROR!</b> ${error}`);
      console.error("Authentication error:", error);
    }
    return;
  });
});
