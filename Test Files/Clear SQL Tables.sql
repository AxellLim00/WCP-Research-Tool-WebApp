DELETE from [KeyType]
DELETE from [EPID]
DELETE from [AlternateIndex]
Delete from [Oem]
DELETE from [NewProduct]
DELETE from [Product]
DELETE from [Supplier]
DELETE from [Users]

DELETE from [NewProduct] WHERE ResearchID LIKE '%test%'
DELETE from [Product] WHERE ResearchID LIKE '%test%'