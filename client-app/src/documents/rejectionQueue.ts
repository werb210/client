let rejectionBuffer: string[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

export function queueRejection(docName: string) {
  rejectionBuffer.push(docName);

  if (!timer) {
    timer = setTimeout(() => {
      sendAggregatedRejection(rejectionBuffer);
      rejectionBuffer = [];
      timer = null;
    }, 120000); // 2 minutes
  }
}

function sendAggregatedRejection(documents: string[]) {
  void documents;
}
