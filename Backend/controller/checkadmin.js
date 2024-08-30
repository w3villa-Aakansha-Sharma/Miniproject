const bcrypt = require('bcrypt');
const conn = require('../config/dbConnection');
const crypto = require('crypto');

const checkAndCreateAdmin = async () => {
  try {
    // Check if an admin exists
    const checkAdminQuery = 'SELECT * FROM user_table WHERE role = "admin" LIMIT 1';
    conn.query(checkAdminQuery, async (err, results) => {
      if (err) {
        console.error('Error checking for admin:', err);
        return;
      }

      // If no admin exists, create a dummy admin
      if (results.length === 0) {
        const hashedPassword = await bcrypt.hash('Admin#1234567', 10);
        const uniqueReferenceId = crypto.randomBytes(16).toString('hex');
        const adminEmail = 'admin@gmail.com';
        const adminUsername = 'admin';

        // Insert into user_table
        const createAdminQuery = `
          INSERT INTO user_table (unique_reference_id, username, email,verification_hash, next_action, password, role)
          VALUES (?, ?, ?, ?,?, ?, ?)
        `;
        conn.query(createAdminQuery, [uniqueReferenceId, adminUsername, adminEmail, 'admin','null', hashedPassword, 'admin'], (err, results) => {
          if (err) {
            console.error('Error creating admin:', err);
            return;
          }
          console.log('Admin user created successfully.');

          // Insert into user_verification_table
          const createAdminVerificationQuery = `
            INSERT INTO user_verification_table (unique_reference_id, email, verification_hash, expire_at, otp_expire_at, is_email_verified, is_mobile_verified, is_active, next_action, retry_count, comment, user_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const verificationHash = crypto.randomBytes(32).toString('hex');
          const now = new Date();
          const expireAt = new Date(now.getTime() + 24*60*60*1000); // 24 hours from now

          conn.query(createAdminVerificationQuery, [uniqueReferenceId, adminEmail, verificationHash, expireAt, expireAt, true, false, true, 'null', 0, 'Initial admin setup', JSON.stringify({})], (err, results) => {
            if (err) {
              console.error('Error creating admin verification record:', err);
              return;
            }
            console.log('Admin verification record created successfully.');
          });
        });
      } else {
        console.log('Admin user already exists.');
      }
    });
  } catch (err) {
    console.error('Error in checkAndCreateAdmin:', err);
  }
};

module.exports = checkAndCreateAdmin;
