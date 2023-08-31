//Validtion Code For Inputs

var email = document.forms["form"]["email"];
var password = document.forms["form"]["password"];

var email_error = document.getElementById("email_error");
var pass_error = document.getElementById("pass_error");

email.addEventListener("textInput", email_Verify);
password.addEventListener("textInput", pass_Verify);

function validated() {
  var valid = true;
  if (email.value.length < 9) {
    email.style.border = "1px solid red";
    email_error.style.display = "block";
    email.focus();
    valid = valid && false;
  } else {
    email.style.border = "1px solid silver";
    email_error.style.display = "none";
    valid = valid && true;
  }
  if (password.value.length < 6) {
    password.style.border = "1px solid red";
    pass_error.style.display = "block";
    password.focus();
    valid = valid && false;
  } else {
    password.style.border = "1px solid silver";
    pass_error.style.display = "none";
    valid = valid && true;
  }
  return valid;
}
function email_Verify() {
  if (email.value.length >= 9) {
    email.style.border = "1px solid silver";
    email_error.style.display = "none";
    return true;
  }
}
function pass_Verify() {
  if (password.value.length >= 6) {
    password.style.border = "1px solid silver";
    pass_error.style.display = "none";
    return true;
  }
}
