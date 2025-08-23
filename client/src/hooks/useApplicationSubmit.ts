import { useMutation } from "@tanstack/react-query";
import { createApplication, uploadDocument, finalizeApplication } from "../api/applicationApi";

export const useApplicationSubmit = () => {
  return useMutation({
    mutationFn: async ({ formData, documents }: { formData: any; documents: { file: File; category: string }[] }) => {
      // Create the application first
      const app = await createApplication(formData);

      // Upload each document sequentially
      for (const doc of documents) {
        await uploadDocument(app.id, doc.file, doc.category);
      }

      // Finalize submission (triggers OCR, lender matching, Twilio notifications)
      return await finalizeApplication(app.id);
    },
  });
};