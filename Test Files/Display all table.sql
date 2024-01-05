Select * from [Users]
Select * from [Product]
Select * from [NewProduct]
Select * from [KeyType]
Select * from [EPID]
Select * from [Supplier]
Select * from [AlternateIndex]
Select * from [Oem]


Select * from [Product] Where [ResearchID] IS not NULL AND [SKU] is not NULL ORDER BY [ResearchID]
Select * from [NewProduct]
Select [ResearchID] from [NewProduct]
Select * from [AlternateIndex] ORDER BY [AltIndexNumber]

SELECT * FROM [Product] WHERE [ResearchID] LIKE 'R-2%' AND [ResearchID] Not in ('R-2037ML-BF73', 'R-2037ML-121F') ORDER BY [ResearchID]