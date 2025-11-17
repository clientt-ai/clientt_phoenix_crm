# Sample Data Manager Skill

This skill manages the sample company "Clientt Sample Inc." and its test users for all system roles.

## What This Skill Does

Manages sample/test data for the application by:
1. Creating or updating the "Clientt Sample Inc." company
2. Creating sample users for each role in the system (admin, manager, user)
3. Ensuring the seed data stays synchronized with the codebase

## Sample Company Details

- **Company Name**: Clientt Sample Inc.
- **Slug**: clientt-sample
- **Purpose**: Testing and development

## Sample Users

The skill maintains these test accounts:

| Email | Role | Password |
|-------|------|----------|
| sample_admin@clientt.com | admin | SampleAdmin123! |
| sample_manager@clientt.com | manager | SampleManager123! |
| sample_user@clientt.com | user | SampleUser123! |

## When to Use This Skill

Use this skill when:
- Setting up a new development environment
- Adding new roles to the system (update seed file)
- Roles have changed or been renamed
- Sample data has become inconsistent
- Need to regenerate sample users

## Commands

### Run the seed file
```bash
mix run priv/repo/seeds.exs
```

### Reset and reseed the database
```bash
mix ash.reset
mix run priv/repo/seeds.exs
```

## Instructions for Claude

When invoked, you should:

1. **Check Current Roles**:
   - Read `lib/clientt_crm_app/authorization/authz_user.ex`
   - Find the `role` attribute to see current valid roles
   - Look for: `constraints one_of: [:role1, :role2, ...]`

2. **Update Seed File if Needed**:
   - If roles have changed, update `priv/repo/seeds.exs`
   - Update the `roles` list to match current system roles
   - Update the password generation logic if needed

3. **Verify Seed File Syntax**:
   - Check the seed file compiles: `mix compile`
   - No syntax errors should exist

4. **Run Seeds**:
   - Execute: `mix run priv/repo/seeds.exs`
   - Confirm success messages appear
   - Note any errors

5. **Verify Creation**:
   - Check that company exists
   - Check that all role users exist
   - Report the login credentials

6. **Report Status**:
   - List all sample users created
   - Provide login credentials
   - Note any issues or missing users

## Maintenance Tasks

### Adding a New Role

If a new role is added to the system:

1. Find the role definition in `AuthzUser` resource
2. Update `priv/repo/seeds.exs` to include the new role in the `roles` list
3. Run the seed file to create the new sample user
4. Update this skill documentation with the new role

### Updating Passwords

To change password format or requirements:

1. Update the password generation logic in `priv/repo/seeds.exs`
2. Consider if you need stronger passwords
3. Update this documentation with new password format

## Files Managed by This Skill

- `priv/repo/seeds.exs` - Main seed file
- `.claude/skills/sample-data-manager.md` - This skill documentation

## Example Output

When successful, you should see:
```
🌱 Starting database seeding...

📦 Setting up sample company: Clientt Sample Inc.
  ✅ Company already exists with ID: abc-123-def

👥 Setting up sample users for all roles...

  📧 Processing sample_admin@clientt.com (admin)...
    ✅ Authentication user already exists
    ✅ Authorization record already exists

  📧 Processing sample_manager@clientt.com (manager)...
    ✅ Authentication user already exists
    ✅ Authorization record already exists

  📧 Processing sample_user@clientt.com (user)...
    ✅ Authentication user already exists
    ✅ Authorization record already exists

============================================================
✅ Seeding complete!
============================================================
```
