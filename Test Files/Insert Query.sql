INSERT INTO AlternateIndex (AltIndexKey, MOQ, CostAud, LastUpdate, Quality, SupplierPartType, WCPPartType, ProductID, SupplierNumber, AltIndexNumber, CostCurrency)
        VALUES (NEWID(), 5, -1,
            '2023-12-23 15:45:24',
            0, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-201-I1-CS1-1E74'
              OR ResearchID = 'R-201-I1-CS1-1E74'),
            '1080',
            'AltIndex-A',
            100),(NEWID(), 10, -1,
            '2023-12-23 15:45:24',
            0, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-202-I2-Cb1-C652'
              OR ResearchID = 'R-202-I2-Cb1-C652'),
            '1080',
            'AltIndex-B',
            200),(NEWID(), 15, -1,
            '2023-12-23 15:45:24',
            0, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-203-I3-CS2-E411'
              OR ResearchID = 'R-203-I3-CS2-E411'),
            '1080',
            'AltIndex-C',
            300),(NEWID(), 20, -1,
            '2023-12-23 15:45:24',
            0, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-204-I4-Cf1-4EBF'
              OR ResearchID = 'R-204-I4-Cf1-4EBF'),
            '1080',
            'AltIndex-D',
            100),(NEWID(), 25, -1,
            '2023-12-23 15:45:24',
            0, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-205-I5-Ce1-3611'
              OR ResearchID = 'R-205-I5-Ce1-3611'),
            '1080',
            'AltIndex-E',
            200),(NEWID(), 30, -1,
            '2023-12-23 15:45:24',
            0, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-206-I6-CT1-E14F'
              OR ResearchID = 'R-206-I6-CT1-E14F'),
            '1080',
            'AltIndex-F',
            300),(NEWID(), 35, -1,
            '2023-12-23 15:45:24',
            0, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-207-I7-CE2-25E7'
              OR ResearchID = 'R-207-I7-CE2-25E7'),
            '1080',
            'AltIndex-G',
            100),(NEWID(), 40, -1,
            '2023-12-23 15:45:24',
            0, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-208-I8-CS1-DDCC'
              OR ResearchID = 'R-208-I8-CS1-DDCC'),
            '1080',
            'AltIndex-H',
            200),(NEWID(), 45, -1,
            '2023-12-23 15:45:24',
            1, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-209-I9-Cb1-DF3B'
              OR ResearchID = 'R-209-I9-Cb1-DF3B'),
            '1080',
            'AltIndex-I',
            300),(NEWID(), 50, -1,
            '2023-12-23 15:45:24',
            1, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-210-I10-CS2-83EE'
              OR ResearchID = 'R-210-I10-CS2-83EE'),
            '1080',
            'AltIndex-J',
            100),(NEWID(), 55, -1,
            '2023-12-23 15:45:24',
            1, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-211-I11-Cf1-F45F'
              OR ResearchID = 'R-211-I11-Cf1-F45F'),
            '1080',
            'AltIndex-K',
            200),(NEWID(), 60, -1,
            '2023-12-23 15:45:24',
            1, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-212-I12-Ce1-D7D8'
              OR ResearchID = 'R-212-I12-Ce1-D7D8'),
            '1080',
            'AltIndex-L',
            300),(NEWID(), 65, -1,
            '2023-12-23 15:45:24',
            1, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-213-I13-CT1-CDB0'
              OR ResearchID = 'R-213-I13-CT1-CDB0'),
            '1080',
            'AltIndex-M',
            100),(NEWID(), 70, -1,
            '2023-12-23 15:45:24',
            1, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-214-I14-CE2-13C6'
              OR ResearchID = 'R-214-I14-CE2-13C6'),
            '1080',
            'AltIndex-N',
            200),(NEWID(), 75, -1,
            '2023-12-23 15:45:24',
            1, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-215-I15-CS1-3796'
              OR ResearchID = 'R-215-I15-CS1-3796'),
            '1080',
            'AltIndex-O',
            300),(NEWID(), 80, -1,
            '2023-12-23 15:45:24',
            1, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-216-I16-Cb1-F8D8'
              OR ResearchID = 'R-216-I16-Cb1-F8D8'),
            '1080',
            'AltIndex-P',
            100),(NEWID(), 85, -1,
            '2023-12-23 15:45:24',
            1, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-217-I17-CS2-2EAA'
              OR ResearchID = 'R-217-I17-CS2-2EAA'),
            '1080',
            'AltIndex-Q',
            200),(NEWID(), 90, -1,
            '2023-12-23 15:45:24',
            0, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-218-I18-Cf1-5EDB'
              OR ResearchID = 'R-218-I18-Cf1-5EDB'),
            '1080',
            'AltIndex-R',
            300),(NEWID(), 95, -1,
            '2023-12-23 15:45:24',
            0, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-219-I19-Ce1-06AD'
              OR ResearchID = 'R-219-I19-Ce1-06AD'),
            '1080',
            'AltIndex-S',
            100),(NEWID(), 100, -1,
            '2023-12-23 15:45:24',
            0, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-220-I20-CT1-3609'
              OR ResearchID = 'R-220-I20-CT1-3609'),
            '1080',
            'AltIndex-T',
            200),(NEWID(), 105, -1,
            '2023-12-23 15:45:24',
            0, 'ENG',
            'ENGINE',
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = 'R-221-I21-CE2-7E27'
              OR ResearchID = 'R-221-I21-CE2-7E27'),
            '1080',
            'AltIndex-U',
            300);