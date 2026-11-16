import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

export async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log('🌱 Starting database seeding for LifeDesk...');
    await client.query('BEGIN');

    // 1. Create or fetch demo user
    const email = 'demo@lifedesk.com';
    let userRes = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    let userId;

    if (userRes.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('password123', salt);
      const insertUser = await client.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
        ['Alex Morgan', email, hash]
      );
      userId = insertUser.rows[0].id;
    } else {
      userId = userRes.rows[0].id;
      // Clean previous demo data for idempotent runs
      await client.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM activity_logs WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM maintenance_records WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM documents WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM subscriptions WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM assets WHERE user_id = $1', [userId]);
    }

    // 2. Insert Assets
    const assetsData = [
      {
        name: 'MacBook Pro 16" M3 Max',
        category: 'Electronics',
        brand: 'Apple',
        model_number: 'A2991',
        serial_number: 'W88401231MX',
        purchase_date: '2024-01-15',
        purchase_price: 2499.00,
        store_vendor: 'Apple Store',
        location_room: 'Home Office',
        warranty_expiry_date: '2027-01-15',
        status: 'Active',
        notes: '16-inch Liquid Retina XDR, 36GB Unified Memory, 1TB SSD. Protected with AppleCare+.'
      },
      {
        name: 'LG French Door Smart Refrigerator',
        category: 'Home Appliances',
        brand: 'LG',
        model_number: 'LRFCS25D3S',
        serial_number: 'LG9841203',
        purchase_date: '2023-05-10',
        purchase_price: 1850.00,
        store_vendor: 'Best Buy',
        location_room: 'Kitchen',
        warranty_expiry_date: '2024-11-20',
        status: 'Active',
        notes: 'Dual ice maker, smart ThinQ Wi-Fi diagnostics. Warranty expiring soon!'
      },
      {
        name: 'Honda City ZX CVT',
        category: 'Vehicles',
        brand: 'Honda',
        model_number: '2023 ZX',
        serial_number: 'MAK382901',
        purchase_date: '2023-02-01',
        purchase_price: 18000.00,
        store_vendor: 'Honda Authorized Dealer',
        location_room: 'Garage',
        warranty_expiry_date: '2026-02-01',
        status: 'Active',
        notes: 'Sedan with ADAS suite. Next major service due at 25,000 km.'
      },
      {
        name: 'Worcester Bosch Greenstar 4000 Boiler',
        category: 'Home Hardware',
        brand: 'Bosch',
        model_number: 'Greenstar 4000 25kW',
        serial_number: 'WB-4000-882',
        purchase_date: '2023-10-30',
        purchase_price: 3200.00,
        store_vendor: 'BOXT',
        location_room: 'Utility Room',
        warranty_expiry_date: '2025-10-30',
        status: 'Active',
        notes: 'Gas safety certified. Includes 2-year BOXT workmanship guarantee.'
      },
      {
        name: 'Sony Bravia 65" 4K OLED TV',
        category: 'Electronics',
        brand: 'Sony',
        model_number: 'XR-65A80L',
        serial_number: 'SNY-OLED-651',
        purchase_date: '2023-11-25',
        purchase_price: 1699.00,
        store_vendor: 'Best Buy',
        location_room: 'Living Room',
        warranty_expiry_date: '2025-11-25',
        status: 'Active',
        notes: 'Google TV with cognitive processor XR. Wall mounted.'
      }
    ];

    const insertedAssets = [];
    for (const a of assetsData) {
      const res = await client.query(
        `INSERT INTO assets 
        (user_id, name, category, brand, model_number, serial_number, purchase_date, purchase_price, store_vendor, location_room, warranty_expiry_date, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [userId, a.name, a.category, a.brand, a.model_number, a.serial_number, a.purchase_date, a.purchase_price, a.store_vendor, a.location_room, a.warranty_expiry_date, a.status, a.notes]
      );
      insertedAssets.push(res.rows[0]);
    }

    const macbook = insertedAssets[0];
    const fridge = insertedAssets[1];
    const car = insertedAssets[2];
    const boiler = insertedAssets[3];
    const tv = insertedAssets[4];

    // 3. Insert Documents (LifeAdmin Vault)
    const docsData = [
      {
        asset_id: macbook.id,
        title: 'MacBook Pro Tax Invoice & Receipt',
        document_type: 'Invoice',
        file_name: 'apple-invoice-m3-max.pdf',
        file_url: '/uploads/apple-invoice-m3-max.pdf',
        file_size: 1240000,
        mime_type: 'application/pdf',
        expiry_date: null
      },
      {
        asset_id: macbook.id,
        title: 'AppleCare+ Extended Warranty Certificate',
        document_type: 'Warranty_Card',
        file_name: 'applecare-proof-certificate.pdf',
        file_url: '/uploads/applecare-proof-certificate.pdf',
        file_size: 890000,
        mime_type: 'application/pdf',
        expiry_date: '2027-01-15'
      },
      {
        asset_id: fridge.id,
        title: 'LG Refrigerator Warranty Card',
        document_type: 'Warranty_Card',
        file_name: 'lg-fridge-warranty.pdf',
        file_url: '/uploads/lg-fridge-warranty.pdf',
        file_size: 2400000,
        mime_type: 'application/pdf',
        expiry_date: '2024-11-20'
      },
      {
        asset_id: car.id,
        title: 'Comprehensive Auto Insurance Policy',
        document_type: 'Insurance_Policy',
        file_name: 'honda-city-insurance-2024.pdf',
        file_url: '/uploads/honda-city-insurance-2024.pdf',
        file_size: 3100000,
        mime_type: 'application/pdf',
        expiry_date: '2024-12-01'
      },
      {
        asset_id: boiler.id,
        title: 'CP1 Gas Safety Certificate',
        document_type: 'Manual',
        file_name: 'cp1-gas-safety-cert.pdf',
        file_url: '/uploads/cp1-gas-safety-cert.pdf',
        file_size: 950000,
        mime_type: 'application/pdf',
        expiry_date: '2025-10-30'
      },
      {
        asset_id: boiler.id,
        title: 'BOXT Building Regulations Compliance Note',
        document_type: 'Other',
        file_name: 'boxt-compliance.pdf',
        file_url: '/uploads/boxt-compliance.pdf',
        file_size: 450000,
        mime_type: 'application/pdf',
        expiry_date: null
      }
    ];

    for (const d of docsData) {
      await client.query(
        `INSERT INTO documents (user_id, asset_id, title, document_type, file_name, file_url, file_size, mime_type, expiry_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [userId, d.asset_id, d.title, d.document_type, d.file_name, d.file_url, d.file_size, d.mime_type, d.expiry_date]
      );
    }

    // 4. Insert Subscriptions & Renewals (SubSave)
    const subsData = [
      {
        asset_id: car.id,
        name: 'Auto Comprehensive Insurance (Nationwide)',
        category: 'Insurance',
        cost: 450.00,
        billing_cycle: 'Annually',
        start_date: '2023-12-01',
        next_renewal_date: '2024-12-01',
        auto_renew: true
      },
      {
        asset_id: fridge.id,
        name: 'LG Extended AMC Protection',
        category: 'AMC',
        cost: 90.00,
        billing_cycle: 'Annually',
        start_date: '2023-11-25',
        next_renewal_date: '2024-11-25',
        auto_renew: false
      },
      {
        asset_id: null,
        name: 'Fiber Broadband 500Mbps High Speed',
        category: 'Utility',
        cost: 50.00,
        billing_cycle: 'Monthly',
        start_date: '2023-01-05',
        next_renewal_date: '2024-12-05',
        auto_renew: true
      },
      {
        asset_id: macbook.id,
        name: 'AppleCare+ Protection Plan',
        category: 'AMC',
        cost: 149.00,
        billing_cycle: 'Annually',
        start_date: '2024-01-15',
        next_renewal_date: '2025-01-15',
        auto_renew: true
      },
      {
        asset_id: null,
        name: 'LifeHub Cloud Backup (2TB)',
        category: 'Software',
        cost: 9.99,
        billing_cycle: 'Monthly',
        start_date: '2024-01-01',
        next_renewal_date: '2024-11-30',
        auto_renew: true
      }
    ];

    for (const s of subsData) {
      await client.query(
        `INSERT INTO subscriptions (user_id, asset_id, name, category, cost, billing_cycle, start_date, next_renewal_date, auto_renew)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [userId, s.asset_id, s.name, s.category, s.cost, s.billing_cycle, s.start_date, s.next_renewal_date, s.auto_renew]
      );
    }

    // 5. Insert Maintenance & Repairs (FixFlow)
    const repairsData = [
      {
        asset_id: car.id,
        title: 'Brake Pad & Rotor Replacement',
        description: 'Front disc brake pads replaced with OEM ceramic pads and system flushed.',
        service_type: 'Repair',
        status: 'Completed',
        reported_date: '2024-07-15',
        service_date: '2024-07-20',
        service_provider_name: 'Honda Authorized Center',
        service_provider_contact: '+1-800-444-6632',
        technician_notes: 'Rotors resurfaced, brake pads replaced. Test drive passed cleanly.',
        labor_cost: 70.00,
        parts_cost: 50.00
      },
      {
        asset_id: fridge.id,
        title: 'Water Filter Replacement & Compressor Check',
        description: 'Routine water filtration cartridge replacement and condenser coil cleaning.',
        service_type: 'Preventive',
        status: 'Completed',
        reported_date: '2024-03-05',
        service_date: '2024-03-12',
        service_provider_name: 'LG Direct Care (Maria Lopez)',
        service_provider_contact: '+1-800-243-0000',
        technician_notes: 'Replaced LT1000P filter. Coolant pressure tested nominal at 42 psi.',
        labor_cost: 25.00,
        parts_cost: 40.00
      },
      {
        asset_id: boiler.id,
        title: 'Annual Gas Safety Inspection & Flue Cleaning',
        description: 'Mandatory annual boiler health check and flue efficiency analysis.',
        service_type: 'Inspection',
        status: 'Scheduled',
        reported_date: '2024-11-01',
        service_date: '2024-11-28',
        service_provider_name: 'BOXT Certified Tech (David Parker)',
        service_provider_contact: '+1-800-555-BOXT',
        technician_notes: 'Technician dispatched. Scheduled for morning slot (10:00 AM - 12:00 PM).',
        labor_cost: 85.00,
        parts_cost: 0.00
      },
      {
        asset_id: tv.id,
        title: 'Wall Mount Installation & Cable Concealment',
        description: 'Full articulation bracket mounting and in-wall cable conduit installation.',
        service_type: 'Repair',
        status: 'Completed',
        reported_date: '2023-11-25',
        service_date: '2023-11-26',
        service_provider_name: 'Geek Squad Pro Install',
        service_provider_contact: '+1-888-237-8289',
        technician_notes: 'Installed onto concrete studs using heavy duty toggle anchors.',
        labor_cost: 120.00,
        parts_cost: 30.00
      }
    ];

    for (const r of repairsData) {
      await client.query(
        `INSERT INTO maintenance_records 
         (user_id, asset_id, title, description, service_type, status, reported_date, service_date, service_provider_name, service_provider_contact, technician_notes, labor_cost, parts_cost)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [userId, r.asset_id, r.title, r.description, r.service_type, r.status, r.reported_date, r.service_date, r.service_provider_name, r.service_provider_contact, r.technician_notes, r.labor_cost, r.parts_cost]
      );
    }

    // 6. Insert Activity Logs (Smart Timeline Pipeline)
    const activities = [
      // Macbook
      { asset_id: macbook.id, event_type: 'Asset_Created', description: 'Purchased at Apple Store & Registered in LifeDesk', cost_impact: 2499.00, date: '2024-01-15 10:00:00' },
      { asset_id: macbook.id, event_type: 'Doc_Uploaded', description: 'Tax Invoice & AppleCare+ warranty receipt vaulted', cost_impact: 0.00, date: '2024-01-15 10:05:00' },
      { asset_id: macbook.id, event_type: 'Renewal_Paid', description: 'Enrolled AppleCare+ 3-Year Protection Plan', cost_impact: 149.00, date: '2024-01-15 10:15:00' },
      { asset_id: macbook.id, event_type: 'Service_Logged', description: 'Complimentary Genius Bar battery diagnostic check', cost_impact: 0.00, date: '2024-08-10 14:30:00' },
      
      // Fridge
      { asset_id: fridge.id, event_type: 'Asset_Created', description: 'Purchased LG Smart Refrigerator & Delivered', cost_impact: 1850.00, date: '2023-05-10 09:00:00' },
      { asset_id: fridge.id, event_type: 'Doc_Uploaded', description: 'Uploaded 1-Year Manufacturer Warranty Certificate', cost_impact: 0.00, date: '2023-05-10 09:30:00' },
      { asset_id: fridge.id, event_type: 'Service_Logged', description: 'Water Filter Replacement & Compressor Service (FixFlow)', cost_impact: 65.00, date: '2024-03-12 11:00:00' },
      
      // Car
      { asset_id: car.id, event_type: 'Asset_Created', description: 'Honda City ZX Delivered & Title Registered', cost_impact: 18000.00, date: '2023-02-01 12:00:00' },
      { asset_id: car.id, event_type: 'Renewal_Paid', description: 'Auto Comprehensive Insurance 1st Year Premium', cost_impact: 450.00, date: '2023-02-01 12:30:00' },
      { asset_id: car.id, event_type: 'Service_Logged', description: 'Annual Service & Synthetic Oil Change', cost_impact: 140.00, date: '2024-02-15 10:00:00' },
      { asset_id: car.id, event_type: 'Service_Logged', description: 'Front Disc Brake Pad & Rotor Replacement', cost_impact: 120.00, date: '2024-07-20 15:45:00' },

      // Boiler
      { asset_id: boiler.id, event_type: 'Asset_Created', description: 'Worcester Bosch Boiler Installed by BOXT', cost_impact: 3200.00, date: '2023-10-30 11:00:00' },
      { asset_id: boiler.id, event_type: 'Doc_Uploaded', description: 'CP1 Gas Safety Certificate & Compliance records vaulted', cost_impact: 0.00, date: '2023-10-30 11:30:00' },
      { asset_id: boiler.id, event_type: 'Service_Logged', description: 'Scheduled Annual Boiler Gas Safety Inspection', cost_impact: 85.00, date: '2024-11-28 10:00:00' }
    ];

    for (const act of activities) {
      await client.query(
        `INSERT INTO activity_logs (user_id, asset_id, event_type, description, cost_impact, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, act.asset_id, act.event_type, act.description, act.cost_impact, act.date]
      );
    }

    // 7. Insert Notifications
    const notifs = [
      {
        reference_type: 'Warranty_Expiry',
        title: 'Action Needed: LG Refrigerator Warranty Expiring',
        message: 'Your LG French Door Refrigerator warranty expires in 7 days (Nov 20, 2024). Review AMC options to maintain coverage.',
        due_date: '2024-11-20',
        is_read: false
      },
      {
        reference_type: 'Subscription_Renewal',
        title: 'Upcoming Renewal: Auto Comprehensive Insurance',
        message: 'Nationwide policy for Honda City ZX is due for renewal on Dec 1, 2024 ($450.00).',
        due_date: '2024-12-01',
        is_read: false
      },
      {
        reference_type: 'Maintenance_Due',
        title: 'Service Appointment: Worcester Bosch Boiler',
        message: 'Technician David Parker scheduled for annual safety check on Nov 28, 2024 at 10:00 AM.',
        due_date: '2024-11-28',
        is_read: false
      }
    ];

    for (const n of notifs) {
      await client.query(
        `INSERT INTO notifications (user_id, reference_type, title, message, due_date, is_read)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, n.reference_type, n.title, n.message, n.due_date, n.is_read]
      );
    }

    await client.query('COMMIT');
    console.log('🎉 Database seeding completed successfully! Demo user: demo@lifedesk.com / password123');
    return { success: true, userId, email };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed, rolled back:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Allow standalone execution
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

