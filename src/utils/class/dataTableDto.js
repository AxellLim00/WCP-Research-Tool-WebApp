export class ProductDto {
  /**
   *
   * @param {String} id Research ID
   * @param {String} sku SKU
   * @param {String} make Product's Make
   * @param {String} model Product's Model
   * @param {String} type Product's Part type
   * @param {String} num IC Number
   * @param {String} desc IC Description
   * @param {String} status Product Research Status
   * @param {String} oem OEM Type
   * @param {String[]} suppList Supplier Number List
   * @param {String[]} oemList OEM Number List
   * @param {String} typeCode Part Type Code
   */
  constructor(
    id,
    sku,
    make,
    model,
    type,
    num,
    desc,
    status,
    oem,
    suppList,
    oemList,
    typeCode
  ) {
    this.Id = id;
    this.Sku = sku;
    this.Make = make;
    this.Model = model;
    this.Type = type;
    this.Num = num;
    this.Desc = desc;
    status = String(status);
    switch (status.toLowerCase().replace(/[_.-\s]/g, "")) {
      case "research":
      case "researchoem":
      case "":
        this.Status = "research";
        break;
      case "waiting":
      case "waitingonvendor":
      case "waitingonvendorquote":
        this.Status = "waiting";
        break;
      case "costdone":
      case "costingcompleted":
        this.Status = "costDone";
        break;
      case "approval":
      case "waitingapproval":
        this.Status = "approval";
        break;
      case "pinnacle":
      case "addedtopinnacle":
        this.Status = "pinnacle";
        break;
      case "peach":
      case "addedtopeach":
        this.Status = "peach";
        break;
      case "catalogue":
      case "inpinnaclecatalogue":
        this.Status = "catalogue";
        break;
      default:
        this.Status = null;
    }
    oem = String(oem);
    switch (oem.toLowerCase().replace(/[_.-\s]/g, "")) {
      case "aftermarket":
      case "aftermarketoem":
      case "":
        this.Oem = "aftermarket";
        break;
      case "genuine":
      case "genuineoem":
        this.Oem = "genuine";
        break;
      default:
        this.Oem = null;
    }
    this.SuppList = suppList ?? [];
    this.OemList = oemList ?? [];
    this.TypeCode = typeCode;
    this.LastUpdate = new Date().toISOString().slice(0, 19).replace("T", " ");
  }
}

export class AlternateIndexDto {
  /**
   * @param {String} index
   * @param {String} name
   * @param {String} number
   * @param {String} moq
   * @param {String} costCurrency
   * @param {Number} costAud
   * @param {Date} lastUpdated
   * @param {String} quality
   * @param {String} supplierPartType
   * @param {String} wcpPartType
   * @param {Boolean} isMain
   * @param {String} productID
   */
  constructor(
    index,
    name,
    number,
    moq,
    costCurrency,
    costAud,
    lastUpdated,
    quality,
    supplierPartType,
    wcpPartType,
    isMain,
    productID
  ) {
    this.Index = index;
    this.Name = name;
    this.Number = number ? String(number) : "";
    this.Moq = moq ?? "";
    this.CostCurrency = costCurrency ?? "";
    this.CostAud =
      typeof costAud == String ? parseFloat(costAud) : costAud ?? "";
    this.LastUpdated = lastUpdated ?? "";
    quality = String(quality);
    switch (quality.toLowerCase().replace(" ", "")) {
      case "good":
      case "goodquality":
      case "g":
        this.Quality = "good";
        break;
      case "normal":
      case "normalquality":
      case "n":
      case "":
        this.Quality = "normal";
        break;
      case "bad":
      case "badquality":
      case "b":
        this.Quality = "bad";
        break;
      default:
        this.Quality = "";
    }
    this.SupplierPartType = supplierPartType ?? "";
    this.WcpPartType = wcpPartType ?? "";
    this.IsMain = isMain ?? false;
    this.ProductID = productID;
    // For identifying purposes
    this.ProductAlias = "";
  }
}

export class CostVolumeDto {
  /**
   *
   * @param {String} id
   * @param {Number} costUsd
   * @param {Number} costAud
   * @param {Number} estCostAud
   * @param {Number} estSell
   * @param {Number} postage
   * @param {Number} extGP
   */
  constructor(id, costUsd, costAud, estCostAud, estSell, postage, extGP) {
    this.Id = id ?? "-";
    this.CostUSD = costUsd ?? 0;
    this.CostAUD = costAud ?? 0;
    this.EstimateCostAUD = estCostAud ?? 0;
    this.EstimateSell = estSell ?? 0;
    this.Postage = postage ?? 0;
    this.ExtGP = extGP ?? 0;
  }
}
