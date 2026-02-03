# Backend Utility Scripts

This folder contains utility scripts for backend operations.

## generatePasswordHash.js

Generates bcrypt password hashes for use in the database.

### Usage

```bash
# From the backend directory
node scripts/generatePasswordHash.js
```

### Output

The script will:
1. Generate a bcrypt hash for the password "password123"
2. Display the generated hash
3. Verify the hash works correctly
4. Show an example SQL UPDATE statement

### Customization

To generate a hash for a different password, edit the `PASSWORD` constant in the script:

```javascript
const PASSWORD = 'your_new_password';
```

### Example Output

```
🔐 Generating bcrypt password hash...

Password: password123
Salt Rounds: 10

✅ Hash generated successfully!

================================================================================
GENERATED HASH:
================================================================================
$2b$10$HkkOqY.56DX7ngec3P23heo9s.HRZhWOMFfzydhWq/pcZudZyTsFi
================================================================================

📋 Copy this hash and use it in your dummy_data.sql file
   Replace the placeholder hash with this real hash.

✓ Verification test: PASSED ✅

================================================================================
EXAMPLE SQL UPDATE:
================================================================================
UPDATE users SET password_hash = '$2b$10$...' WHERE role = 'student';
================================================================================
```

### Notes

- The script uses bcryptjs with 10 salt rounds (2^10 = 1024 iterations)
- Each time you run the script, a different hash will be generated (due to different salt)
- All generated hashes are valid for the same password
- The hash includes the salt, so you don't need to store it separately

### Bcrypt Hash Format

Bcrypt hashes follow this format: `$2b$10$...`

- `$2b$` - Algorithm version
- `10` - Cost factor (salt rounds)
- Remaining characters - Salt + hashed password

### Security Best Practices

1. **Never commit plaintext passwords** to version control
2. **Use environment variables** for production passwords
3. **Use strong passwords** (minimum 8 characters, mix of letters, numbers, symbols)
4. **Increase salt rounds** for production (12-14 recommended)
5. **Rotate passwords regularly** in production environments
