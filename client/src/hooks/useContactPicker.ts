import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
}

interface ContactSelectOptions {
  multiple?: boolean;
  properties?: ('name' | 'email' | 'tel' | 'address' | 'icon')[];
}

interface ContactPickerAPI {
  select: (options: ContactSelectOptions) => Promise<any[]>;
}

declare global {
  interface Navigator {
    contacts?: ContactPickerAPI;
  }
}

export function useContactPicker() {
  const [isSupported] = useState(() => 'contacts' in navigator);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const selectContact = useCallback(async (options: ContactSelectOptions = {}): Promise<ContactInfo[]> => {
    if (!isSupported) {
      toast({
        title: 'Feature Not Available',
        description: 'Contact picker is not supported in this browser.',
        variant: 'destructive'
      });
      return [];
    }

    setIsLoading(true);
    try {
      const contacts = await navigator.contacts!.select({
        multiple: options.multiple || false,
        properties: options.properties || ['name', 'email', 'tel']
      });

      const formattedContacts: ContactInfo[] = contacts.map((contact: any) => ({
        name: contact.name?.[0] || '',
        email: contact.email?.[0] || '',
        phone: contact.tel?.[0] || '',
        organization: contact.address?.[0]?.organization || ''
      }));

      toast({
        title: 'Contact Selected',
        description: `Selected ${formattedContacts.length} contact(s)`,
      });

      return formattedContacts;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast({
          title: 'Selection Cancelled',
          description: 'Contact selection was cancelled.',
        });
      } else {
        console.error('Contact picker error:', error);
        toast({
          title: 'Error',
          description: 'Failed to select contact. Please try again.',
          variant: 'destructive'
        });
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, toast]);

  const selectBusinessContact = useCallback(async (): Promise<ContactInfo | null> => {
    const contacts = await selectContact({
      multiple: false,
      properties: ['name', 'email', 'tel', 'address']
    });
    
    return contacts.length > 0 ? contacts[0] : null;
  }, [selectContact]);

  const selectAccountantContact = useCallback(async (): Promise<ContactInfo | null> => {
    const contacts = await selectContact({
      multiple: false,
      properties: ['name', 'email', 'tel']
    });
    
    return contacts.length > 0 ? contacts[0] : null;
  }, [selectContact]);

  return {
    isSupported,
    isLoading,
    selectContact,
    selectBusinessContact,
    selectAccountantContact
  };
}