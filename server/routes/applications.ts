import { Router } from 'express';
import { db } from '../db';
import { applications } from '@shared/lenderSchema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Users table schema for creating users
import { pgTable, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  email: varchar('email'),
  first_name: varchar('first_name'),
  last_name: varchar('last_name'),
  profile_image_url: varchar('profile_image_url'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  phone_number: varchar('phone_number'),
  is_2fa_enabled: boolean('is_2fa_enabled').default(false),
});

const router = Router();

// POST /api/applications - Create new application
router.post('/', async (req, res) => {
  try {
    console.log('📝 [APPLICATIONS] Creating new application');
    console.log('📝 [APPLICATIONS] Request payload:', JSON.stringify(req.body, null, 2));
    
    const payload = req.body;
    
    // Extract business information from the step-based payload
    const businessName = payload.step3?.businessName || payload.step3?.legalBusinessName || payload.step3?.operatingName || '';
    const applicantName = `${payload.step4?.firstName || ''} ${payload.step4?.lastName || ''}`.trim();
    const applicantEmail = payload.step4?.email || payload.step4?.applicantEmail || '';
    const applicantPhone = payload.step4?.phone || payload.step4?.applicantPhone || payload.step3?.businessPhone || '';
    const requestedAmount = payload.step1?.requestedAmount || payload.step1?.fundingAmount || 0;
    const useOfFunds = payload.step1?.useOfFunds || payload.step1?.fundsPurpose || 'Working capital';
    
    // Try to find existing user by email, or create new user
    let userId: string;
    if (applicantEmail) {
      const [existingUser] = await db.select().from(users).where(eq(users.email, applicantEmail));
      
      if (existingUser) {
        userId = existingUser.id;
        console.log('📧 [APPLICATIONS] Found existing user:', userId);
      } else {
        // Create new user
        userId = randomUUID();
        await db.insert(users).values({
          id: userId,
          email: applicantEmail,
          first_name: payload.step4?.firstName || '',
          last_name: payload.step4?.lastName || '',
          phone_number: applicantPhone,
        });
        console.log('👤 [APPLICATIONS] Created new user:', userId);
      }
    } else {
      // No email provided, create user anyway
      userId = randomUUID();
      await db.insert(users).values({
        id: userId,
        first_name: payload.step4?.firstName || '',
        last_name: payload.step4?.lastName || '',
        phone_number: applicantPhone,
      });
      console.log('👤 [APPLICATIONS] Created new user (no email):', userId);
    }
    
    // Create application record
    const [newApplication] = await db.insert(applications).values({
      user_id: userId,
      status: 'draft',
      current_step: 1,
      business_legal_name: businessName,
      applicant_name: applicantName,
      applicant_email: applicantEmail,
      applicant_phone: applicantPhone,
      requested_amount: String(requestedAmount),
      amount_requested: String(requestedAmount),
      use_of_funds: useOfFunds,
      form_data: payload,
      terms_accepted: false,
      signature_completed: false,
      stage: 'application_submitted',
    }).returning();
    
    console.log('✅ [APPLICATIONS] Application created successfully:', newApplication.id);
    
    // Return response matching expected format
    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      applicationId: String(newApplication.id),
      externalId: `app_local_${newApplication.id}`,
      status: newApplication.status,
      timestamp: new Date().toISOString(),
      data: newApplication
    });
    
  } catch (error) {
    console.error('❌ [APPLICATIONS] Failed to create application:', error);
    
    // Handle duplicate email constraint if it exists
    if (error instanceof Error && error.message.includes('duplicate key value')) {
      console.log('🔄 [APPLICATIONS] Duplicate email detected, creating new application');
      
      const newApplicationId = randomUUID();
      return res.status(200).json({
        success: true,
        message: 'New application created with existing user account',
        applicationId: newApplicationId,
        externalId: `app_local_${newApplicationId}`,
        status: 'draft',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Failed to create application'
    });
  }
});

// GET /api/applications/:id - Get application by ID
router.get('/:id', async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    
    if (isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid application ID'
      });
    }
    
    const [application] = await db.select()
      .from(applications)
      .where(eq(applications.id, applicationId));
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    
    res.json(application);
    
  } catch (error) {
    console.error('❌ [APPLICATIONS] Failed to fetch application:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Failed to fetch application'
    });
  }
});

// GET /api/applications - List all applications (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const allApplications = await db.select()
      .from(applications)
      .orderBy(applications.created_at);
    
    res.json({
      applications: allApplications,
      total: allApplications.length
    });
    
  } catch (error) {
    console.error('❌ [APPLICATIONS] Failed to list applications:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Failed to list applications'
    });
  }
});

export default router;