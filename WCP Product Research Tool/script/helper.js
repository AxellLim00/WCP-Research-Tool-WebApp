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
