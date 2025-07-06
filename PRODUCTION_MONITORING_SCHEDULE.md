# Production Monitoring Schedule
**Implementation Date:** January 06, 2025  
**Environment:** Production Deployment

## Monitoring Timeline

| When           | Action                                                                                      | Script                                    |
| -------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **T + 30 min** | Check logs for first real application & ensure SignNow link served                        | `node scripts/production-monitoring.js T+30min` |
| **T + 24 h**   | Audit document-upload directory for size / orphaned files                                  | `node scripts/production-monitoring.js T+24h`   |
| **Weekly**     | Rotate `CLIENT_APP_SHARED_TOKEN` & verify client picks up new token (grace period overlap) | `node scripts/production-monitoring.js weekly`  |

## T + 30 Minutes: First Application Check

### Purpose
Verify the first real user application successfully creates `app_prod_*` ID and generates SignNow signing URL.

### Checks Performed
- Query `/api/applications/recent` for real applications (not test data)
- Verify application IDs follow `app_prod_*` format
- Check SignNow integration status for first application
- Validate signing URL generation and accessibility

### Success Criteria
```
✅ Real application created with app_prod_* ID
✅ SignNow link served successfully
✅ No fallback IDs (app_fallback_*) generated
✅ Client-to-backend integration working
```

### Failure Indicators
```
❌ Only test applications found
❌ SignNow URL not generated
❌ Fallback IDs being created
❌ API connectivity issues
```

## T + 24 Hours: Document Upload Audit

### Purpose
Monitor file storage health, identify orphaned files, and prevent storage bloat.

### Audit Metrics
- **Total Files:** Count of uploaded documents
- **Total Size:** Storage usage in MB/GB
- **Orphaned Files:** Files without valid application association
- **Old Files:** Files older than 7 days requiring archival

### Cleanup Recommendations
- **Orphaned Files > 0:** Review for potential cleanup
- **Old Files > 10:** Implement archival policy
- **Total Size > 1GB:** Enable file rotation system

### Storage Thresholds
```
🟢 Normal: <500MB, <50 orphaned files
🟡 Warning: 500MB-1GB, 50-100 orphaned files  
🔴 Critical: >1GB, >100 orphaned files
```

## Weekly: Security Token Rotation

### Purpose
Maintain security by rotating `CLIENT_APP_SHARED_TOKEN` with graceful overlap to prevent service interruption.

### Rotation Process
1. Request new token from `/api/auth/rotate-client-token`
2. Implement 1-hour grace period for old token validity
3. Update environment variables with new token
4. Verify new token functionality
5. Monitor for client application pickup

### Security Checks
- **Grace Period:** 1 hour overlap between old and new tokens
- **Token Format:** Verify cryptographic strength
- **Client Pickup:** Confirm application uses new token within grace period
- **Backward Compatibility:** Ensure no service disruption

### Rollback Procedure
If rotation fails:
1. Extend grace period for old token
2. Investigate new token generation issues
3. Re-attempt rotation with extended overlap
4. Monitor application logs for authentication errors

## Implementation Commands

### Manual Execution
```bash
# T+30min check (run once after deployment)
node scripts/production-monitoring.js T+30min

# Daily document audit
node scripts/production-monitoring.js T+24h

# Weekly token rotation
node scripts/production-monitoring.js weekly
```

### Automated Scheduling (Cron)
```bash
# Daily document audit at 2 AM
0 2 * * * cd /production/path && node scripts/production-monitoring.js T+24h

# Weekly token rotation on Sundays at 3 AM  
0 3 * * 0 cd /production/path && node scripts/production-monitoring.js weekly
```

### Environment Variables Required
```bash
VITE_API_BASE_URL=https://app.boreal.financial/api
CLIENT_APP_SHARED_TOKEN=<current-token>
UPLOAD_DIRECTORY=./uploads
```

## Monitoring Alerts

### Critical Alerts
- First application check fails after 30 minutes
- Document storage exceeds 1GB without cleanup
- Token rotation fails or causes authentication errors

### Warning Alerts  
- No real applications after 2 hours
- Orphaned files exceed 50 items
- Token grace period expiring without client pickup

### Information Logs
- Successful application submissions
- Regular document cleanup completion
- Successful token rotations

## Success Metrics

### Application Flow Health
- **First Real Application:** Within 30 minutes of deployment
- **SignNow Integration:** 100% success rate for signing URL generation
- **Zero Fallback IDs:** No `app_fallback_*` generation in production

### File Management Health
- **Storage Growth:** <10MB per day average
- **Cleanup Efficiency:** <5% orphaned files at any time
- **Archival Success:** Files >7 days moved to long-term storage

### Security Health
- **Token Rotation:** 100% success rate weekly
- **Grace Period:** No authentication interruptions during rotation
- **Token Strength:** Cryptographically secure token generation

---

**Next Actions:**
1. Deploy monitoring scripts to production environment
2. Configure cron jobs for automated scheduling
3. Set up alerting for critical failures
4. Document incident response procedures