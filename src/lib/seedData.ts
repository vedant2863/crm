import mongoose from "mongoose";
import dbConnect from "./dbConnect";
import bcrypt from "bcryptjs";

import Contact from "@/models/contact";
import Deal from "@/models/deal";
import Task from "@/models/task";
import Note from "@/models/note";
import User from "@/models/user";
import Comment from "@/models/comment";
import Activity from "@/models/activity";
import Notification from "@/models/notification";

export async function seedDatabase() {
  await dbConnect();

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database not connected");
  }

  // Check or create admin user first to get the correct userId (NextAuth uses users collection)
  const adminEmail = "vedantjadhav880@gmail.com";
  const existingUser = await User.findOne({ email: adminEmail });

  let userId: string;
  let userName = "Vedant Jadhav";

  if (existingUser) {
    userId = existingUser.id || existingUser._id.toString();
    userName = existingUser.name || "Vedant Jadhav";
  } else {
    const hashedPassword = await bcrypt.hash("vedantjadhav880", 12);
    const admin = await User.create({
      name: "Vedant Jadhav",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      company: "TechCorp Inc",
      phone: "+919999999999",
      timezone: "Asia/Kolkata",
      language: "en",
    });

    userId = admin._id.toString();
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Clear existing collections specifically for this user to protect other users' data
  await Promise.all([
    Contact.deleteMany({ userId }),
    Deal.deleteMany({ userId }),
    Task.deleteMany({ userId }),
    Note.deleteMany({ userId }),
    Comment.deleteMany({ userId: userObjectId }),
    Activity.deleteMany({ userId: userObjectId }),
    Notification.deleteMany({ userId: userObjectId }),
  ]);

  // 1. Generate 20 Contacts
  const contactData = [
    { name: "Sarah Wilson", email: "sarah.wilson@acme.com", company: "Acme Corporation", phone: "+1-555-1001", position: "VP Technology", notes: "Interested in enterprise package" },
    { name: "John Miller", email: "john.miller@globaltech.com", company: "GlobalTech Solutions", phone: "+1-555-1002", position: "Sales Director", notes: "Prefers communication via email" },
    { name: "Emma Davis", email: "emma.davis@apex.com", company: "Apex Innovations", phone: "+1-555-1003", position: "CEO", notes: "Decision maker for cloud migration" },
    { name: "Michael Brown", email: "michael.brown@summit.com", company: "Summit Industries", phone: "+1-555-1004", position: "Product Manager", notes: "Evaluate integration capabilities" },
    { name: "Emily Garcia", email: "emily.garcia@delta.com", company: "Delta Services", phone: "+1-555-1005", position: "Operations Manager", notes: "Wants to optimize ticketing workflows" },
    { name: "James Martinez", email: "james.martinez@nova.com", company: "Nova Systems", phone: "+1-555-1006", position: "CTO", notes: "Inquiring about security compliance details" },
    { name: "Jessica Anderson", email: "jessica.anderson@echo.com", company: "Echo Media", phone: "+1-555-1007", position: "HR Director", notes: "Looking for team collaboration features" },
    { name: "David Taylor", email: "david.taylor@vanguard.com", company: "Vanguard Logistics", phone: "+1-555-1008", position: "VP Procurement", notes: "Requesting detailed pricing matrices" },
    { name: "Sophia Thomas", email: "sophia.thomas@bluesky.com", company: "BlueSky Ventures", phone: "+1-555-1009", position: "Managing Director", notes: "Follow up after their funding round" },
    { name: "Robert Hernandez", email: "robert.hernandez@horizon.com", company: "Horizon Health", phone: "+1-555-1010", position: "Chief Architect", notes: "Scale requirements are extremely high" },
    { name: "Linda Moore", email: "linda.moore@quantum.com", company: "Quantum Labs", phone: "+1-555-1011", position: "Director of R&D", notes: "Focus on AI insights feature" },
    { name: "William Martin", email: "william.martin@stellar.com", company: "Stellar Corp", phone: "+1-555-1012", position: "Finance Lead", notes: "Need ROI analysis deck before buying" },
    { name: "Elizabeth Jackson", email: "elizabeth.jackson@nexus.com", company: "Nexus Software", phone: "+1-555-1013", position: "SVP Engineering", notes: "Review API documentation with them" },
    { name: "Richard Thompson", email: "richard.thompson@matrix.com", company: "Matrix Retail", phone: "+1-555-1014", position: "Digital Head", notes: "Looking for omnichannel marketing solutions" },
    { name: "Barbara White", email: "barbara.white@cloudnet.com", company: "CloudNet Systems", phone: "+1-555-1015", position: "Infrastructure Lead", notes: "On-premise deployment inquiries" },
    { name: "Joseph Harris", email: "joseph.harris@ironwood.com", company: "Ironwood Real Estate", phone: "+1-555-1016", position: "Managing Partner", notes: "Interested in portfolio management CRM integration" },
    { name: "Susan Sanchez", email: "susan.sanchez@aerotech.com", company: "AeroTech Group", phone: "+1-555-1017", position: "VP Quality", notes: "Strict SLA requirements" },
    { name: "Thomas Clark", email: "thomas.clark@peaklog.com", company: "Peak Logistics", phone: "+1-555-1018", position: "Supply Chain Director", notes: "Wants pilot run for 10 users" },
    { name: "Margaret Ramirez", email: "margaret.ramirez@biomed.com", company: "BioMed Ventures", phone: "+1-555-1019", position: "Medical Officer", notes: "HIPAA compliance questionnaire requested" },
    { name: "Charles Lewis", email: "charles.lewis@fortress.com", company: "Fortress Insurance", phone: "+1-555-1020", position: "Information Security VP", notes: "Requires custom SSO support" }
  ];

  const contacts = [];
  for (const c of contactData) {
    const contact = await Contact.create({
      ...c,
      userId,
    });
    contacts.push(contact);
  }

  // 2. Generate 20 Deals linked to Contacts
  const stages: Array<"new" | "qualified" | "proposal" | "won" | "lost"> = ["new", "qualified", "proposal", "won", "lost"];
  const priorities: Array<"low" | "medium" | "high"> = ["low", "medium", "high"];
  const dealTitles = [
    "Enterprise License Deal", "Cloud Integration Setup", "Consulting Engagement Contract",
    "Security Audit & Patching", "SLA Support Agreement", "API Custom Integration",
    "On-premise Deployment Pilot", "Annual Platform License Renewal", "Marketing Automation Module",
    "Omnichannel Upgrade", "SSO Enterprise Setup", "Pilot Expansion Pack",
    "Staff Training Session Pack", "High Availability Cluster Setup", "Compliance Audit Consulting",
    "Data Migration Pipeline Setup", "Workflow Automation Workshop", "Premium Analytics Add-on",
    "Multi-region Scale Support", "Dedicated Database Hosting Setup"
  ];

  const deals = [];
  for (let i = 0; i < 20; i++) {
    const contact = contacts[i];
    const value = Math.floor(Math.random() * 200000) + 15000;
    const stage = stages[i % stages.length];
    const priority = priorities[i % priorities.length];
    const probability = stage === "won" ? 100 : stage === "lost" ? 0 : stage === "proposal" ? 75 : stage === "qualified" ? 50 : 20;

    const deal = await Deal.create({
      title: `${contact.company} - ${dealTitles[i]}`,
      description: `Contract and integration details for ${dealTitles[i].toLowerCase()} service.`,
      value,
      stage,
      probability,
      company: contact.company,
      contactName: contact.name,
      contactId: contact._id,
      priority,
      userId,
      expectedCloseDate: new Date(Date.now() + (30 + i * 5) * 24 * 60 * 60 * 1000),
    });
    deals.push(deal);
  }

  // 3. Generate 20 Tasks linked to Contacts and Deals
  const taskTitles = [
    "Send proposal documentation", "Schedule security audit call", "Follow up on pricing contract",
    "Prepare custom integration demo", "Answer SLA compliance questionnaire", "Conduct kickoff meeting",
    "Validate API testing credentials", "Discuss subscription renewal terms", "Provide marketing module references",
    "Present omnichannel design specs", "Review SSO implementation path", "Draft pilot project statement of work",
    "Confirm training attendee numbers", "Deliver cluster infrastructure map", "Complete compliance questionnaire",
    "Finalize data schema validation", "Verify automation workflow logic", "Present analytics dashboard mockup",
    "Send scale support contract copy", "Provision dedicated staging database"
  ];
  const taskStatuses = ["pending", "in_progress", "completed"];

  const tasks = [];
  for (let i = 0; i < 20; i++) {
    const contact = contacts[i];
    const deal = deals[i];
    const status = taskStatuses[i % taskStatuses.length];
    const priority = priorities[i % priorities.length];

    const task = await Task.create({
      title: taskTitles[i],
      description: `Action item for ${contact.name} relating to deal "${deal.title}". Ensure all requirements are documented.`,
      status,
      priority,
      contactId: contact._id,
      dealId: deal._id,
      userId,
      dueDate: new Date(Date.now() + (i * 2) * 24 * 60 * 60 * 1000),
    });
    tasks.push(task);
  }

  // 4. Generate 20 Notes linked to Deals
  const noteContents = [
    "Sarah expressed strong interest in our enterprise capabilities. Emphasized SSO and priority support.",
    "Discussed pricing models with John. He requested a 15% discount for a multi-year term.",
    "Call with Emma. She approved the initial technical architecture and asked to see security specs.",
    "Michael requested an additional sandbox environment to test integrations. Team is provisioning.",
    "Delta Services team prefers on-premises storage solutions due to compliance guidelines.",
    "Nova Systems requested we fill out their standard vendor security assessment document.",
    "Echo Media is looking for real-time collaboration widgets. Demoed Comments and Activity logs.",
    "Vanguard Logistics requested a formal proposal with structured phase breakdowns by next Tuesday.",
    "Sophia mentioned they are finalizing their series B round and will purchase immediately after.",
    "Robert asked technical questions regarding database replication limits and read/write scaling.",
    "Quantum Labs is excited about AI summary features. Wants to run a pilot with real data.",
    "Stellar Corp requested a written ROI justification document for their finance committee approval.",
    "Nexus Engineering team will review the API specs this week. Follow-up scheduled for Friday.",
    "Matrix Retail wants to know if the messaging features sync with their Shopify inventory APIs.",
    "CloudNet Systems requested detailed instructions for deploying via Docker Helm charts.",
    "Ironwood Real Estate needs mobile support. Shared mobile browser webapp screenshots.",
    "AeroTech requires a strict 99.99% uptime guarantee. Shared SLA terms documentation.",
    "Thomas requested a sandbox environment for 10 users to run a two-week validation pilot.",
    "Margaret requested our HIPAA compliance certificate and Business Associate Agreement (BAA).",
    "Fortress Insurance security team requested custom IP whitelisting settings. Discussed options."
  ];

  const notes = [];
  for (let i = 0; i < 20; i++) {
    const deal = deals[i];
    const note = await Note.create({
      title: `Meeting/Call Notes - ${deal.company}`,
      content: noteContents[i],
      pinned: i % 5 === 0,
      dealId: deal._id,
      userId,
    });
    notes.push(note);
  }

  // 5. Generate 10+ Comments linked to Contacts, Deals, or Tasks
  const comments = [];
  const commentTexts = [
    "Finished the initial document review. Ready for client review.",
    "Client sent over the signed security agreement. Uploading to vault.",
    "Followed up via phone. They said they are discussing internally today.",
    "Sent the corrected integration code snippet to their development lead.",
    "Budget has been approved by the VP. Proceeding to legal review.",
    "Assigned technical support engineer to coordinate pilot provisioning.",
    "Completed the data migration testing. All records synced cleanly.",
    "Client asked to move the kickoff call to Thursday morning.",
    "SSO configuration has been successfully tested on staging.",
    "Sending the HIPAA BAA template for signature this afternoon."
  ];

  for (let i = 0; i < 10; i++) {
    const contact = contacts[i % contacts.length];
    const deal = deals[i % deals.length];
    const task = tasks[i % tasks.length];

    // Seeding comment on Contact
    const commentContact = await Comment.create({
      userId: userObjectId,
      userName,
      content: commentTexts[i],
      entityType: "contact",
      entityId: contact._id,
    });
    comments.push(commentContact);

    // Seeding comment on Deal
    const commentDeal = await Comment.create({
      userId: userObjectId,
      userName,
      content: `Update: ${commentTexts[(i + 3) % commentTexts.length]}`,
      entityType: "deal",
      entityId: deal._id,
    });
    comments.push(commentDeal);

    // Seeding comment on Task
    const commentTask = await Comment.create({
      userId: userObjectId,
      userName,
      content: `Task Update: ${commentTexts[(i + 6) % commentTexts.length]}`,
      entityType: "task",
      entityId: task._id,
    });
    comments.push(commentTask);
  }

  // 6. Generate 10+ Activities
  const activities = [];
  for (let i = 0; i < 15; i++) {
    const contact = contacts[i % contacts.length];
    const deal = deals[i % deals.length];
    const task = tasks[i % tasks.length];

    const actions = [
      `created contact ${contact.name}`,
      `advanced deal ${deal.title} to stage ${deal.stage.toUpperCase()}`,
      `created task "${task.title}"`,
      `updated task status for "${task.title}" to ${task.status.toUpperCase()}`,
      `added a note to deal "${deal.title}"`,
    ];

    const activity = await Activity.create({
      organization: "TechCorp Inc",
      userId: userObjectId,
      userName,
      action: actions[i % actions.length],
      entityType: i % 3 === 0 ? "contact" : i % 3 === 1 ? "deal" : "task",
      entityId: i % 3 === 0 ? contact._id : i % 3 === 1 ? deal._id : task._id,
    });
    activities.push(activity);
  }

  // 7. Generate 10+ Notifications
  const notifications = [];
  for (let i = 0; i < 12; i++) {
    const deal = deals[i % deals.length];
    const task = tasks[i % tasks.length];

    const notification = await Notification.create({
      userId: userObjectId,
      title: i % 2 === 0 ? "Deal Stage Updated" : "Task Due Reminder",
      message: i % 2 === 0 
        ? `The deal "${deal.title}" stage was updated to ${deal.stage}.` 
        : `The task "${task.title}" is due soon. Please complete it.`,
      type: i % 2 === 0 ? "deal" : "task",
      read: i % 4 === 0, // 25% read notifications
      referenceId: i % 2 === 0 ? deal._id : task._id,
      referenceType: i % 2 === 0 ? "deal" : "task",
    });
    notifications.push(notification);
  }

  return {
    userId,
    contacts,
    deals,
    tasks,
    notes,
    comments,
    activities,
    notifications,
  };
}

export async function runSeed() {
  try {
    await seedDatabase();
    console.log("Seed completed");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
