/**
 *
 * @param {*} rowQuantity How many empty rows to create
 * @param {*} columnQuantity How many column are there in the table, default is 1
 * @returns
 */
function getEmptyRow(rowQuantity, columnQuantity = 1) {
  return ("<tr>" + "<td></td>".repeat(columnQuantity) + "</tr>").repeat(
    rowQuantity
  );
}

function showAlert(message) {
  // Check if alert has been made before
  if (!$(".alert").length) {
    $("body").append(`
          <div class="alert">
            <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span> 
            <div id=AlertMessage>${message}</div>
          </div>`);
  }
  // Show previously made alert
  else if ($(".alert").is(":hidden")) {
    $("#AlertMessage").html(message);
    $(".alert").show();
  }
}

function editHasChanges(hasChange) {
  // change hasChanges value in session storage
  sessionStorage.setItem("hasChanges", hasChange);
  // Change save button to warning color (yellow) when true
  if (hasChange) {
    $("button[name=saveBtn]").css("background-color", "#ffc205");
    // Apply hover effect
    $("button[name=saveBtn]")
      .on("mouseenter", function () {
        $(this).css("background-color", "#ffda69");
      })
      .on("mouseleave", function () {
        $(this).css("background-color", "#ffc205");
      });
    // Change save button back to normal when false
  } else {
    $("button[name=saveBtn]").removeAttr("style");
    $("button[name=saveBtn]").off("mouseenter mouseleave");
  }
}

function findMissingColumnHeader(rowObject, arrayHeader) {
  for (let header of arrayHeader) {
    if (header == null) {
      continue;
    }
    if (!rowObject.hasOwnProperty(header)) {
      return header;
    }
  }
  return "";
}

function hidePopUpForm(type) {
  // Finally hide Form from user
  $("#popupForm").hide();
  $(`#${type}Form`).hide();
  $(".alert").hide();
  $("#darkLayer").hide();
  $("#darkLayer").css("position", "absolute");

  // Reset textboxes' and selectboxes' values
  $(`#${type}Form input`).val("");
  $(`#${type}Form select`).val("");
}

class Product {
  constructor(id, sku, make, model, type, num, desc, status, oem) {
    this.Id = id;
    if (String(sku).trim().length > 0) {
      this.Sku = sku;
    } else {
      this.Sku = "<i>Not set</i>";
    }
    this.Make = make;
    this.Model = model;
    this.Type = type;
    this.Num = num;
    this.Desc = desc;
    if (status.trim().length <= 0) {
      this.Status = "Research OEM";
    } else {
      switch (status.toLowerCase().replace(" ", "")) {
        case "research" || "researchoem":
          this.Status = "Research OEM";
          break;
        case "waiting" || "waitingonvendorquote":
          this.Status = "Waiting on Vendor Quote";
          break;
        case "costdone" || "costingcompleted":
          this.Status = "Costing Completed";
          break;
        case "approval" || "waitingapproval":
          this.Status = "Waiting Approval";
          break;
        case "pinnacle" || "addedtopinnacle":
          this.Status = "Added to Pinnacle";
          break;
        case "peach" || "addedtopeach":
          this.Status = "Added to Peach";
          break;
        default:
          this.Status = status;
      }
    }
    if (oem.trim().length <= 0) {
      this.Oem = "Aftermarket OEM";
    } else {
      switch (oem.toLowerCase().replace(" ", "")) {
        case "aftermarket" || "aftermarketoem":
          this.Oem = "Aftermarket OEM";
          break;
        case "genuine" || "genuineoem":
          this.Oem = "Genuine OEM";
          break;
        default:
          this.Oem = oem;
      }
    }
  }
}

class AlternateIndex {
  constructor(
    name,
    number,
    moq,
    costCurrency,
    costAud,
    lastUpdated,
    quality,
    supplierPartType,
    wcpPartType,
    isMain
  ) {
    this.Name = name;
    this.Number = number;
    this.Moq = moq;
    this.CostCurrency = costCurrency;
    this.CostAud = costAud;
    this.LastUpdated = lastUpdated;
    if (quality.trim().length <= 0) {
      this.Oem = "Good";
    } else {
      switch (quality.toLowerCase().replace(" ", " ")) {
        case "good" || "goodquality":
          this.Quality = "Good";
        case "normal" || "normalquality":
          this.Quality = "Normal";
        case "bad" || "badquality":
          this.Quality = "Bad";
        default:
          this.Quality = quality;
      }
    }
    this.SupplierPartType = supplierPartType;
    this.WcpPartType = wcpPartType;
    this.IsMain = isMain ? "MAIN" : "";
  }
}
