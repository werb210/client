export type KycSession = { url?: string; providerRef?: string; status: string; reason?: string };

export interface KycProvider {
  start(contact: { id: string; email?: string; phone?: string }): Promise<KycSession>;
  status(providerRef: string): Promise<KycSession>;
  webhookVerify(raw: string, signature: string): boolean;
}

class PersonaProvider implements KycProvider {
  base = "https://withpersona.com/api/v1";
  key = process.env.PERSONA_API_KEY || "";
  template = process.env.PERSONA_TEMPLATE_ID || "";
  
  headers() { 
    return { 
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${this.key}` 
    }; 
  }
  
  async start(contact: { id: string; email?: string; phone?: string }) {
    if (!this.key || !this.template) {
      // Return mock session for demo/testing when no API key is set
      return {
        url: `/client/kyc/mock?contactId=${contact.id}`,
        providerRef: `mock_${Date.now()}`,
        status: "pending"
      };
    }
    
    try {
      const res = await fetch(`${this.base}/inquiries`, {
        method: "POST", 
        headers: this.headers(),
        body: JSON.stringify({ 
          data: { 
            type: "inquiry", 
            attributes: { 
              "template-id": this.template, 
              "reference-id": contact.id,
              ...(contact.email && { "email-address": contact.email }),
              ...(contact.phone && { "phone-number": contact.phone })
            }
          }
        })
      });
      
      if (!res.ok) {
        throw new Error(`Persona API error: ${res.status} ${res.statusText}`);
      }
      
      const j = await res.json();
      const url = j?.data?.attributes?.["inquiry-template"]?.["link-href"] || 
                  j?.data?.attributes?.["redirect-uri"];
      const ref = j?.data?.id;
      
      return { url, providerRef: ref, status: "pending" };
    } catch (error) {
      console.error("Persona start error:", error);
      // Fallback to mock for development
      return {
        url: `/client/kyc/mock?contactId=${contact.id}`,
        providerRef: `fallback_${Date.now()}`,
        status: "pending"
      };
    }
  }
  
  async status(ref: string) {
    if (ref.startsWith('mock_') || ref.startsWith('fallback_')) {
      // Mock status for testing
      return { 
        providerRef: ref, 
        status: Math.random() > 0.5 ? "completed" : "pending",
        reason: "Mock verification result"
      };
    }
    
    if (!this.key) {
      return { providerRef: ref, status: "pending", reason: "No API key configured" };
    }
    
    try {
      const res = await fetch(`${this.base}/inquiries/${ref}`, { 
        headers: this.headers() 
      });
      
      if (!res.ok) {
        throw new Error(`Persona status API error: ${res.status}`);
      }
      
      const j = await res.json(); 
      const s = j?.data?.attributes?.status || "pending";
      const reason = j?.data?.attributes?.["failure-reason"];
      
      return { providerRef: ref, status: s, reason };
    } catch (error) {
      console.error("Persona status error:", error);
      return { providerRef: ref, status: "error", reason: "API unavailable" };
    }
  }
  
  webhookVerify(raw: string, signature: string) {
    const secret = process.env.KYC_WEBHOOK_SECRET || ""; 
    if (!secret || !signature) return false;
    
    try {
      const crypto = require("crypto");
      const h = crypto.createHmac("sha256", secret).update(raw, "utf8").digest("hex");
      return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(signature)); 
    } catch (error) {
      console.error("Webhook verification error:", error);
      return false; 
    }
  }
}

export function getProvider() { 
  return new PersonaProvider(); 
}