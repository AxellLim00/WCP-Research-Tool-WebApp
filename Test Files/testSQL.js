import {
  getProduct,
  insertUser,
  insertProduct,
  insertOemByProduct,
  insertOemBySupplier,
  insertKType,
  insertAltIndexBySupplier,
  insertAltIndexByProduct,
  updateProduct,
  insertNewProduct,
  deleteNewProduct,
  deleteProduct,
} from "../src/utils/sql-utils.js";

async function getProduct_Test() {
  var result = await getProduct();
  debugger;
}

async function insertUser_Test() {
  insertUser([
    { UserID: "Research User Test 1", Team: "Team Trial" },
    { UserID: "Research User Test 2", Team: "Team Trial" },
    { UserID: "Research User Test 3", Team: "Team Test" },
  ]);
}

async function insertProduct_Test() {
  insertProduct([
    {
      UserID: "Research User Test 1",
      ResearchID: "TEST-RID-0001",
      SKU: "SKU-001",
      Status: 0,
      OemType: 0,
      EstSales: 0,
      Note: "This is a test note for a product.",
      CostUsd: 9.99,
      EstCostAud: 9.99,
      EstSell: 9.99,
      Postage: 9.99,
      ExtGp: 5.0,
    },
    {
      UserID: "Research User Test 2",
      ResearchID: "TEST-RID-0002",
      SKU: "SKU-002",
      Status: 0,
      OemType: 0,
      EstSales: 0,
      Note: "This is a test note for a product.",
      CostUsd: 9.99,
      EstCostAud: 9.99,
      EstSell: 9.99,
      Postage: 9.99,
      ExtGp: 5.0,
    },
    {
      UserID: "Research User Test 3",
      ResearchID: "TEST-RID-0003",
      SKU: "SKU-003",
      Status: 0,
      OemType: 0,
      EstSales: 0,
      Note: "This is a test note for a product.",
      CostUsd: 9.99,
      EstCostAud: 9.99,
      EstSell: 9.99,
      Postage: 9.99,
      ExtGp: 5.0,
    },
    {
      UserID: "Research User Test 1",
      ResearchID: "TEST-RID-0004",
      SKU: null,
      Status: 0,
      OemType: 0,
      EstSales: 0,
      Note: "This is a test note for a product.",
      CostUsd: 9.99,
      EstCostAud: 9.99,
      EstSell: 9.99,
      Postage: 9.99,
      ExtGp: 5.0,
    },
    {
      UserID: "Research User Test 3",
      ResearchID: null,
      SKU: "SKU-005",
      Status: 0,
      OemType: 0,
      EstSales: 0,
      Note: "This is a test note for a product.",
      CostUsd: 9.99,
      EstCostAud: 9.99,
      EstSell: 9.99,
      Postage: 9.99,
      ExtGp: 5.0,
    },
  ]);
}

async function insertOemByProduct_Test() {
  insertOemByProduct("123-456", [
    {
      Supplier: "123-456",
      Oem: "1234567890",
    },
    {
      Supplier: "123-450",
      Oem: "9876543210",
    },
  ]);
}

async function insertOemBySupplier_Test() {
  insertOemBySupplier("123-456", [
    {
      ProductID: "TEST-RID-0003",
      Oem: "1357911131",
    },
    {
      ProductID: "TEST-RID-0001",
      Oem: "8642086420",
    },
    {
      ProductID: "TEST-RID-0004",
      Oem: "2468101214",
    },
    {
      ProductID: "TEST-RID-0002",
      Oem: "4682468246:",
    },
  ]);
}

async function insertKType_Test() {
  insertKType({ KType: "Test-KType2", ProductID: "SKU-002" });
}

async function insertAltIndexBySupplier_Test() {
  insertAltIndexBySupplier("123-456", [
    {
      MOQ: 10,
      CostAud: 9.99,
      Quality: 0,
      SupplierPartType: "Engine",
      WCPPartType: "ENG",
      ProductID: "TEST-RID-0002",
    },
    {
      MOQ: 10,
      CostAud: 9.99,
      Quality: 0,
      SupplierPartType: "Engine",
      WCPPartType: "ENG",
      ProductID: "TEST-RID-0004",
    },
    {
      MOQ: 10,
      CostAud: 9.99,
      Quality: 0,
      SupplierPartType: "Engine",
      WCPPartType: "ENG",
      ProductID: "TEST-RID-0003",
    },
    {
      MOQ: 10,
      CostAud: 9.99,
      Quality: 0,
      SupplierPartType: "Engine",
      WCPPartType: "ENG",
      ProductID: "TEST-RID-0001",
    },
  ]);
}

async function insertAltIndexByProduct_Test() {
  insertAltIndexByProduct("SKU-005", [
    {
      MOQ: 10,
      CostAud: 9.99,
      Quality: 0,
      SupplierPartType: "Engine",
      WCPPartType: "ENG",
      Supplier: "123-450",
    },
    {
      MOQ: 10,
      CostAud: 9.99,
      Quality: 0,
      SupplierPartType: "Engine",
      WCPPartType: "ENG",
      Supplier: "123-456",
    },
  ]);
}

async function insertNewProduct_Test() {
  insertNewProduct([
    {
      UserID: "Research User Test 3",
      ResearchID: "TEST-NEW-01",
      Status: "pinnacle",
      Oem: "genuine",
      Make: "Suzuki",
      Model: "Ertiga",
      PartType: "Brake",
      IcNumber: "T123 X1",
      IcDescription: "Test Product FOR TESTING ONLY",
    },
    {
      UserID: "Research User Test 3",
      ResearchID: "TEST-NEW-02",
      Status: "pinnacle",
      Oem: "aftermarket",
      Make: "Toyota",
      Model: "Camry",
      PartType: "Brake",
      IcNumber: "T123 X2",
      IcDescription: "Test Product FOR TESTING ONLY",
    },
    {
      UserID: "Research User Test 3",
      ResearchID: "TEST-NEW-03",
      Status: "waiting",
      Oem: "genuine",
      Make: "Honda",
      Model: "Civic",
      PartType: "Brake",
      IcNumber: "T123 X3",
      IcDescription: "Test Product FOR TESTING ONLY",
    },
  ]);
}

async function updateProduct_Test() {
  let update = [
    new Map([
      ["id", "TEST-RID-0001"],
      [
        "changes",
        {
          Status: "waiting",
          Oem: "genuine",
        },
      ],
    ]),
    new Map([
      ["id", "SKU-002"],
      [
        "changes",
        {
          Status: "approval",
        },
      ],
    ]),
    new Map([
      ["id", "TEST-RID-0003"],
      [
        "changes",
        {
          Oem: "genuine",
        },
      ],
    ]),
  ];
  var result = await updateProduct(update);
  debugger;
}

async function deleteNewProduct_Test() {
  await insertNewProduct([
    {
      UserID: "Research User Test 3",
      ResearchID: "TEST-DEL-01",
      Status: "pinnacle",
      Oem: "genuine",
      Make: "Suzuki",
      Model: "Ertiga",
      PartType: "Brake",
      IcNumber: "T123 X1",
      IcDescription: "Test Product FOR DELETING TESTING ONLY",
    },
    {
      UserID: "Research User Test 3",
      ResearchID: "TEST-DEL-02",
      Status: "pinnacle",
      Oem: "aftermarket",
      Make: "Toyota",
      Model: "Camry",
      PartType: "Brake",
      IcNumber: "T123 X2",
      IcDescription: "Test Product FOR DELETING TESTING ONLY",
    },
    {
      UserID: "Research User Test 3",
      ResearchID: "TEST-DEL-03",
      Status: "waiting",
      Oem: "genuine",
      Make: "Honda",
      Model: "Civic",
      PartType: "Brake",
      IcNumber: "T123 X3",
      IcDescription: "Test Product FOR DELETING TESTING ONLY",
    },
  ]);

  let toDelete = [
    new Map([["id", "TEST-DEL-01"]]),
    new Map([["id", "TEST-DEL-02"]]),
    new Map([["id", "TEST-DEL-03"]]),
  ];

  await deleteNewProduct(toDelete);
  await deleteProduct(toDelete);
  debugger;
}

