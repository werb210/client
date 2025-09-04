import { ApplicationFormSchema } from '../../../shared/schema';

// Field Fidelity Analysis Tool
export function generateFieldReport() {
  const formKeys = Object.keys(ApplicationFormSchema.shape);
  const canon = JSON.parse(localStorage.getItem('bf:canon:v1') || '{}');
  const submitKeys = Object.keys(canon);
  
  const results = formKeys.map(field => ({
    field,
    in_form: true,
    in_submit_payload: submitKeys.includes(field)
  }));
  
  const coverage = (results.filter(r => r.in_submit_payload).length / results.length) * 100;
  
  console.log('=== FIELD FIDELITY REPORT ===');
  console.log(`Form fields: ${formKeys.length}`);
  console.log(`Submit fields: ${submitKeys.length}`);
  console.log(`Coverage: ${coverage.toFixed(1)}%`);
  
  return {
    results,
    formCount: formKeys.length,
    submitCount: submitKeys.length,
    coverage: coverage.toFixed(1)
  };
}

// Generate CSV diff
export function generateCSV() {
  const report = generateFieldReport();
  const csv = [
    'field,in_form,in_submit_payload',
    ...report.results.map(r => `${r.field},${r.in_form},${r.in_submit_payload}`),
    `SUMMARY,${report.formCount} fields,${report.submitCount} fields (${report.coverage}% coverage)`
  ].join('\n');
  
  console.log('=== CSV DIFF ===');
  console.log(csv);
  
  // Download as file
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'field_fidelity_diff.csv';
  a.click();
  URL.revokeObjectURL(url);
  
  return csv;
}

// Business rules check for Step-2
export function checkStep2Rules() {
  const canon = JSON.parse(localStorage.getItem('bf:canon:v1') || '{}');
  const requiredKeys = ['lookingFor', 'fundingAmount', 'businessLocation', 'fundsPurpose', 'accountsReceivableBalance'];
  
  console.log('=== STEP-2 BUSINESS RULES READINESS ===');
  requiredKeys.forEach(key => {
    const value = canon[key];
    const present = value !== undefined && value !== null && value !== '';
    console.log(`${key}: ${present ? '✅' : '❌'} (${JSON.stringify(value)})`);
  });
  
  return requiredKeys.map(key => ({
    key,
    present: canon[key] !== undefined && canon[key] !== null && canon[key] !== '',
    value: canon[key]
  }));
}