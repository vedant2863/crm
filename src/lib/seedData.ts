import bcrypt from 'bcryptjs';
import dbConnect from './dbConnect';
import User from '@/models/user';
import Contact from '@/models/contact';
import Deal from '@/models/deal';
import Task from '@/models/task';

export interface SeedResult {
  users: unknown[];
  contacts: unknown[];
  deals: unknown[];
  tasks: unknown[];
}

export async function seedDatabase(): Promise<SeedResult> {
  try {
    await dbConnect();

    // Clear existing data
    await Task.deleteMany({});
    await Deal.deleteMany({});
    await Contact.deleteMany({});
    await User.deleteMany({});

    console.log('🧹 Cleared existing data...');

    // Create users with hashed passwords
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await Promise.all([
      User.create({
        email: 'john.doe@example.com',
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

    console.log('👥 Created users...');

    // Create contacts
    const contacts = await Promise.all([
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

      // Contacts for Jane Smith (user 2)
      Contact.create({
        name: 'Lisa Park',
        email: 'lisa.park@startupx.com',
        phone: '+1-555-2001',
        company: 'StartupX',
        position: 'Founder & CEO',
        notes: 'Fast-growing startup. Looking for scalable solutions.',
        userId: users[1]._id
      }),
      Contact.create({
        name: 'Alex Martinez',
        email: 'a.martinez@futuretech.com',
        phone: '+1-555-2002',
        company: 'FutureTech Innovations',
        position: 'Product Manager',
        notes: 'Interested in API integration capabilities.',
        userId: users[1]._id
      }),
      Contact.create({
        name: 'Rachel Green',
        email: 'rachel.green@digitalwave.com',
        phone: '+1-555-2003',
        company: 'DigitalWave Media',
        position: 'Operations Director',
        notes: 'Needs implementation support. Budget allocated for training.',
        userId: users[1]._id
      }),

      // Contacts for Mike Johnson (user 3)
      Contact.create({
        name: 'Thomas Anderson',
        email: 't.anderson@matrix-corp.com',
        phone: '+1-555-3001',
        company: 'Matrix Corporation',
        position: 'Senior Architect',
        notes: 'Technical evaluator. Concerned about security and compliance.',
        userId: users[2]._id
      }),
      Contact.create({
        name: 'Jennifer White',
        email: 'j.white@cloudnine.com',
        phone: '+1-555-3002',
        company: 'CloudNine Solutions',
        position: 'VP Sales',
        notes: 'Potential partner opportunity. Interested in reseller program.',
        userId: users[2]._id
      }),
      Contact.create({
        name: 'Kevin Brown',
        email: 'kevin.brown@nextgen.com',
        phone: '+1-555-3003',
        company: 'NextGen Dynamics',
        position: 'CTO',
        notes: 'Early adopter of new technology. Influences industry trends.',
        userId: users[2]._id
      })
    ]);

    console.log('📇 Created contacts...');

    // Create deals
    const deals = await Promise.all([
      // Deals for John Doe
      Deal.create({
        title: 'Acme Enterprise Software License',
        description: 'Annual enterprise license for 500 users including premium support',
        value: 125000,
        stage: 'negotiation',
        probability: 75,
        expectedCloseDate: new Date('2024-03-15'),
        contactId: contacts[0]._id,
        userId: users[0]._id
      }),
      Deal.create({
        title: 'GloboTech Integration Project',
        description: 'Custom integration with existing ERP system',
        value: 85000,
        stage: 'proposal',
        probability: 60,
        expectedCloseDate: new Date('2024-04-30'),
        contactId: contacts[1]._id,
        userId: users[0]._id
      }),
      Deal.create({
        title: 'InnovatePlus Consulting Services',
        description: 'Implementation and training services for Q1 rollout',
        value: 45000,
        stage: 'qualified',
        probability: 40,
        expectedCloseDate: new Date('2024-05-15'),
        contactId: contacts[2]._id,
        userId: users[0]._id
      }),
      Deal.create({
        title: 'MegaSystems Annual Contract',
        description: 'Multi-year contract with professional services',
        value: 250000,
        stage: 'lead',
        probability: 25,
        expectedCloseDate: new Date('2024-08-31'),
        contactId: contacts[3]._id,
        userId: users[0]._id
      }),

      // Deals for Jane Smith
      Deal.create({
        title: 'StartupX Growth Package',
        description: 'Scalable solution for rapid growth phase',
        value: 35000,
        stage: 'won',
        probability: 100,
        expectedCloseDate: new Date('2024-01-15'),
        contactId: contacts[4]._id,
        userId: users[1]._id
      }),
      Deal.create({
        title: 'FutureTech API License',
        description: 'Premium API access with custom endpoints',
        value: 55000,
        stage: 'negotiation',
        probability: 80,
        expectedCloseDate: new Date('2024-03-01'),
        contactId: contacts[5]._id,
        userId: users[1]._id
      }),
      Deal.create({
        title: 'DigitalWave Implementation',
        description: 'Full implementation with training and support',
        value: 95000,
        stage: 'proposal',
        probability: 65,
        expectedCloseDate: new Date('2024-04-15'),
        contactId: contacts[6]._id,
        userId: users[1]._id
      }),

      // Deals for Mike Johnson
      Deal.create({
        title: 'Matrix Security Audit',
        description: 'Comprehensive security assessment and compliance review',
        value: 15000,
        stage: 'qualified',
        probability: 50,
        expectedCloseDate: new Date('2024-06-30'),
        contactId: contacts[7]._id,
        userId: users[2]._id
      }),
      Deal.create({
        title: 'CloudNine Partnership Agreement',
        description: 'Strategic partnership and reseller agreement',
        value: 75000,
        stage: 'negotiation',
        probability: 70,
        expectedCloseDate: new Date('2024-03-31'),
        contactId: contacts[8]._id,
        userId: users[2]._id
      }),
      Deal.create({
        title: 'NextGen Innovation Lab',
        description: 'Pilot program for next-generation features',
        value: 120000,
        stage: 'lost',
        probability: 0,
        expectedCloseDate: new Date('2024-02-28'),
        contactId: contacts[9]._id,
        userId: users[2]._id
      })
    ]);

    console.log('💼 Created deals...');

    // Create tasks
    const tasks = await Promise.all([
      // Tasks for John Doe
      Task.create({
        title: 'Send proposal to Acme Corporation',
        description: 'Draft and send detailed proposal including pricing and timeline',
        status: 'pending',
        priority: 'high',
        dueDate: new Date('2024-02-20'),
        userId: users[0]._id
      }),
      Task.create({
        title: 'Schedule demo with GloboTech team',
        description: 'Coordinate with technical team for product demonstration',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date('2024-02-10'),
        userId: users[0]._id
      }),
      Task.create({
        title: 'Follow up on InnovatePlus requirements',
        description: 'Clarify technical requirements and timeline expectations',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date('2024-02-25'),
        userId: users[0]._id
      }),
      Task.create({
        title: 'Prepare MegaSystems executive presentation',
        description: 'Create executive-level presentation focusing on ROI and strategic benefits',
        status: 'pending',
        priority: 'low',
        dueDate: new Date('2024-03-05'),
        userId: users[0]._id
      }),

      // Tasks for Jane Smith
      Task.create({
        title: 'StartupX onboarding call',
        description: 'Welcome call and initial setup guidance',
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2024-01-20'),
        userId: users[1]._id
      }),
      Task.create({
        title: 'FutureTech contract review',
        description: 'Review contract terms and negotiate API access levels',
        status: 'pending',
        priority: 'high',
        dueDate: new Date('2024-02-22'),
        userId: users[1]._id
      }),
      Task.create({
        title: 'DigitalWave training schedule',
        description: 'Plan and schedule comprehensive training program',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date('2024-03-01'),
        userId: users[1]._id
      }),

      // Tasks for Mike Johnson
      Task.create({
        title: 'Matrix security documentation',
        description: 'Compile security and compliance documentation for review',
        status: 'pending',
        priority: 'high',
        dueDate: new Date('2024-02-28'),
        userId: users[2]._id
      }),
      Task.create({
        title: 'CloudNine partnership proposal',
        description: 'Draft partnership terms and revenue sharing model',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date('2024-03-10'),
        userId: users[2]._id
      }),
      Task.create({
        title: 'NextGen project post-mortem',
        description: 'Analyze why the deal was lost and document lessons learned',
        status: 'completed',
        priority: 'low',
        dueDate: new Date('2024-03-05'),
        userId: users[2]._id
      })
    ]);

    console.log('✅ Created tasks...');

    const result = {
      users,
      contacts,
      deals,
      tasks
    };

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created: ${users.length} users, ${contacts.length} contacts, ${deals.length} deals, ${tasks.length} tasks`);

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
