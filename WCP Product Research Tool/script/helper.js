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
