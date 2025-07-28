# Canadian Line of Credit Maximum Amounts Analysis

## Based on Console Log Data (Current System)

From the filtering logs, here are the Canadian Line of Credit products and their maximum amounts:

### 🔗 Canadian Line of Credit Products:

1. **Flex Line (Business Line of Credit)**
   - Lender: Accord Financial
   - Range: $20,000 - $150,000
   - **Maximum: $150,000**

2. **Business Line (Business Line of Credit)**  
   - Lender: Accord Financial
   - Range: $150,000 - $250,000
   - **Maximum: $250,000**

3. **Premium Line (Business Line of Credit)**
   - Lender: Accord Financial  
   - Range: $250,000 - $500,000
   - **Maximum: $500,000**

4. **ABL Working Capital Revolver (Business Line of Credit)**
   - Lender: ABC/Asset-Based Lender
   - Range: $1,000,000 - $20,000,000
   - **Maximum: $20,000,000**

### 🎯 Summary of Canadian LOC Maximum Amounts:

- **Smallest LOC Maximum**: $150,000 (Flex Line)
- **Mid-range LOC Maximum**: $250,000 (Business Line)  
- **Large LOC Maximum**: $500,000 (Premium Line)
- **Asset-Based LOC Maximum**: $20,000,000 (ABL Working Capital Revolver)

### 💡 Why Your $600K-$800K Request Doesn't Show LOC Products:

Your funding amount of $600,000-$800,000 **exceeds** the maximum amounts for most traditional Line of Credit products:

- ❌ Flex Line: $600K > $150K maximum
- ❌ Business Line: $600K > $250K maximum  
- ❌ Premium Line: $600K > $500K maximum
- ✅ ABL Working Capital Revolver: $600K < $20M maximum (but this is Asset-Based Lending category)

**This is the correct behavior** - the LOC override rule is working properly by excluding products where your amount exceeds their maximums.

### 🔧 Working Capital Issue:

The system should show **Working Capital Loan** products which have a range of $15,000 - $800,000, perfectly fitting your $600K-$800K request. The fact that "Working Capital category not found" appears in logs indicates a category detection issue that needs fixing.