USE [ResearchTool]
GO

INSERT INTO [dbo].[Supplier]
           ([SupplierNumber]
           ,[SupplierName]
           ,[Currency])
     VALUES
			('123-451'
           ,'Test Supplier 1'
           ,'AUD'),
           ('123-450'
           ,'Test Supplier 2'
           ,'USD'),
		   ('123-452'
           ,'Test Supplier 3'
           ,'EUR')
GO

USE [ResearchTool]
GO

INSERT INTO [dbo].[Users]
           ([UserID]
           ,[Team])
     VALUES
           ('Research User Test 1'
           ,'Team Trial'),
		   ('Research User Test 2'
           ,'Team Trial'),
		   ('Research User Test 3'
           ,'Team Test')
GO

USE [ResearchTool]
GO

INSERT INTO [dbo].[Product]
           ([ID]
		   ,[UserID]
           ,[ResearchID]
           ,[SKU]
           ,[Status]
           ,[OemType]
           ,[EstSales]
           ,[Note]
           ,[CostUsd]
           ,[EstCostAud]
           ,[EstSell]
           ,[Postage]
           ,[ExtGp]
           ,[ePID]
           ,[LastUpdate])
     VALUES
           (NEWID()
		   ,'Research User Test 1'
		   ,'Test-RID-1230'
           ,'TEST0'
           ,0
           ,0
           ,0
           ,'This is a testing Note'
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,'test-epid-123'
           ,GETDATE()
		   ),
		   (NEWID()
		   ,'Research User Test 1'
		   ,'Test-RID-1231'
           ,'TEST1'
           ,0
           ,0
           ,0
           ,'This is a testing Note'
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,'test-epid-123'
           ,GETDATE()
		   ),
		   (NEWID()
		   ,'Research User Test 2'
		   ,NULL
           ,'TEST2'
           ,0
           ,0
           ,0
           ,'This is a testing Note'
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,'test-epid-123'
           ,GETDATE()
		   ),
		   (NEWID()
		   ,'Research User Test 3'
		   ,'Test-RID-1233'
           ,'TEST3'
           ,0
           ,0
           ,0
           ,'This is a testing Note'
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,'test-epid-123'
           ,GETDATE()
		   ),
		   (NEWID()
		   ,'Research User Test 3'
		   ,'Test-RID-1234'
           ,'TEST4'
           ,0
           ,0
           ,0
           ,'This is a testing Note'
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,'test-epid-123'
           ,GETDATE()
		   ),
		   (NEWID()
		   ,'Research User Test 3'
		   ,'Test-RID-1235'
           ,'TEST5'
           ,0
           ,0
           ,0
           ,'This is a testing Note'
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,'test-epid-123'
           ,GETDATE()
		   ),
		   (NEWID()
		   ,'Research User Test 6'
		   ,'Test-RID-1236'
           ,'TEST0'
           ,0
           ,0
           ,0
           ,'This is a testing Note'
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,'test-epid-123'
           ,GETDATE()
		   ),
		   (NEWID()
		   ,'Research User Test 2'
		   ,'Test-RID-1235'
           ,'TEST5'
           ,0
           ,0
           ,0
           ,'This is a testing Note'
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,'test-epid-123'
           ,GETDATE()
		   ),
		   (NEWID()
		   ,'Research User Test 6'
		   ,'Test-RID-1236'
           ,NULL
           ,0
           ,0
           ,0
           ,'This is a testing Note'
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,9.99
           ,'test-epid-123'
           ,GETDATE()
		   )
GO

USE [ResearchTool]
GO

