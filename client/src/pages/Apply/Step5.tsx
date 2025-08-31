import React from 'react'
import RequiredDocsPanel from '../../components/Step5/RequiredDocsPanel'

export default function Step5(){
  const UploaderTile = undefined // If you already have a tile component, import it and pass here
  
  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold text-primary">Step 5: Required Documents</h1>
      <RequiredDocsPanel UploaderTile={UploaderTile} />
    </div>
  )
}