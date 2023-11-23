export class ProductRequestHistoryDto {
  /**
   *
   * @param {Number} pinnacleItemTypeId
   * @param {String} partTypeCode
   * @param {String} partTypeFriendlyName
   * @param {String} interchangeNumber
   * @param {String} interchangeVersion
   * @param {Number} totalNumberOfRequests
   * @param {Number} totalNumberOfNotFoundRequests
   * @param {Number} totalNumberOfUnitsSold
   * @param {String} vehicleManufacturers
   * @param {String} vehicleModels
   * @param {String} vehicleIdentificationNumbers
   * @param {String} interchangeDescriptions
   * @param {String} productStockNumber
   * @param {String} altIndexNumber
   * @param {String} vendorName
   * @param {Number} averageConditionPrice
   * @param {Number} costPrice
   */
  constructor(
    pinnacleItemTypeId,
    partTypeCode,
    partTypeFriendlyName,
    interchangeNumber,
    interchangeVersion,
    totalNumberOfRequests,
    totalNumberOfNotFoundRequests,
    totalNumberOfUnitsSold,
    vehicleManufacturers,
    vehicleModels,
    vehicleIdentificationNumbers,
    interchangeDescriptions,
    productStockNumber,
    altIndexNumber,
    vendorName,
    averageConditionPrice,
    costPrice
  ) {
    this.pinnacleItemTypeId = pinnacleItemTypeId;
    this.partTypeCode = partTypeCode;
    this.partTypeFriendlyName = partTypeFriendlyName;
    this.interchangeNumber = interchangeNumber;
    this.interchangeVersion = interchangeVersion;
    this.totalNumberOfRequests = totalNumberOfRequests;
    this.totalNumberOfNotFoundRequests = totalNumberOfNotFoundRequests;
    this.totalNumberOfUnitsSold = totalNumberOfUnitsSold;
    this.vehicleManufacturers = vehicleManufacturers;
    this.vehicleModels = vehicleModels;
    this.vehicleIdentificationNumbers = vehicleIdentificationNumbers;
    this.interchangeDescriptions = interchangeDescriptions;
    this.productStockNumber = productStockNumber;
    this.altIndexNumber = altIndexNumber;
    this.vendorName = vendorName;
    this.averageConditionPrice = averageConditionPrice;
    this.costPrice = costPrice;
    this.researchIdentifier = "";
  }
}

// export default { ProductRequestHistoryDto };
