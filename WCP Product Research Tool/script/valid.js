//Validtion Code For Inputs

var email = document.forms["form"]["email"];
var password = document.forms["form"]["password"];

var emailError = document.getElementById("email_error");
var passError = document.getElementById("pass_error");

email.addEventListener("textInput", emailVerify);
password.addEventListener("textInput", passVerify);

function validated() {
  var valid = true;
  if (email.value.length < 9) {
    email.style.border = "1px solid red";
    emailError.style.display = "block";
    email.focus();
    valid = valid && false;
  } else {
    email.style.border = "1px solid silver";
    emailError.style.display = "none";
    valid = valid && true;
  }
  if (password.value.length < 6) {
    password.style.border = "1px solid red";
    passError.style.display = "block";
    password.focus();
    valid = valid && false;
  } else {
    password.style.border = "1px solid silver";
    passError.style.display = "none";
    valid = valid && true;
  }
  return valid;
}
function emailVerify() {
  // TO DO: Get valid user from Workflow API
  if (email.value.length >= 9) {
    email.style.border = "1px solid silver";
    emailError.style.display = "none";
    return true;
  }
}
function passVerify() {
  // TO DO: Validate password from Workflow API
  if (password.value.length >= 6) {
    password.style.border = "1px solid silver";
    passError.style.display = "none";
    return true;
  }
}
