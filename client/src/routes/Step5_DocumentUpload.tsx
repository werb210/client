import React from 'react'

/**
 * Step 5 documents disabled by design:
 * - No upload UI
 * - Submission still sends documents: [] and documentStatus: "pending"
 */
export default function Step5DocumentsDisabled(props:any){
  return (
    <div style={{padding:16}}>
      <h2>Documents will be collected later</h2>
      <p>We've recorded your application. A specialist will request any needed documents.</p>
      <ul>
        <li><code>documents: []</code></li>
        <li><code>documentStatus: "pending"</code></li>
      </ul>
    </div>
  )
}