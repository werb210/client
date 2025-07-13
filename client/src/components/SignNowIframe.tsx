import React from 'react';

export default function SignNowIframe({ signingUrl }: { signingUrl: string }) {
  return (
    <iframe
      src={signingUrl}
      title="SignNow Document"
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      allow="camera; microphone; fullscreen"
      width="100%"
      height="700px"
      style={{ border: 'none', borderRadius: '12px' }}
    />
  );
}