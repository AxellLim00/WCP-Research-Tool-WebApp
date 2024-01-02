DELETE from [KeyType]
DELETE from [EPID]
DELETE from [AlternateIndex]
Delete from [Oem]
DELETE from [NewProduct]
DELETE from [Product]
DELETE from [Supplier]
DELETE from [Users]

DELETE FROM [NewProduct] WHERE ProductID IN (SELECT ID FROM [Product] WHERE [ResearchID] LIKE 'R-2%' AND [ResearchID] != 'R-2037ML-BF73')
-- DELETE FROM [AlternateIndex] WHERE ProductID IN (SELECT ID FROM [Product] WHERE [ResearchID] IS NOT NULL AND [SKU] IS NOT NULL)
DELETE from [Product] WHERE [ResearchID] LIKE 'R-2%' AND [ResearchID] != 'R-2037ML-BF73'


