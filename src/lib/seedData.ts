/**
 * @file src/lib/seedData.ts
 * @description Database seeding helper to clear existing records and populate the CRM with demo users, contacts, deals, tasks, and notes.
 */

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dbConnect from './dbConnect';
import User from '@/models/user';
import Contact from '@/models/contact';
import Deal from '@/models/deal';
import Task from '@/models/task';
import Note from '@/models/note';


/**
 * Result payload containing collections of successfully seeded documents.
 */
export interface SeedResult {
  users: unknown[];
  contacts: unknown[];
  deals: unknown[];
  tasks: unknown[];
  notes: unknown[];
}

/**
 * Truncates all existing collections (Users, Contacts, Deals, Tasks, Notes) 
 * and inserts demo records with pre-hashed credentials.
 * 
 * @returns {Promise<SeedResult>} Resolves with the created demo documents list
 */
export async function seedDatabase(): Promise<SeedResult> {
  try {
    await dbConnect();

    // Clear existing data
    await Task.deleteMany({});
    await Deal.deleteMany({});
    await Contact.deleteMany({});
    await User.deleteMany({});
    await Note.deleteMany({});

    const db = mongoose.connection.db;
    if (db) {
      await db.collection('accounts').deleteMany({});
      await db.collection('sessions').deleteMany({});
    }

    console.log('🧹 Cleared existing data...');

    // Create users with hashed passwords
    const hashedPassword = await bcrypt.hash('vedantjadhav880', 10);

    const users = await Promise.all([
      User.create({
        email: 'vedantjadhav880@gmail.com',
        password: hashedPassword,
        name: 'John Doe',
        role: 'admin',
        company: 'TechCorp Inc.',
        phone: '+1-555-0101',
        bio: 'Experienced sales manager with 10+ years in B2B software sales.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          dealUpdates: true,
          taskReminders: true,
          contactActivities: false,
          weeklyReports: true
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          loginHistory: true
        },
        language: 'en',
        timezone: 'UTC'
      }),
      User.create({
        email: 'jane.smith@example.com',
        password: hashedPassword,
        name: 'Jane Smith',
        role: 'user',
        company: 'TechCorp Inc.',
        phone: '+1-555-0102',
        bio: 'Customer success specialist focused on client retention and growth.',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        notifications: {
          emailNotifications: true,
          pushNotifications: false,
          dealUpdates: true,
          taskReminders: true,
          contactActivities: false,
          weeklyReports: true
        },
        security: {
          twoFactorAuth: true,
          sessionTimeout: 30,
          loginHistory: true
        },
        language: 'en',
        timezone: 'America/New_York'
      }),
      User.create({
        email: 'mike.johnson@example.com',
        password: hashedPassword,
        name: 'Mike Johnson',
        role: 'user',
        company: 'TechCorp Inc.',
        phone: '+1-555-0103',
        bio: 'Business development representative specializing in enterprise accounts.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        notifications: {
          emailNotifications: false,
          pushNotifications: true,
          dealUpdates: true,
          taskReminders: true,
          contactActivities: false,
          weeklyReports: true
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          loginHistory: true
        },
        language: 'en',
        timezone: 'America/Los_Angeles'
      })
    ]);

    if (db) {
      await Promise.all(
        users.map((user) =>
          db.collection('accounts').insertOne({
            userId: user._id.toString(),
            accountId: user._id.toString(),
            providerId: 'credential',
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        )
      );
    }

    console.log('👥 Created users...');

    // Create base contacts (all owned by users[0]._id)
    const baseContacts = await Promise.all([
      // Contacts for John Doe (user 1)
      Contact.create({
        name: 'Sarah Wilson',
        email: 'sarah.wilson@acmecorp.com',
        phone: '+1-555-1001',
        company: 'Acme Corporation',
        position: 'VP of Technology',
        notes: 'Interested in enterprise solutions. Has budget approval for Q4.',
        userId: users[0]._id
      }),
      Contact.create({
        name: 'David Chen',
        email: 'david.chen@globotech.com',
        phone: '+1-555-1002',
        company: 'GloboTech Solutions',
        position: 'IT Director',
        notes: 'Currently evaluating vendors. Price-sensitive but quality-focused.',
        userId: users[0]._id
      }),
      Contact.create({
        name: 'Emily Rodriguez',
        email: 'emily.r@innovateplus.com',
        phone: '+1-555-1003',
        company: 'InnovatePlus Ltd',
        position: 'Chief Technology Officer',
        notes: 'Technical decision maker. Prefers open-source solutions.',
        userId: users[0]._id
      }),
      Contact.create({
        name: 'Robert Thompson',
        email: 'r.thompson@megasystems.com',
        phone: '+1-555-1004',
        company: 'MegaSystems Inc',
        position: 'Senior Manager',
        notes: 'Long sales cycle expected. Multiple stakeholders involved.',
        userId: users[0]._id
      }),

      // Contacts reassigned to John Doe (originally Jane Smith)
      Contact.create({
        name: 'Lisa Park',
        email: 'lisa.park@startupx.com',
        phone: '+1-555-2001',
        company: 'StartupX',
        position: 'Founder & CEO',
        notes: 'Fast-growing startup. Looking for scalable solutions.',
        userId: users[0]._id
      }),
      Contact.create({
        name: 'Alex Martinez',
        email: 'a.martinez@futuretech.com',
        phone: '+1-555-2002',
        company: 'FutureTech Innovations',
        position: 'Product Manager',
        notes: 'Interested in API integration capabilities.',
        userId: users[0]._id
      }),
      Contact.create({
        name: 'Rachel Green',
        email: 'rachel.green@digitalwave.com',
        phone: '+1-555-2003',
        company: 'DigitalWave Media',
        position: 'Operations Director',
        notes: 'Needs implementation support. Budget allocated for training.',
        userId: users[0]._id
      }),

      // Contacts reassigned to John Doe (originally Mike Johnson)
      Contact.create({
        name: 'Thomas Anderson',
        email: 't.anderson@matrix-corp.com',
        phone: '+1-555-3001',
        company: 'Matrix Corporation',
        position: 'Senior Architect',
        notes: 'Technical evaluator. Concerned about security and compliance.',
        userId: users[0]._id
      }),
      Contact.create({
        name: 'Jennifer White',
        email: 'j.white@cloudnine.com',
        phone: '+1-555-3002',
        company: 'CloudNine Solutions',
        position: 'VP Sales',
        notes: 'Potential partner opportunity. Interested in reseller program.',
        userId: users[0]._id
      }),
      Contact.create({
        name: 'Kevin Brown',
        email: 'kevin.brown@nextgen.com',
        phone: '+1-555-3003',
        company: 'NextGen Dynamics',
        position: 'CTO',
        notes: 'Early adopter of new technology. Influences industry trends.',
        userId: users[0]._id
      })
    ]);

    // Create extra contacts for John Doe programmatically to reach 30+ contacts
    const extraContactData = [
      { name: 'Michael Scott', email: 'm.scott@dundermifflin.com', phone: '+1-555-4001', company: 'Dunder Mifflin Paper Co', position: 'Regional Manager', notes: 'Enthusiastic but disorganized. Enjoys comedy and coffee.' },
      { name: 'Jim Halpert', email: 'j.halpert@dundermifflin.com', phone: '+1-555-4002', company: 'Dunder Mifflin Paper Co', position: 'Sales Representative', notes: 'Competent and charming. Interested in modern collaboration software.' },
      { name: 'Pam Beesly', email: 'p.beesly@dundermifflin.com', phone: '+1-555-4003', company: 'Dunder Mifflin Paper Co', position: 'Office Administrator', notes: 'Key gatekeeper. Very helpful and artistic.' },
      { name: 'Dwight Schrute', email: 'd.schrute@dundermifflin.com', phone: '+1-555-4004', company: 'Schrute Farms', position: 'Owner & Sales Lead', notes: 'Extremely detail-oriented. Demands high security and reliability.' },
      { name: 'Angela Martin', email: 'a.martin@dundermifflin.com', phone: '+1-555-4005', company: 'Dunder Mifflin Paper Co', position: 'Head Accountant', notes: 'Very strict requirements. Focuses heavily on pricing audits.' },
      { name: 'Oscar Martinez', email: 'o.martinez@dundermifflin.com', phone: '+1-555-4006', company: 'Dunder Mifflin Paper Co', position: 'Senior Accountant', notes: 'Highly analytical. Requests extensive ROI data.' },
      { name: 'Stanley Hudson', email: 's.hudson@dundermifflin.com', phone: '+1-555-4007', company: 'Dunder Mifflin Paper Co', position: 'Sales Representative', notes: 'Prefers quick meetings and straightforward pricing.' },
      { name: 'Phyllis Vance', email: 'p.vance@vancerefrigeration.com', phone: '+1-555-4008', company: 'Vance Refrigeration', position: 'Sales Executive', notes: 'Friendly and well-connected. Enjoys personal chats.' },
      { name: 'Ryan Howard', email: 'r.howard@wupfh.com', phone: '+1-555-4009', company: 'WUPFH Inc', position: 'Founder', notes: 'Looking for bleeding-edge AI features and API integrations.' },
      { name: 'Kelly Kapoor', email: 'k.kapoor@dundermifflin.com', phone: '+1-555-4010', company: 'Dunder Mifflin Paper Co', position: 'Customer Service Rep', notes: 'Focuses heavily on customer support response times.' },
      { name: 'Toby Flenderson', email: 't.flenderson@dundermifflin.com', phone: '+1-555-4011', company: 'Dunder Mifflin Paper Co', position: 'HR Manager', notes: 'Concerned with compliance, data privacy, and access controls.' },
      { name: 'Creed Bratton', email: 'c.bratton@scrantonstrangler.com', phone: '+1-555-4012', company: 'Quality Assurance Inc', position: 'QA Director', notes: 'Unpredictable requirements. Prefers simple billing.' },
      { name: 'Meredith Palmer', email: 'm.palmer@dundermifflin.com', phone: '+1-555-4013', company: 'Dunder Mifflin Paper Co', position: 'Supplier Relations', notes: 'Interested in discount structures and bulk purchasing.' },
      { name: 'Andy Bernard', email: 'a.bernard@cornell.edu', phone: '+1-555-4014', company: 'Cornell Alumni Association', position: 'Relations Manager', notes: 'Extremely talkative. Loves customization and personal service.' },
      { name: 'Erin Hannon', email: 'e.hannon@dundermifflin.com', phone: '+1-555-4015', company: 'Dunder Mifflin Paper Co', position: 'Receptionist', notes: 'Gatekeeper. Requires friendly and clear documentation.' },
      { name: 'Darryl Philbin', email: 'd.philbin@athlead.com', phone: '+1-555-4016', company: 'Athlead Sports', position: 'Operations VP', notes: 'Needs logistics tracking and mobile dashboard access.' },
      { name: 'Gabe Lewis', email: 'g.lewis@sabre.com', phone: '+1-555-4017', company: 'Sabre Corp', position: 'Liaison Director', notes: 'Adheres strictly to procedures and compliance audits.' },
      { name: 'Nellie Bertram', email: 'n.bertram@sabre.com', phone: '+1-555-4018', company: 'Sabre Corp', position: 'Special Projects VP', notes: 'Highly ambitious. Interested in rapid rollout options.' },
      { name: 'Robert California', email: 'r.california@sabre.com', phone: '+1-555-4019', company: 'Sabre Corp', position: 'CEO', notes: 'Philosophical negotiator. Looking for high-level strategic alignment.' },
      { name: 'Jan Levinson', email: 'j.levinson@whitecandles.com', phone: '+1-555-4020', company: 'White Candles Co', position: 'President', notes: 'Extremely demanding timeline. High standards for support.' },
      { name: 'Roy Anderson', email: 'r.anderson@scrantontransport.com', phone: '+1-555-4021', company: 'Scranton Transport Ltd', position: 'Logistics Manager', notes: 'Wants simple, offline-capable mobile app features.' },
      { name: 'Karen Filippelli', email: 'k.filippelli@dundermifflin.com', phone: '+1-555-4022', company: 'Dunder Mifflin Utica', position: 'Branch Manager', notes: 'Very professional. Asks detailed questions about data migration.' },
      { name: 'Holly Flax', email: 'h.flax@dundermifflin.com', phone: '+1-555-4023', company: 'Dunder Mifflin Nashua', position: 'HR Representative', notes: 'Extremely helpful and focused on ease of onboarding.' },
      { name: 'David Wallace', email: 'd.wallace@suckit.com', phone: '+1-555-4024', company: 'SuckIt Enterprises', position: 'Investor', notes: 'High budget capacity. Looking for premium enterprise agreements.' },
      { name: 'Todd Packer', email: 't.packer@dundermifflin.com', phone: '+1-555-4025', company: 'Dunder Mifflin Paper Co', position: 'Traveling Sales', notes: 'Wants fast, mobile CRM dashboards for road trips.' },
      { name: 'Charles Miner', email: 'c.miner@saticoypaper.com', phone: '+1-555-4026', company: 'Saticoy Paper Co', position: 'VP of Operations', notes: 'No-nonsense executive. Demands strict milestones and clear metrics.' },
      { name: 'Jo Bennett', email: 'j.bennett@sabre.com', phone: '+1-555-4027', company: 'Sabre Corp', position: 'Chairwoman', notes: 'Direct and decisive. Values integrity and long-term contracts.' },
      { name: 'Clark Green', email: 'c.green@dundermifflin.com', phone: '+1-555-4028', company: 'Dunder Mifflin Paper Co', position: 'Sales Associate', notes: 'Tech-savvy. Eager to use the AI summary and email writer.' },
      { name: 'Pete Miller', email: 'p.miller@dundermifflin.com', phone: '+1-555-4029', company: 'Dunder Mifflin Paper Co', position: 'Customer Success', notes: 'Focuses on user retention metrics and customer health.' }
    ];

    const extraContacts = await Promise.all(
      extraContactData.map(c => Contact.create({ ...c, userId: users[0]._id }))
    );

    const contacts = [...baseContacts, ...extraContacts];

    console.log(`📇 Created contacts (total: ${contacts.length})...`);

    const now = new Date();
    const getFutureDate = (monthsAhead: number, day: number) => {
      return new Date(now.getFullYear(), now.getMonth() + monthsAhead, day);
    };

    // Create base deals (all reassigned to users[0]._id)
    const baseDeals = await Promise.all([
      // Deals for John Doe
      Deal.create({
        title: 'Acme Enterprise Software License',
        description: 'Annual enterprise license for 500 users including premium support',
        value: 125000,
        stage: 'proposal',
        probability: 75,
        expectedCloseDate: getFutureDate(0, 15),
        contactName: contacts[0].name,
        company: contacts[0].company,
        contactId: contacts[0]._id,
        userId: users[0]._id,
        priority: 'high'
      }),
      Deal.create({
        title: 'GloboTech Integration Project',
        description: 'Custom integration with existing ERP system',
        value: 85000,
        stage: 'proposal',
        probability: 60,
        expectedCloseDate: getFutureDate(1, 30),
        contactName: contacts[1].name,
        company: contacts[1].company,
        contactId: contacts[1]._id,
        userId: users[0]._id,
        priority: 'medium'
      }),
      Deal.create({
        title: 'InnovatePlus Consulting Services',
        description: 'Implementation and training services for Q1 rollout',
        value: 45000,
        stage: 'qualified',
        probability: 40,
        expectedCloseDate: getFutureDate(2, 15),
        contactName: contacts[2].name,
        company: contacts[2].company,
        contactId: contacts[2]._id,
        userId: users[0]._id,
        priority: 'low'
      }),
      Deal.create({
        title: 'MegaSystems Annual Contract',
        description: 'Multi-year contract with professional services',
        value: 250000,
        stage: 'new',
        probability: 25,
        expectedCloseDate: getFutureDate(5, 5),
        contactName: contacts[3].name,
        company: contacts[3].company,
        contactId: contacts[3]._id,
        userId: users[0]._id,
        priority: 'high'
      }),

      // Deals reassigned to John Doe (originally Jane Smith)
      Deal.create({
        title: 'StartupX Growth Package',
        description: 'Scalable solution for rapid growth phase',
        value: 35000,
        stage: 'won',
        probability: 100,
        expectedCloseDate: getFutureDate(-2, 15),
        contactName: contacts[4].name,
        company: contacts[4].company,
        contactId: contacts[4]._id,
        userId: users[0]._id,
        priority: 'medium'
      }),
      Deal.create({
        title: 'FutureTech API License',
        description: 'Premium API access with custom endpoints',
        value: 55000,
        stage: 'proposal',
        probability: 80,
        expectedCloseDate: getFutureDate(1, 1),
        contactName: contacts[5].name,
        company: contacts[5].company,
        contactId: contacts[5]._id,
        userId: users[0]._id,
        priority: 'high'
      }),
      Deal.create({
        title: 'DigitalWave Implementation',
        description: 'Full implementation with training and support',
        value: 95000,
        stage: 'proposal',
        probability: 65,
        expectedCloseDate: getFutureDate(2, 15),
        contactName: contacts[6].name,
        company: contacts[6].company,
        contactId: contacts[6]._id,
        userId: users[0]._id,
        priority: 'low'
      }),

      // Deals reassigned to John Doe (originally Mike Johnson)
      Deal.create({
        title: 'Matrix Security Audit',
        description: 'Comprehensive security assessment and compliance review',
        value: 15000,
        stage: 'qualified',
        probability: 50,
        expectedCloseDate: getFutureDate(3, 30),
        contactName: contacts[7].name,
        company: contacts[7].company,
        contactId: contacts[7]._id,
        userId: users[0]._id,
        priority: 'medium'
      }),
      Deal.create({
        title: 'CloudNine Partnership Agreement',
        description: 'Strategic partnership and reseller agreement',
        value: 75000,
        stage: 'qualified',
        probability: 70,
        expectedCloseDate: getFutureDate(0, 25),
        contactName: contacts[8].name,
        company: contacts[8].company,
        contactId: contacts[8]._id,
        userId: users[0]._id,
        priority: 'high'
      }),
      Deal.create({
        title: 'NextGen Innovation Lab',
        description: 'Pilot program for next-generation features',
        value: 120000,
        stage: 'lost',
        probability: 0,
        expectedCloseDate: getFutureDate(-1, 28),
        contactName: contacts[9].name,
        company: contacts[9].company,
        contactId: contacts[9]._id,
        userId: users[0]._id,
        priority: 'low'
      })
    ]);

    // Create extra deals programmatically (all owned by users[0]._id)
    const extraDealsData = [
      { title: 'Dunder Mifflin Scranton License', description: 'Enterprise paper distribution software rollout', value: 85000, stage: 'new', probability: 20 },
      { title: 'Schrute Farms E-Commerce Setup', description: 'Agritourism booking engine and billing platform', value: 35000, stage: 'qualified', probability: 45 },
      { title: 'Vance Refrigeration Smart Cabinets', description: 'IoT monitoring pipeline dashboard connection', value: 110000, stage: 'proposal', probability: 65 },
      { title: 'WUPFH Social Suite', description: 'Multi-channel messaging API implementation', value: 25000, stage: 'lost', probability: 0 },
      { title: 'Sabre Printer Management Rollout', description: 'Enterprise-wide print security control suite', value: 310000, stage: 'won', probability: 100 },
      { title: 'Saticoy Operations Integration', description: 'ERP integration for mid-Atlantic facilities', value: 145000, stage: 'proposal', probability: 70 },
      { title: 'SuckIt Patent Acquisition CRM', description: 'Custom deal flow tracking dashboard for new patents', value: 500000, stage: 'proposal', probability: 55 },
      { title: 'Athlead Mobile CRM Rollout', description: 'SaaS licenses for client-facing BDR teams', value: 65000, stage: 'new', probability: 10 },
      { title: 'Dunder Mifflin Utica CRM Migration', description: 'Data migration and custom API synchronization', value: 40000, stage: 'qualified', probability: 40 },
      { title: 'Dunder Mifflin Nashua Support Pack', description: 'Premium developer support agreement', value: 15000, stage: 'won', probability: 100 },
      { title: 'White Candles E-Store Expansion', description: 'Retail pipeline and distribution dashboard setup', value: 75000, stage: 'new', probability: 15 },
      { title: 'Scranton Transport Telematics Sync', description: 'Real-time logistics maps dashboard connection', value: 120000, stage: 'qualified', probability: 50 },
      { title: 'Cornell Alumni CRM Expansion', description: 'Custom landing pages and donor pipeline setup', value: 95000, stage: 'proposal', probability: 60 },
      { title: 'Quality Assurance Compliance Audit', description: 'Automated test suite integration licensing', value: 20000, stage: 'won', probability: 100 },
      { title: 'Dunder Mifflin Albany Migration', description: 'Legacy database schema mapping and import', value: 38000, stage: 'new', probability: 25 },
      { title: 'Sabre Tablet Software Suite', description: 'Custom UI development for Sabre-OS tablets', value: 220000, stage: 'lost', probability: 0 },
      { title: 'Dunder Mifflin Buffalo Renewal', description: 'Annual SaaS subscription renewal for 150 seats', value: 45000, stage: 'won', probability: 100 },
      { title: 'Dunder Mifflin Stamford Integration', description: 'Cloud phone system custom API integration', value: 30000, stage: 'qualified', probability: 35 },
      { title: 'Dunder Mifflin Akron Pilot Program', description: '3-month pilot for advanced AI auto-replies', value: 12000, stage: 'new', probability: 15 },
      { title: 'Vance Logistics Tracking System', description: 'Warehouse operations inventory dashboard', value: 175000, stage: 'proposal', probability: 70 },
      { title: 'Dunder Mifflin Corporate Dashboard', description: 'Executive level pipeline visualization platform', value: 240000, stage: 'proposal', probability: 80 },
      { title: 'Scranton Business Alliance Sponsorship', description: 'Community outreach event pipeline integration', value: 5000, stage: 'won', probability: 100 },
      { title: 'Michael Scott Paper Co Salvage', description: 'Buyout transition pipeline and contact mapping', value: 18000, stage: 'won', probability: 100 },
      { title: 'Schrute Beet Juice E-Shop', description: 'Organic farm subscription box custom cart setup', value: 28000, stage: 'qualified', probability: 45 },
      { title: 'Athlead Brand Consulting Deal', description: 'Influencer marketing pipeline setup', value: 90000, stage: 'lost', probability: 0 },
      { title: 'Dunder Mifflin Syracuse Expansion', description: 'Regional CRM rollout for sales representatives', value: 115000, stage: 'proposal', probability: 75 },
      { title: 'Sabre Home Tech Portal', description: 'Customer self-service portal configuration', value: 130000, stage: 'new', probability: 30 }
    ];

    const extraDeals = await Promise.all(extraDealsData.map((d, index) => {
      // Use the newly created extra contacts for John Doe (which start at index 10)
      const contactIndex = 10 + (index % extraContacts.length);
      const contact = contacts[contactIndex];
      const priorityVal = index % 3 === 0 ? 'high' : index % 3 === 1 ? 'medium' : 'low';
      return Deal.create({
        title: d.title,
        description: d.description,
        value: d.value,
        stage: d.stage,
        probability: d.probability,
        expectedCloseDate: getFutureDate(0, 5 + (index * 7) % 25),
        contactName: contact.name,
        company: contact.company,
        contactId: contact._id,
        userId: users[0]._id,
        priority: priorityVal,
        lastActivity: 'Emailed contact regarding proposal details'
      });
    }));

    const deals = [...baseDeals, ...extraDeals];

    console.log(`💼 Created deals (total: ${deals.length})...`);

    // Create base notes
    const baseNotes = await Promise.all([
      Note.create({
        title: "Product Feedback",
        content: "Sarah Wilson requested additional customization options for enterprise SSO. Need to coordinate with engineering.",
        pinned: true,
        dealId: deals[0]._id,
        userId: users[0]._id,
      }),
      Note.create({
        title: "Integration Scope",
        content: "Discussed GloboTech ERP connection fields. They are using an older SAP instance. Expecting payload samples next week.",
        pinned: false,
        dealId: deals[1]._id,
        userId: users[0]._id,
      }),
      Note.create({
        title: "CTO Meeting Prep",
        content: "Emily Rodriguez loves open source. Highlight our self-hosting capabilities and Docker compose workflows.",
        pinned: true,
        dealId: deals[2]._id,
        userId: users[0]._id,
      })
    ]);

    // Create extra notes programmatically
    const extraNotesData = [
      { title: 'SSO Requirements Draft', content: 'Customer requested SAML 2.0 and Okta integration details. Forwarded our security whitepaper.', pinned: true },
      { title: 'Pricing Feedback', content: 'They think the enterprise price is a bit high. Suggested a 10% discount on a 2-year contract.', pinned: false },
      { title: 'API Sync Call Notes', content: 'Sync call scheduled for next Thursday at 2 PM EST. Engineering team will attend to discuss payload formats.', pinned: false },
      { title: 'Executive Sync Prep', content: 'VP of Technology wants to see a dedicated ROI calculator slide in the next presentation deck.', pinned: true },
      { title: 'Database Migration Scope', content: 'They are migrating from an old Salesforce instance. Needs custom CSV mapping assistance.', pinned: false },
      { title: 'Training Plan Approved', content: 'Operations manager approved the 3-day training curriculum for their onboarding team.', pinned: false },
      { title: 'Compliance Questionnaire', content: 'Completed SOC2 Type II compliance questionnaire. Sent to their procurement officer.', pinned: false },
      { title: 'Demo Follow-up', content: 'Demo went very well. They loved the drag-and-drop kanban board and AI insights feature.', pinned: true },
      { title: 'Legal Review Pending', content: 'Contracts team sent the revised MSA for standard review. Awaiting response from their legal counsel.', pinned: false },
      { title: 'Holiday Delay Info', content: 'Main contact is out of office until next Monday. Decision expected late next week.', pinned: false },
      { title: 'Billing Setup Complete', content: 'Finance confirmed receiving credit card authorization form. Account is fully active.', pinned: false },
      { title: 'Integration Test Passed', content: 'Sandbox webhook tests succeeded with 200 OK. Ready to test in staging environment next.', pinned: false },
      { title: 'Competitor Mentioned', content: 'They mentioned evaluating Salesforce and HubSpot. Highlighted our clean glassmorphism UI and AI features.', pinned: true },
      { title: 'Kickoff Call Scheduled', content: 'Project kickoff call scheduled for Monday at 10 AM. Will review milestones and deliverables.', pinned: false },
      { title: 'Custom Field Requests', content: 'They requested custom lead fields for "Segment" and "Lead Source Detail". Added to requirements.', pinned: false },
      { title: 'Urgent Bug Reported', content: 'Reported issue with email generator output formatting. Engineering is investigating.', pinned: false },
      { title: 'Onboarding Call Recap', content: 'Walked them through basic navigation, pipeline stages, and contact filters. Great engagement.', pinned: false },
      { title: 'Budget Allocation Sync', content: 'Budget approved by the board for fiscal Q3. We are in the clear for contract signing.', pinned: true },
      { title: 'NDA Executed', content: 'NDA signed by both parties. Safe to share internal api architecture documentation.', pinned: false },
      { title: 'Discovery Session', content: 'Explored their current pain points. Main issue is pipeline visibility and stale lead data.', pinned: false },
      { title: 'Upsell Opportunity', content: 'They might need 50 more user seats next quarter due to department expansion.', pinned: false },
      { title: 'Renewal Discussion', content: 'Discussed annual renewal terms. They want to move from monthly to annual billing.', pinned: false },
      { title: 'Security Audit Call', content: 'IT Security lead approved our data isolation and multi-tenant setup.', pinned: true },
      { title: 'Feature Request: Bulk Edit', content: 'Requested bulk stage modification in Kanban view. Logged as feature request.', pinned: false },
      { title: 'API Key Generated', content: 'Generated staging API key and shared via secure channel.', pinned: false },
      { title: 'Contract Signed', content: 'Acme Corporation signed the MSA! Transitioning to onboarding phase.', pinned: true },
      { title: 'Next Steps Checklist', content: '1. Set up tenant organization. 2. Create admin accounts. 3. Import initial contact list.', pinned: false }
    ];

    const extraNotes = await Promise.all(extraNotesData.map((n, index) => {
      // Link to one of the John Doe deals (which include baseDeals[0..3] and extraDeals)
      const jdDeals = deals.filter(d => d.userId.toString() === users[0]._id.toString());
      const dealIndex = index % jdDeals.length;
      const deal = jdDeals[dealIndex];
      return Note.create({
        title: n.title,
        content: n.content,
        pinned: n.pinned,
        dealId: deal._id,
        userId: users[0]._id
      });
    }));

    const notes = [...baseNotes, ...extraNotes];

    console.log(`📝 Created notes (total: ${notes.length})...`);

    // Create base tasks (all reassigned to users[0]._id)
    const baseTasks = await Promise.all([
      // Tasks for John Doe
      Task.create({
        title: 'Send proposal to Acme Corporation',
        description: 'Draft and send detailed proposal including pricing and timeline',
        status: 'pending',
        priority: 'high',
        dueDate: getFutureDate(0, 5),
        userId: users[0]._id
      }),
      Task.create({
        title: 'Schedule demo with GloboTech team',
        description: 'Coordinate with technical team for product demonstration',
        status: 'completed',
        priority: 'medium',
        dueDate: getFutureDate(-1, 10),
        userId: users[0]._id
      }),
      Task.create({
        title: 'Follow up on InnovatePlus requirements',
        description: 'Clarify technical requirements and timeline expectations',
        status: 'pending',
        priority: 'medium',
        dueDate: getFutureDate(0, 10),
        userId: users[0]._id
      }),
      Task.create({
        title: 'Prepare MegaSystems executive presentation',
        description: 'Create executive-level presentation focusing on ROI and strategic benefits',
        status: 'pending',
        priority: 'low',
        dueDate: getFutureDate(1, 5),
        userId: users[0]._id
      }),

      // Tasks reassigned to John Doe (originally Jane Smith)
      Task.create({
        title: 'StartupX onboarding call',
        description: 'Welcome call and initial setup guidance',
        status: 'completed',
        priority: 'high',
        dueDate: getFutureDate(-2, 20),
        userId: users[0]._id
      }),
      Task.create({
        title: 'FutureTech contract review',
        description: 'Review contract terms and negotiate API access levels',
        status: 'pending',
        priority: 'high',
        dueDate: getFutureDate(0, 7),
        userId: users[0]._id
      }),
      Task.create({
        title: 'DigitalWave training schedule',
        description: 'Plan and schedule comprehensive training program',
        status: 'pending',
        priority: 'medium',
        dueDate: getFutureDate(1, 1),
        userId: users[0]._id
      }),

      // Tasks reassigned to John Doe (originally Mike Johnson)
      Task.create({
        title: 'Matrix security documentation',
        description: 'Compile security and compliance documentation for review',
        status: 'pending',
        priority: 'high',
        dueDate: getFutureDate(0, 14),
        userId: users[0]._id
      }),
      Task.create({
        title: 'CloudNine partnership proposal',
        description: 'Draft partnership terms and revenue sharing model',
        status: 'pending',
        priority: 'medium',
        dueDate: getFutureDate(1, 10),
        userId: users[0]._id
      }),
      Task.create({
        title: 'NextGen project post-mortem',
        description: 'Analyze why the deal was lost and document lessons learned',
        status: 'completed',
        priority: 'low',
        dueDate: getFutureDate(0, 15),
        userId: users[0]._id
      })
    ]);

    // Create extra tasks programmatically (all owned by users[0]._id)
    const extraTasksData = [
      { title: 'Follow up on Acme proposal feedback', description: 'Call Sarah to discuss pricing adjustments and term length options', priority: 'high', status: 'pending', daysOffset: 0 },
      { title: 'Prepare demo for GloboTech CTO', description: 'Customize the demo dashboard with their sample catalog data', priority: 'medium', status: 'pending', daysOffset: 1 },
      { title: 'Review InnovatePlus contract clauses', description: 'Verify standard liability limits and data privacy compliance terms', priority: 'high', status: 'completed', daysOffset: -2 },
      { title: 'Draft partnership proposal for CloudNine', description: 'Outline revenue share tiers and joint marketing events schedule', priority: 'medium', status: 'pending', daysOffset: 3 },
      { title: 'Compile security documentation for Matrix', description: 'Gather SOC2 report, penetration test summary, and data policy docs', priority: 'high', status: 'pending', daysOffset: -1 }, // Overdue!
      { title: 'Send welcome pack to StartupX team', description: 'Email onboarding links, developer guides, and training calendar', priority: 'low', status: 'completed', daysOffset: -5 },
      { title: 'Review FutureTech API requirements', description: 'Sync with engineering on customized webhook payloads they requested', priority: 'medium', status: 'pending', daysOffset: 2 },
      { title: 'Schedule training session with DigitalWave', description: 'Send calendar invite for 2-hour interactive admin walkthrough', priority: 'low', status: 'pending', daysOffset: 4 },
      { title: 'Send invoice to MegaSystems', description: 'Generate invoice for professional services milestone #1', priority: 'high', status: 'completed', daysOffset: -4 },
      { title: 'Check-in call with Sarah Wilson', description: 'Monthly relation check-in and feature feedback gathering', priority: 'low', status: 'pending', daysOffset: 15 },
      { title: 'Renew SSL certificates', description: 'Renew certificates for custom domain routing servers', priority: 'high', status: 'completed', daysOffset: -10 },
      { title: 'Update sales presentation deck', description: 'Insert new slides for AI CRM insights and glassmorphism UI', priority: 'medium', status: 'pending', daysOffset: 5 },
      { title: 'Conduct post-mortem on lost WUPFH deal', description: 'Identify product gaps and pricing friction points that led to loss', priority: 'low', status: 'completed', daysOffset: -1 },
      { title: 'Plan Q3 pipeline strategy', description: 'Draft lead generation targets and account allocation plan', priority: 'medium', status: 'pending', daysOffset: 10 },
      { title: 'Onboard new sales representative', description: 'Set up CRM account, assign initial leads, and schedule shadowing', priority: 'high', status: 'pending', daysOffset: 0 }, // Today!
      { title: 'Test staging webhooks latency', description: 'Verify webhook delivery time is under 200ms under load', priority: 'low', status: 'completed', daysOffset: -3 },
      { title: 'Update privacy policy pages', description: 'Coordinate with legal to update GDPR compliance statements', priority: 'medium', status: 'pending', daysOffset: 8 },
      { title: 'Draft marketing newsletter copy', description: 'Write copy highlighting our new email generator features', priority: 'low', status: 'pending', daysOffset: 6 },
      { title: 'Review monthly cloud infrastructure bill', description: 'Check usage trends and optimize database cluster sizing', priority: 'low', status: 'completed', daysOffset: -2 },
      { title: 'Resolve ticket regarding CSV export formatting', description: 'Verify special character encodings are preserved in CSV outputs', priority: 'high', status: 'completed', daysOffset: -1 },
      { title: 'Prepare budget forecast for Q4', description: 'Calculate expected won deals and active contract expansions', priority: 'high', status: 'pending', daysOffset: 20 },
      { title: 'Schedule product sync with CTO', description: 'Discuss upcoming Kanban board bulk-edit feature requirements', priority: 'medium', status: 'pending', daysOffset: 12 },
      { title: 'Send contract renewal to Apex', description: 'Annual contract renewal with standard 5% adjustment', priority: 'high', status: 'pending', daysOffset: -3 }, // Overdue!
      { title: 'Conduct user feedback session', description: 'Interview top 3 active users regarding the AI Email Generator', priority: 'medium', status: 'completed', daysOffset: -6 },
      { title: 'Review competitor pricing tier updates', description: 'Analyze HubSpot new starter tiers and adjust our position', priority: 'low', status: 'pending', daysOffset: 7 },
      { title: 'Verify backup recovery procedure', description: 'Run test restoration of production database snapshot in staging', priority: 'high', status: 'pending', daysOffset: 0 } // Today!
    ];

    const extraTasks = await Promise.all(extraTasksData.map((t, index) => {
      // Link to a contact for John Doe
      const jdContacts = contacts.filter(c => c.userId.toString() === users[0]._id.toString());
      const contactIndex = index % jdContacts.length;
      const contact = jdContacts[contactIndex];
      // Compute due date
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + t.daysOffset);
      return Task.create({
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: dueDate,
        contactId: contact._id,
        userId: users[0]._id
      });
    }));

    const tasks = [...baseTasks, ...extraTasks];

    console.log(`✅ Created tasks (total: ${tasks.length})...`);

    const result = {
      users,
      contacts,
      deals,
      tasks,
      notes
    };

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created: ${users.length} users, ${contacts.length} contacts, ${deals.length} deals, ${tasks.length} tasks, ${notes.length} notes`);

    return result;

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// For direct script execution
export async function runSeed() {
  try {
    await seedDatabase();
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}
