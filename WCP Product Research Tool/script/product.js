$(document).ready(function () {
  const productTable_Column = 9;
  var form_Selected;

  //Load table from SQL

  // if loading from SQL empty
  var isEmptyData = true;

  const default_ProductTable_Row_Amount = 15;
  if (isEmptyData) {
    $("#productTable").append(
      getEmptyRow(default_ProductTable_Row_Amount, productTable_Column)
    );
  } else {
    let productTable_Data;
    //fill in table with the data

    if (productTable_Data < default_ProductTable_Row_Amount) {
      $("#productTable > tbody:last-child").append(
        getEmptyRow(
          default_ProductTable_Row_Amount - productTable_Data,
          productTable_Column
        )
      );
    }
  }

  // $("#productTable").DataTable({
  //   responsive: true,
  //   pagingType: "full_numbers",
  // });

  // searchbar logic
  const rows = $("#productTable tr");

  $("#idSearch").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    // filter data
    // remove rows from table
    // insert new filter data into table
  });

  // new product

  $('button[name="newBtn"]').on("click", function () {
    $('h2[name="formTitle"]').text("New Product");
    form_Selected = "new";
    $("#popupForm").show();
    $(`#${form_Selected}Form`).show();
  });

  $('button[name="importBtn"]').on("click", function () {
    $('h2[name="formTitle"]').text("Import Product(s)");
    form_Selected = "import";
    $("#popupForm").show();
    $(`#${form_Selected}Form`).show();
  });

  $('button[name="saveForm"]').on("click", function () {
    //check if mandatory field
    var isFormFilled = $(`#${form_Selected}Sku`).value &&;
    

    if (isFormFilled) {
      $("#popupForm").hide();
      $(`#${form_Selected}Form`).hide();
    } else {
      if (!$(".alert").length) {
        $("body").append(`
          <div class="alert">
            <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span> 
            <strong>Error!</strong> Please complete all non-optional fields.
          </div>`);
      } else if ($(".alert").is(":hidden")) {
        $(".alert").show();
      }
    }
  });

  $('button[name="cancelForm"]').on("click", function () {
    $("#popupForm").hide();
    $(`#${form_Selected}Form`).hide();
  });
});
