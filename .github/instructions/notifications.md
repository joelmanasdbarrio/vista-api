Implements all endpoints of 'Notifications operations' in [Swagger specification](../../src/types/schema/vista-spec.schema.ts)

# Overview

Notifications are used to inform users about important events related to Activities, Establishments, Accounts, and system.
They are triggered by the system on:
- New Activity creation by a user they follow (with notifications enabled)
- New Activity entry on an Activity they created.
- New Followers.
- Follow/Establishment requests received.
- System events (e.g., maintenance, updates).