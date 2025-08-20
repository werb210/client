#!/usr/bin/env python3
"""
Comprehensive Application Testing Script
Tests the complete application submission flow with real data
"""

import requests
import json
import base64
import time
import sys
from typing import Dict, Any

class ApplicationTester:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        
    def create_test_document(self, filename: str, content: str) -> str:
        """Create base64 encoded test document"""
        return base64.b64encode(content.encode('utf-8')).decode('utf-8')
    
    def test_application_submission(self) -> Dict[str, Any]:
        """Test complete application submission with comprehensive data"""
        
        print("🧪 Starting Application Test - Manufacturing Equipment Financing Scenario")
        print("=" * 70)
        
        # Test application payload with comprehensive manufacturing business data
        application_data = {
            "step1": {
                "fundingAmount": "$125000",
                "requestedAmount": "125000",
                "fundsPurpose": "equipment_financing",
                "useOfFunds": "Equipment Financing"
            },
            "step2": {
                "businessType": "manufacturing",
                "industry": "Industrial Manufacturing",
                "yearsInBusiness": "8",
                "monthlyRevenue": "$85000",
                "employeeCount": "25"
            },
            "step3": {
                "operatingName": "Precision Metal Works Ltd",
                "legalName": "Precision Metal Works Limited",
                "businessName": "Precision Metal Works Ltd",
                "legalBusinessName": "Precision Metal Works Limited",
                "businessStructure": "corporation",
                "businessType": "Corporation",
                "businessPhone": "+1-416-555-0198",
                "businessAddress": "425 Industrial Pkwy, Mississauga, ON L5T 2M3",
                "businessCity": "Mississauga",
                "businessProvince": "Ontario",
                "businessPostalCode": "L5T 2M3",
                "headquarters": "canada",
                "incorporationDate": "2016-03-15",
                "businessNumber": "123456789RC0001"
            },
            "step4": {
                "applicantFirstName": "Michael",
                "applicantLastName": "Anderson",
                "firstName": "Michael",
                "lastName": "Anderson",
                "applicantEmail": "m.anderson@precisionmetal.ca",
                "email": "m.anderson@precisionmetal.ca",
                "applicantPhone": "+1-416-555-0199",
                "phone": "+1-416-555-0199",
                "applicantDateOfBirth": "1978-08-22",
                "dob": "1978-08-22",
                "applicantSSN": "123-45-6789",
                "sin": "123456789",
                "ownershipPercentage": 75,
                "role": "President & CEO",
                "workExperience": "20 years in manufacturing and business management",
                "address": "45 Maple Grove Rd, Burlington, ON L7L 4X8"
            },
            "step5": {
                "bankName": "Royal Bank of Canada",
                "accountType": "business_checking",
                "accountNumber": "****7890",
                "routingNumber": "003-12345",
                "monthlyDeposits": "$75000",
                "averageBalance": "$45000",
                "bankingRelationship": "8 years"
            },
            "step6": {
                "equipmentType": "CNC Machining Center",
                "equipmentCost": "$125000",
                "supplier": "Haas Automation Inc",
                "equipmentModel": "VF-3SS",
                "installationDate": "2024-12-15",
                "warranty": "2 years full warranty",
                "expectedROI": "18 months payback period"
            },
            "documents": [
                {
                    "type": "bank_statements",
                    "filename": "RBC_Business_Statements_6months.pdf",
                    "content": self.create_test_document("RBC_Business_Statements_6months.pdf", 
                        "ROYAL BANK OF CANADA - BUSINESS ACCOUNT STATEMENTS\\n" +
                        "Account Holder: Precision Metal Works Limited\\n" +
                        "Account Number: ****7890\\n" +
                        "Period: June 2024 - November 2024\\n" +
                        "\\n" +
                        "Monthly Average Balance: $42,000\\n" +
                        "Monthly Deposits: $72,000 - $85,000\\n" +
                        "Account Status: Active - Good Standing\\n" +
                        "\\n" +
                        "June 2024: Opening Balance $38,500, Deposits $72,450, Closing $41,200\\n" +
                        "July 2024: Opening Balance $41,200, Deposits $78,900, Closing $45,800\\n" +
                        "August 2024: Opening Balance $45,800, Deposits $82,100, Closing $48,300\\n" +
                        "September 2024: Opening Balance $48,300, Deposits $85,200, Closing $51,600\\n" +
                        "October 2024: Opening Balance $51,600, Deposits $84,700, Closing $49,900\\n" +
                        "November 2024: Opening Balance $49,900, Deposits $83,500, Closing $47,200"
                    )
                },
                {
                    "type": "tax_returns", 
                    "filename": "Corporate_Tax_Returns_2021-2023.pdf",
                    "content": self.create_test_document("Corporate_Tax_Returns_2021-2023.pdf",
                        "CANADA REVENUE AGENCY - CORPORATE TAX RETURNS\\n" +
                        "Business Name: Precision Metal Works Limited\\n" +
                        "BN: 123456789RC0001\\n" +
                        "\\n" +
                        "2023 Tax Year:\\n" +
                        "Gross Revenue: $1,024,000\\n" +
                        "Net Income: $156,800\\n" +
                        "Tax Paid: $39,200\\n" +
                        "Status: Filed and Paid\\n" +
                        "\\n" +
                        "2022 Tax Year:\\n" +
                        "Gross Revenue: $945,000\\n" +
                        "Net Income: $142,000\\n" +
                        "Tax Paid: $35,500\\n" +
                        "Status: Filed and Paid\\n" +
                        "\\n" +
                        "2021 Tax Year:\\n" +
                        "Gross Revenue: $878,000\\n" +
                        "Net Income: $131,700\\n" +
                        "Tax Paid: $32,900\\n" +
                        "Status: Filed and Paid"
                    )
                },
                {
                    "type": "financial_statements",
                    "filename": "Financial_Statements_Q3_2024.pdf", 
                    "content": self.create_test_document("Financial_Statements_Q3_2024.pdf",
                        "PRECISION METAL WORKS LIMITED\\n" +
                        "FINANCIAL STATEMENTS - Q3 2024\\n" +
                        "Prepared by: Anderson & Associates CPA\\n" +
                        "\\n" +
                        "BALANCE SHEET (as of September 30, 2024)\\n" +
                        "ASSETS:\\n" +
                        "Current Assets: $285,000\\n" +
                        "Cash and Equivalents: $47,200\\n" +
                        "Accounts Receivable: $142,800\\n" +
                        "Inventory: $95,000\\n" +
                        "\\n" +
                        "Fixed Assets: $425,000\\n" +
                        "Equipment (net): $380,000\\n" +
                        "Building Improvements: $45,000\\n" +
                        "\\n" +
                        "Total Assets: $710,000\\n" +
                        "\\n" +
                        "LIABILITIES:\\n" +
                        "Current Liabilities: $85,000\\n" +
                        "Long-term Debt: $245,000\\n" +
                        "Total Liabilities: $330,000\\n" +
                        "\\n" +
                        "EQUITY: $380,000\\n" +
                        "\\n" +
                        "INCOME STATEMENT (Q3 2024)\\n" +
                        "Revenue: $256,000\\n" +
                        "Cost of Goods Sold: $153,600\\n" +
                        "Gross Profit: $102,400\\n" +
                        "Operating Expenses: $68,200\\n" +
                        "Net Income: $34,200"
                    )
                },
                {
                    "type": "business_license",
                    "filename": "Business_License_Ontario.pdf",
                    "content": self.create_test_document("Business_License_Ontario.pdf",
                        "GOVERNMENT OF ONTARIO\\n" +
                        "BUSINESS REGISTRATION\\n" +
                        "\\n" +
                        "Business Name: Precision Metal Works Limited\\n" +
                        "Registration Number: 1234567890\\n" +
                        "Business Number: 123456789RC0001\\n" +
                        "\\n" +
                        "Business Type: Corporation\\n" +
                        "NAICS Code: 332710 - Machine Shops\\n" +
                        "\\n" +
                        "Registered Address: 425 Industrial Pkwy, Mississauga, ON L5T 2M3\\n" +
                        "\\n" +
                        "Date of Incorporation: March 15, 2016\\n" +
                        "Status: Active\\n" +
                        "\\n" +
                        "Officers:\\n" +
                        "President: Michael Anderson (75% ownership)\\n" +
                        "Secretary-Treasurer: Sarah Chen (25% ownership)\\n" +
                        "\\n" +
                        "Valid Until: March 15, 2025\\n" +
                        "License Status: Active and in Good Standing"
                    )
                },
                {
                    "type": "equipment_quote",
                    "filename": "Haas_CNC_Equipment_Quote.pdf", 
                    "content": self.create_test_document("Haas_CNC_Equipment_Quote.pdf",
                        "HAAS AUTOMATION INC\\n" +
                        "EQUIPMENT QUOTATION\\n" +
                        "\\n" +
                        "Quote #: HAS-2024-11-1847\\n" +
                        "Date: November 15, 2024\\n" +
                        "Valid Until: February 15, 2025\\n" +
                        "\\n" +
                        "Customer: Precision Metal Works Limited\\n" +
                        "Address: 425 Industrial Pkwy, Mississauga, ON L5T 2M3\\n" +
                        "Contact: Michael Anderson\\n" +
                        "\\n" +
                        "EQUIPMENT SPECIFICATION:\\n" +
                        "Model: VF-3SS Vertical Machining Center\\n" +
                        "Serial Number: To be assigned\\n" +
                        "\\n" +
                        "PRICING:\\n" +
                        "Machine Base Price: $118,000\\n" +
                        "Optional Equipment: $4,500\\n" +
                        "Installation & Setup: $2,500\\n" +
                        "\\n" +
                        "Total Equipment Cost: $125,000\\n" +
                        "\\n" +
                        "DELIVERY: 8-10 weeks from order\\n" +
                        "WARRANTY: 2 years parts and service\\n" +
                        "\\n" +
                        "FINANCING: Available through Haas Capital or third-party lenders"
                    )
                }
            ]
        }
        
        print(f"📋 Test Application Details:")
        print(f"   Business: {application_data['step3']['operatingName']}")
        print(f"   Amount: {application_data['step1']['fundingAmount']}")
        print(f"   Purpose: {application_data['step1']['useOfFunds']}")
        print(f"   Documents: {len(application_data['documents'])} files")
        print()
        
        # Submit application
        print("🚀 Submitting application...")
        try:
            response = self.session.post(
                f"{self.base_url}/api/public/applications",
                json=application_data,
                headers={
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'x-allow-duplicate': 'true'  # Test account bypass
                },
                timeout=30
            )
            
            print(f"📡 Response Status: {response.status_code}")
            print(f"📡 Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ APPLICATION SUBMITTED SUCCESSFULLY!")
                print(f"   Application ID: {result.get('applicationId', 'N/A')}")
                print(f"   External ID: {result.get('externalId', 'N/A')}")
                print(f"   Status: {result.get('status', 'N/A')}")
                print(f"   Timestamp: {result.get('timestamp', 'N/A')}")
                return {"success": True, "data": result, "status_code": response.status_code}
            else:
                error_text = response.text
                print(f"❌ APPLICATION SUBMISSION FAILED!")
                print(f"   Status Code: {response.status_code}")
                print(f"   Error Response: {error_text}")
                return {"success": False, "error": error_text, "status_code": response.status_code}
                
        except requests.exceptions.RequestException as e:
            print(f"❌ REQUEST FAILED: {str(e)}")
            return {"success": False, "error": str(e), "status_code": None}
    
    def test_lender_products_endpoint(self) -> Dict[str, Any]:
        """Test lender products endpoint"""
        print("\n🔍 Testing Lender Products Endpoint...")
        try:
            response = self.session.get(f"{self.base_url}/api/public/lenders", timeout=10)
            print(f"📡 Products Endpoint Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        print(f"✅ Retrieved {len(data)} lender products")
                        return {"success": True, "products_count": len(data)}
                    else:
                        print(f"✅ Retrieved products data: {type(data)}")
                        return {"success": True, "data_type": str(type(data))}
                except json.JSONDecodeError:
                    print("❌ Invalid JSON response from products endpoint")
                    return {"success": False, "error": "Invalid JSON"}
            else:
                error_text = response.text[:200] + "..." if len(response.text) > 200 else response.text
                print(f"❌ Products endpoint error: {error_text}")
                return {"success": False, "error": error_text, "status_code": response.status_code}
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Products endpoint request failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def run_comprehensive_test(self) -> Dict[str, Any]:
        """Run complete application test suite"""
        print("🧪 COMPREHENSIVE APPLICATION TEST SUITE")
        print("=" * 70)
        
        results = {}
        
        # Test 1: Lender Products Endpoint
        results["lender_products"] = self.test_lender_products_endpoint()
        
        # Test 2: Application Submission
        results["application_submission"] = self.test_application_submission()
        
        # Test Summary
        print("\n" + "=" * 70)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 70)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result.get("success") else "❌ FAIL"
            print(f"{test_name.replace('_', ' ').title()}: {status}")
            if not result.get("success"):
                print(f"   Error: {result.get('error', 'Unknown error')}")
        
        return results

if __name__ == "__main__":
    tester = ApplicationTester()
    results = tester.run_comprehensive_test()
    
    # Exit with error code if any tests failed
    exit_code = 0 if all(r.get("success", False) for r in results.values()) else 1
    sys.exit(exit_code)