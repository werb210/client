import { get, set, del, keys } from 'idb-keyval';

export interface ApplicationTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  businessType: string;
  createdAt: string;
  lastUsed?: string;
  formData: {
    businessDetails?: any;
    applicantInfo?: any;
    financialProfile?: any;
    preferredLenders?: string[];
    documentTypes?: string[];
  };
  usage: {
    timesUsed: number;
    successRate: number;
    avgApprovalTime: number;
  };
}

const TEMPLATES_PREFIX = 'app_template_';
const TEMPLATE_INDEX_KEY = 'app_templates_index';

class ApplicationTemplateManager {
  
  async saveTemplate(template: Omit<ApplicationTemplate, 'id' | 'createdAt' | 'usage'>): Promise<string> {
    const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullTemplate: ApplicationTemplate = {
      ...template,
      id: templateId,
      createdAt: new Date().toISOString(),
      usage: {
        timesUsed: 0,
        successRate: 0,
        avgApprovalTime: 0
      }
    };

    await set(`${TEMPLATES_PREFIX}${templateId}`, fullTemplate);
    await this.updateTemplateIndex(templateId, fullTemplate);
    
    console.log('✅ Application template saved:', templateId);
    return templateId;
  }

  async getTemplate(templateId: string): Promise<ApplicationTemplate | null> {
    try {
      const template = await get(`${TEMPLATES_PREFIX}${templateId}`);
      return template || null;
    } catch (error) {
      console.error('❌ Error getting template:', error);
      return null;
    }
  }

  async getAllTemplates(): Promise<ApplicationTemplate[]> {
    try {
      const templateIndex = await get(TEMPLATE_INDEX_KEY) || [];
      const templates = await Promise.all(
        templateIndex.map(async (templateId: string) => {
          return await this.getTemplate(templateId);
        })
      );
      
      return templates.filter(Boolean) as ApplicationTemplate[];
    } catch (error) {
      console.error('❌ Error getting all templates:', error);
      return [];
    }
  }

  async getTemplatesByIndustry(industry: string): Promise<ApplicationTemplate[]> {
    const allTemplates = await this.getAllTemplates();
    return allTemplates.filter(template => 
      template.industry.toLowerCase() === industry.toLowerCase()
    );
  }

  async getTemplatesByBusinessType(businessType: string): Promise<ApplicationTemplate[]> {
    const allTemplates = await this.getAllTemplates();
    return allTemplates.filter(template => 
      template.businessType.toLowerCase() === businessType.toLowerCase()
    );
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      await del(`${TEMPLATES_PREFIX}${templateId}`);
      await this.removeFromTemplateIndex(templateId);
      console.log('✅ Template deleted:', templateId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting template:', error);
      return false;
    }
  }

  async updateTemplate(templateId: string, updates: Partial<ApplicationTemplate>): Promise<boolean> {
    try {
      const existing = await this.getTemplate(templateId);
      if (!existing) return false;

      const updated = { ...existing, ...updates };
      await set(`${TEMPLATES_PREFIX}${templateId}`, updated);
      console.log('✅ Template updated:', templateId);
      return true;
    } catch (error) {
      console.error('❌ Error updating template:', error);
      return false;
    }
  }

  async recordTemplateUsage(templateId: string, approved: boolean, approvalTimeHours?: number): Promise<void> {
    const template = await this.getTemplate(templateId);
    if (!template) return;

    const usage = template.usage;
    usage.timesUsed += 1;
    
    if (approved) {
      const currentSuccesses = Math.floor(usage.successRate * (usage.timesUsed - 1));
      usage.successRate = (currentSuccesses + 1) / usage.timesUsed;
      
      if (approvalTimeHours) {
        const currentAvgTime = usage.avgApprovalTime * (usage.timesUsed - 1);
        usage.avgApprovalTime = (currentAvgTime + approvalTimeHours) / usage.timesUsed;
      }
    } else {
      const currentSuccesses = Math.floor(usage.successRate * (usage.timesUsed - 1));
      usage.successRate = currentSuccesses / usage.timesUsed;
    }

    await this.updateTemplate(templateId, { 
      usage,
      lastUsed: new Date().toISOString()
    });
  }

  async getPopularTemplates(limit: number = 5): Promise<ApplicationTemplate[]> {
    const allTemplates = await this.getAllTemplates();
    return allTemplates
      .sort((a, b) => b.usage.timesUsed - a.usage.timesUsed)
      .slice(0, limit);
  }

  async getHighSuccessRateTemplates(minUsage: number = 3, limit: number = 5): Promise<ApplicationTemplate[]> {
    const allTemplates = await this.getAllTemplates();
    return allTemplates
      .filter(template => template.usage.timesUsed >= minUsage)
      .sort((a, b) => b.usage.successRate - a.usage.successRate)
      .slice(0, limit);
  }

  private async updateTemplateIndex(templateId: string, template: ApplicationTemplate): Promise<void> {
    const index = await get(TEMPLATE_INDEX_KEY) || [];
    if (!index.includes(templateId)) {
      index.push(templateId);
      await set(TEMPLATE_INDEX_KEY, index);
    }
  }

  private async removeFromTemplateIndex(templateId: string): Promise<void> {
    const index = await get(TEMPLATE_INDEX_KEY) || [];
    const updatedIndex = index.filter((id: string) => id !== templateId);
    await set(TEMPLATE_INDEX_KEY, updatedIndex);
  }

  async clearAllTemplates(): Promise<void> {
    const index = await get(TEMPLATE_INDEX_KEY) || [];
    await Promise.all(index.map((templateId: string) => 
      del(`${TEMPLATES_PREFIX}${templateId}`)
    ));
    await del(TEMPLATE_INDEX_KEY);
    console.log('✅ All templates cleared');
  }

  async exportTemplates(): Promise<ApplicationTemplate[]> {
    return await this.getAllTemplates();
  }

  async importTemplates(templates: ApplicationTemplate[]): Promise<number> {
    let imported = 0;
    for (const template of templates) {
      try {
        await this.saveTemplate({
          name: template.name + ' (Imported)',
          description: template.description,
          industry: template.industry,
          businessType: template.businessType,
          formData: template.formData
        });
        imported++;
      } catch (error) {
        console.error('❌ Failed to import template:', template.name, error);
      }
    }
    console.log(`✅ Imported ${imported}/${templates.length} templates`);
    return imported;
  }
}

export const templateManager = new ApplicationTemplateManager();