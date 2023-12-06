import {
  getProduct,
  insertUser,
  insertProduct,
  insertOemByProduct,
  insertOemBySupplier,
  insertKType,
  insertAltIndexBySupplier,
  insertAltIndexByProduct,
  insertEpid,
  insertNewProduct,
  insertSupplier,
  updateProduct,
  deleteNewProduct,
  deleteProduct,
  updateOem,
  updateKType,
  updateEpid,
  updateAltIndex,
  deleteUser,
  deleteSupplier,
  deleteKType,
  deleteEpid,
  deleteOem,
  deleteAltIndex,
} from "../src/utils/sql-utils.js";

async function getProduct_Test() {
  var result = await getProduct();
}

async function insertUser_Test() {
  await insertUser([
    new Map([
      ["table", "Users"],
      [
        "changes",
        [
          { UserID: "Research User Test 1", Team: "Team Trial" },
          { UserID: "Research User Test 2", Team: "Team Trial" },
          { UserID: "Research User Test 3", Team: "Team Test" },
        ],
      ],
    ]),
  ]);

  await deleteUser([
    new Map([
      ["table", "Users"],
      [
        "changes",
        [
          "Research User Test 1",
          "Research User Test 2",
          "Research User Test 3",
        ],
      ],
    ]),
  ]);
}

async function insertProduct_Test() {
  await insertUser([
    new Map([
      ["table", "Users"],
      [
        "changes",
        [
          { UserID: "Research User Test 1", Team: "Team Trial" },
          { UserID: "Research User Test 2", Team: "Team Trial" },
          { UserID: "Research User Test 3", Team: "Team Test" },
        ],
      ],
    ]),
  ]);

  await insertProduct([
    new Map([
      ["table", "Product"],
      [
        "changes",
        [
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
        ],
      ],
    ]),
  ]);

  await deleteProduct([
    new Map([["id", "TEST-RID-0001"]]),
    new Map([["id", "TEST-RID-0002"]]),
    new Map([["id", "TEST-RID-0003"]]),
    new Map([["id", "TEST-RID-0004"]]),
    new Map([["id", "SKU-005"]]),
  ]);

  await deleteUser([
    new Map([
      ["table", "Users"],
      [
        "changes",
        [
          "Research User Test 1",
          "Research User Test 2",
          "Research User Test 3",
        ],
      ],
    ]),
  ]);
}

async function insertOemByProduct_Test() {
  await insertUser([
    new Map([
      ["table", "Users"],
      ["changes", [{ UserID: "Research User Test 1", Team: "Team Trial" }]],
    ]),
  ]);

  await insertProduct([
    new Map([
      ["table", "Product"],
      [
        "changes",
        [
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
        ],
      ],
    ]),
  ]);

  await insertSupplier([
    new Map([
      ["table", "Supplier"],
      [
        "changes",
        [
          {
            SupplierNumber: "123-456",
            SupplierName: "TEST-SUPPLIER-01",
            Currency: "AUD",
          },
          {
            SupplierNumber: "123-450",
            SupplierName: "TEST-SUPPLIER-02",
            Currency: "USD",
          },
        ],
      ],
    ]),
  ]);

  await insertOemByProduct([
    new Map([
      ["id", "TEST-RID-0001"],
      [
        "changes",
        [
          {
            Supplier: "123-456",
            Oem: "1234567890",
          },
          {
            Supplier: "123-450",
            Oem: "9876543210",
          },
        ],
      ],
    ]),
  ]);

  await deleteOem([
    new Map([
      ["id", "TEST-RID-0001"],
      [
        "changes",
        {
          Supplier: "123-456",
          Oem: "1234567890",
        },
      ],
    ]),
    new Map([
      ["id", "TEST-RID-0001"],
      [
        "changes",
        {
          Supplier: "123-450",
          Oem: "9876543210",
        },
      ],
    ]),
  ]);

  await deleteSupplier([
    new Map([
      ["table", "Supplier"],
      ["changes", ["123-456", "123-450"]],
    ]),
  ]);

  await deleteProduct([new Map([["id", "TEST-RID-0001"]])]);

  await deleteUser([
    new Map([
      ["table", "Users"],
      ["changes", ["Research User Test 1"]],
    ]),
  ]);
}

async function insertOemBySupplier_Test() {
  await insertUser([
    new Map([
      ["table", "Users"],
      [
        "changes",
        [
          { UserID: "Research User Test 1", Team: "Team Trial" },
          { UserID: "Research User Test 2", Team: "Team Trial" },
          { UserID: "Research User Test 3", Team: "Team Test" },
        ],
      ],
    ]),
  ]);

  await insertProduct([
    new Map([
      ["table", "Product"],
      [
        "changes",
        [
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
        ],
      ],
    ]),
  ]);

  await insertSupplier([
    new Map([
      ["table", "Supplier"],
      [
        "changes",
        [
          {
            SupplierNumber: "123-456",
            SupplierName: "TEST-SUPPLIER-01",
            Currency: "AUD",
          },
        ],
      ],
    ]),
  ]);

  await insertOemBySupplier([
    new Map([
      ["Supplier", "123-456"],
      [
        "changes",
        [
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
            Oem: "4682468246",
          },
        ],
      ],
    ]),
  ]);

  await deleteOem([
    new Map([
      ["id", "TEST-RID-0003"],
      [
        "changes",
        {
          Supplier: "123-456",
          Oem: "1357911131",
        },
      ],
    ]),
    new Map([
      ["id", "TEST-RID-0001"],
      [
        "changes",
        {
          Supplier: "123-456",
          Oem: "8642086420",
        },
      ],
    ]),

    new Map([
      ["id", "TEST-RID-0004"],
      [
        "changes",
        {
          Supplier: "123-456",
          Oem: "2468101214",
        },
      ],
    ]),

    new Map([
      ["id", "TEST-RID-0002"],
      [
        "changes",
        {
          Supplier: "123-456",
          Oem: "4682468246",
        },
      ],
    ]),
  ]);

  await deleteSupplier([
    new Map([
      ["table", "Supplier"],
      ["changes", ["123-456"]],
    ]),
  ]);

  await deleteProduct([
    new Map([["id", "TEST-RID-0001"]]),
    new Map([["id", "TEST-RID-0002"]]),
    new Map([["id", "TEST-RID-0003"]]),
    new Map([["id", "TEST-RID-0004"]]),
  ]);

  await deleteUser([
    new Map([
      ["table", "Users"],
      [
        "changes",
        [
          "Research User Test 1",
          "Research User Test 2",
          "Research User Test 3",
        ],
      ],
    ]),
  ]);
}

async function insertKType_Test() {
  await insertUser([
    new Map([
      ["table", "Users"],
      ["changes", [{ UserID: "Research User Test 2", Team: "Team Trial" }]],
    ]),
  ]);

  await insertProduct([
    new Map([
      ["table", "Product"],
      [
        "changes",
        [
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
        ],
      ],
    ]),
  ]);

  await insertKType([
    new Map([
      ["id", "SKU-002"],
      ["changes", { KType: "Test-KType2" }],
    ]),
  ]);
  await deleteKType([
    new Map([
      ["id", "SKU-002"],
      ["changes", { KType: "Test-KType2" }],
    ]),
  ]);

  await deleteProduct([new Map([["id", "TEST-RID-0002"]])]);

  await deleteUser([
    new Map([
      ["table", "Users"],
      ["changes", ["Research User Test 2"]],
    ]),
  ]);
}

async function insertEpid_Test() {
  await insertUser([
    new Map([
      ["table", "Users"],
      ["changes", [{ UserID: "Research User Test 1", Team: "Team Trial" }]],
    ]),
  ]);

  await insertProduct([
    new Map([
      ["table", "Product"],
      [
        "changes",
        [
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
        ],
      ],
    ]),
  ]);

  await insertEpid([
    new Map([
      ["id", "SKU-001"],
      ["changes", { KType: "Test-EPID1" }],
    ]),
  ]);
  await deleteEpid([
    new Map([
      ["id", "SKU-001"],
      ["changes", { KType: "Test-EPID1" }],
    ]),
  ]);

  await deleteProduct([new Map([["id", "TEST-RID-0001"]])]);

  await deleteUser([
    new Map([
      ["table", "Users"],
      ["changes", ["Research User Test 1"]],
    ]),
  ]);
}

async function insertAltIndexBySupplier_Test() {
  await insertUser([
    new Map([
      ["table", "Users"],
      [
        "changes",
        [
          { UserID: "Research User Test 1", Team: "Team Trial" },
          { UserID: "Research User Test 2", Team: "Team Trial" },
          { UserID: "Research User Test 3", Team: "Team Test" },
        ],
      ],
    ]),
  ]);

  await insertProduct([
    new Map([
      ["table", "Product"],
      [
        "changes",
        [
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
        ],
      ],
    ]),
  ]);

  await insertSupplier([
    new Map([
      ["table", "Supplier"],
      [
        "changes",
        [
          {
            SupplierNumber: "123-456",
            SupplierName: "TEST-SUPPLIER-01",
            Currency: "AUD",
          },
        ],
      ],
    ]),
  ]);

  await insertAltIndexBySupplier([
    new Map([
      ["supplier", "123-456"],
      [
        "changes",
        [
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
        ],
      ],
    ]),
  ]);

  await deleteAltIndex([
    new Map([
      ["id", "TEST-RID-0001"],
      ["changes", { Supplier: "123-456" }],
    ]),
    new Map([
      ["id", "TEST-RID-0002"],
      ["changes", { Supplier: "123-456" }],
    ]),
    new Map([
      ["id", "TEST-RID-0003"],
      ["changes", { Supplier: "123-456" }],
    ]),
    new Map([
      ["id", "TEST-RID-0004"],
      ["changes", { Supplier: "123-456" }],
    ]),
  ]);

  await deleteSupplier([
    new Map([
      ["table", "Supplier"],
      ["changes", ["123-456"]],
    ]),
  ]);

  await deleteProduct([
    new Map([["id", "TEST-RID-0001"]]),
    new Map([["id", "TEST-RID-0002"]]),
    new Map([["id", "TEST-RID-0003"]]),
    new Map([["id", "TEST-RID-0004"]]),
  ]);

  await deleteUser([
    new Map([
      ["table", "Users"],
      [
        "changes",
        [
          "Research User Test 1",
          "Research User Test 2",
          "Research User Test 3",
        ],
      ],
    ]),
  ]);
}

async function insertAltIndexByProduct_Test() {
  await insertUser([
    new Map([
      ["table", "Users"],
      ["changes", [{ UserID: "Research User Test 3", Team: "Team Test" }]],
    ]),
  ]);

  await insertProduct([
    new Map([
      ["table", "Product"],
      [
        "changes",
        [
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
        ],
      ],
    ]),
  ]);

  await insertSupplier([
    new Map([
      ["table", "Supplier"],
      [
        "changes",
        [
          {
            SupplierNumber: "123-456",
            SupplierName: "TEST-SUPPLIER-01",
            Currency: "AUD",
          },
          {
            SupplierNumber: "123-450",
            SupplierName: "TEST-SUPPLIER-02",
            Currency: "USD",
          },
        ],
      ],
    ]),
  ]);

  await insertAltIndexByProduct([
    new Map([
      ["id", "SKU-005"],
      [
        "changes",
        [
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
        ],
      ],
    ]),
  ]);

  await deleteAltIndex([
    new Map([
      ["id", "SKU-005"],
      ["changes", { Supplier: "123-456" }],
    ]),
    new Map([
      ["id", "SKU-005"],
      ["changes", { Supplier: "123-450" }],
    ]),
  ]);

  await deleteSupplier([
    new Map([
      ["table", "Supplier"],
      ["changes", ["123-456", "123-450"]],
    ]),
  ]);

  await deleteProduct([new Map([["id", "SKU-005"]])]);

  await deleteUser([
    new Map([
      ["table", "Users"],
      ["changes", ["Research User Test 3"]],
    ]),
  ]);
}

async function insertNewProduct_Test() {
  await insertUser([
    new Map([
      ["table", "Users"],
      ["changes", [{ UserID: "Research User Test 3", Team: "Team Test" }]],
    ]),
  ]);

  await insertNewProduct([
    new Map([
      ["table", "NewProduct"],
      [
        "changes",
        [
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
        ],
      ],
    ]),
  ]);

  await deleteNewProduct([
    new Map([["id", "TEST-NEW-01"]]),
    new Map([["id", "TEST-NEW-02"]]),
    new Map([["id", "TEST-NEW-03"]]),
  ]);

  await deleteProduct([
    new Map([["id", "TEST-NEW-01"]]),
    new Map([["id", "TEST-NEW-02"]]),
    new Map([["id", "TEST-NEW-03"]]),
  ]);

  await deleteUser([
    new Map([
      ["table", "Users"],
      ["changes", ["Research User Test 3"]],
    ]),
  ]);
}

async function insertSupplier_Test() {
  await insertSupplier([
    new Map([
      ["table", "Supplier"],
      [
        "changes",
        [
          {
            SupplierNumber: "123-456",
            SupplierName: "TEST-SUPPLIER-01",
            Currency: "AUD",
          },
          {
            SupplierNumber: "123-450",
            SupplierName: "TEST-SUPPLIER-02",
            Currency: "USD",
          },
        ],
      ],
    ]),
  ]);

  await deleteSupplier([
    new Map([
      ["table", "Supplier"],
      ["changes", ["123-456", "123-450"]],
    ]),
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
}

async function updateOem_Test() {
  let update = [
    new Map([
      ["id", "SKU-005"],
      ["newValue", "1234567891"],
      ["oldValue", "1234567890"],
    ]),
    new Map([
      ["id", "TEST-RID-0004"],
      ["newValue", "1111111111"],
      ["oldValue", "2468101214"],
    ]),
  ];
  await updateOem(update);
  let backToPrevious = [
    new Map([
      ["id", "SKU-005"],
      ["newValue", "1234567890"],
      ["oldValue", "1234567891"],
    ]),
    new Map([
      ["id", "TEST-RID-0004"],
      ["newValue", "2468101214"],
      ["oldValue", "1111111111"],
    ]),
  ];
  await updateOem(backToPrevious);
}

async function updateKType_test() {
  await updateKType([
    new Map([
      ["id", "SKU-002"],
      ["oldValue", "Test-KType2"],
      ["newValue", "Test-KType999"],
    ]),
  ]);

  await updateKType([
    new Map([
      ["id", "SKU-002"],
      ["oldValue", "Test-KType999"],
      ["newValue", "Test-KType2"],
    ]),
  ]);
}

async function updateEpid_test() {
  await updateEpid([
    new Map([
      ["id", "SKU-001"],
      ["oldValue", "Test-EPID1"],
      ["newValue", "Test-EPID999"],
    ]),
  ]);

  await updateEpid([
    new Map([
      ["id", "SKU-001"],
      ["oldValue", "Test-EPID999"],
      ["newValue", "Test-EPID1"],
    ]),
  ]);
}

async function updateAltIndex_test() {
  await updateAltIndex([
    new Map([
      ["id", "TEST-RID-0003"],
      ["number", "123-456"],
      [
        "changes",
        {
          CostAud: 99.99,
          Quality: "normal",
        },
      ],
    ]),
    new Map([
      ["id", "TEST-RID-0004"],
      ["number", "123-456"],
      [
        "changes",
        {
          IsMain: 1,
          Quality: "bad",
        },
      ],
    ]),
  ]);

  await updateAltIndex([
    new Map([
      ["id", "TEST-RID-0003"],
      ["number", "123-456"],
      [
        "changes",
        {
          CostAud: 9.99,
          Quality: "good",
        },
      ],
    ]),
    new Map([
      ["id", "TEST-RID-0004"],
      ["number", "123-456"],
      [
        "changes",
        {
          IsMain: 0,
          Quality: "good",
        },
      ],
    ]),
  ]);
}
