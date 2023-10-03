// TO DO: name all parameter and its types

function selectTab(tabIdSelected) {
  currentTab = sessionStorage.getItem("currentTab");
  if (currentTab) {
    $("#" + currentTab + "-name").removeClass("tab-name-selected");
    $("#" + currentTab + "-icon").removeClass("tab-icon-selected");
  }

  $("#" + tabIdSelected + "-name").addClass("tab-name-selected");
  $("#" + tabIdSelected + "-icon").addClass("tab-icon-selected");
  // remove any saved changes on sessionStorage
  sessionStorage.removeItem("tableChanges");
  sessionStorage.setItem("currentTab", tabIdSelected);

  const content = $("#content");
  switch (tabIdSelected) {
    case "tab0":
      $("#content").load("../html/dashboard.html");
      break;
    case "tab1":
      $("#content").load("../html/product.html");
      break;
    case "tab2":
      $("#content").load("../html/stats.html");
      break;
    case "tab3":
      $("#content").load("../html/cost&Vol.html");
      break;
    case "tab4":
      $("#content").load("../html/altIndex.html");
      break;
    case "tab5":
      $("#content").load("../html/ebay.html");
      break;
    default:
      content.html(`
            <h1>Welcome to Empty Tab</h1>
            <p>This is the content of current Empty Tab with the wrong tab ID.</p>
          `);
      break;
  }
}

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

function showPopUpForm(type, title) {
  $('h2[name="formTitle"]').text(title);
  $("#popupForm").show();
  $(`#${type}Form`).show();
  $("#darkLayer").css("position", "fixed");
  $("#darkLayer").show();
}

function hidePopUpForm(type) {
  // Finally hide Form from user
  $("#popupForm").hide();
  $(`#${type}Form`).hide();
  $(".alert").hide();
  $("#darkLayer").hide();
  $("#darkLayer").css("position", "absolute");
}

function exitPopUpForm(type) {
  hidePopUpForm(type);

  // Reset textboxes' and selectboxes' values
  $(`#${type}Form input`).val("");
  $(`#${type}Form select`).val("");
  $(`#${type}Form input`).prop("checked", false);
}

function storeChangesInSessionStorage(change) {
  storedChanges = sessionStorage.getItem("savedChanges");
  debugger;
  if (storedChanges === null) {
    sessionStorage.setItem("savedChanges", JSON.stringify(change));
    return;
  }
  storedChanges.push(...change);
  sessionStorage.setItem("savedChanges", JSON.stringify(storedChanges));
}

function saveChangesToSQL() {
  // TO DO: translate Map changes to SQL
  // TO DO: translate JSON from sessionstorage to Map
  savedChanges = sessionStorage.getItem("savedChanges");
  // translate
  savedChanges.forEach(function (changes) {
    let type = changes.get("type");
    let id = changes.get("id");
    let table = changes.get("table");
    let changedValues = changes.get("changes");
  });
  errorMessage = "";
  // IF there is error message
  if (errorMessage.length > 0) {
    showAlert(
      `<strong>FATAL Error!</strong> Fail to save to database, please contact administrator --> ${errorMessage}`
    );
    return false;
  }

  sessionStorage.clearItem("savedChanges");
  return true;
}

async function readExcelFileToJson(filenameInput) {
  // Read file
  const FILE = $(filenameInput).prop("files");
  const READER = new FileReader();
  return new Promise((resolve, reject) => {
    READER.onloadend = function () {
      console.log("here");
      const FILE_DATA = new Uint8Array(READER.result);
      const WORKBOOK = XLSX.read(FILE_DATA, { type: "array" });

      // Assuming the first sheet of the workbook is the relevant one
      const SHEET_NAME = WORKBOOK.SheetNames[0];
      const SHEET = WORKBOOK.Sheets[SHEET_NAME];
      resolve(XLSX.utils.sheet_to_json(SHEET));
    };
    READER.onerror = function () {
      showAlert(
        `<strong>Error!</strong> File fail to load: ${fileReader.error}`
      );
      reject(undefined);
    };
    READER.readAsArrayBuffer(FILE[0]);
  });
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
