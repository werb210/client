import { useCanon } from '@/providers/CanonProvider';
import { submitCanon } from '@/lib/submitCanon';

export default function FinalSubmit() {
  const { canon } = useCanon();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Final Application Submit</h1>
      <p className="mb-4">Ready to submit your application with {Object.keys(canon).length} fields.</p>
      <button 
        onClick={async () => {
          try {
            const { traceId } = await submitCanon(canon);
            console.log('TRACE', traceId, 'CANON_KEYS', Object.keys(canon).length);
            alert(`Submitted! traceId=${traceId}`);
          } catch (error) {
            console.error('[submit] error:', error);
            alert(`Submit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit Application
      </button>
    </div>
  );
}