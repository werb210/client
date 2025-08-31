import React from 'react'
import CategoryCards from '../../components/Step2/CategoryCards'

export default function Step2(){
  const intake = React.useMemo(() => {
    try{ return JSON.parse(localStorage.getItem('bf:intake')||'{}') }catch{ return {} }
  },[])
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold text-primary">Step 2: Lender Recommendations</h1>
      <CategoryCards intake={intake} onSelect={() => { /* optionally route to step 5 */ }} />
    </div>
  )
}