import { showAlert, selectTab } from "./html-utils";

/**
 * Refresh tab when product is updated
 * @param {String} newId Product ID on search bar
 * @param {String[]} idList Complete list of all products to compare against
 * @param {String} currentId Current product ID selected
 * @param {String} tabId Current tab ID selected
 * @param {Boolean} showError Show Alert error message when true
 */
export function productSelectedChanged (
  newId,
  idList,
  currentId,
  tabId,
  showError = false
) {
  var hasChanges = sessionStorage.getItem("hasChanges") == "true";
  $("#productSelected").attr("oldvalue", currentId);
  if (!idList.includes(newId) || newId == currentId) {
    if (!showError) return;
    showAlert(`Error: Product ID ${newId} not found`);
    $("#productSelected").val($("#productSelected").attr("oldvalue"));
    // $("#productSelected").attr("oldvalue", "");
    return;
  }
  if (hasChanges) {
    $("#searchConfirmation.confirmation").show();
    $("#darkLayer").show();
    $("#darkLayer").css("position", "fixed");
    return;
  }
  sessionStorage.setItem("productIDSelected", newId);
  selectTab(tabId);
  // $("#productSelected").attr("oldvalue", "");
}
