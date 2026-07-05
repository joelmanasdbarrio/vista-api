Implements all endpoints of 'Account operations' in [Swagger specification](../../src/types/schema/vista-spec.schema.ts)

# Overview

User accounts are responsible for creating and managing Activities and Establishments in the Vista social network.
They can ONLY be created through Supabase Auth API, which will reflect in the database as a new user record automatically with an SQL trigger using Supabase Auth returned data for name, username, and email.
Users can update and delete their own account at any time.

# Account Types

- **Personal Account**: For individual users and physical persons.
- **Enterprise Account**: For businesses, brands, associations or organizations, and public figures.

## Personal Account

This account **represents a physical person**, being the only account that **can interact with other entities**, such as joining activities and following other users.

It also has the ability to create its own Activities, as long as they don't take place at a specific Establishment.
That is, if a user with a Personal account wants to create an Activity in a physical location, they must locate it at a generic coordinate on the map.

> This is because there is no way of checking when a Personal account has rights over a private property to act on its behalf and publish an Activity in that location.

### Follows

All Personal accounts have the ability to follow other accounts, which allows them to see their published Activities in their feed and receive notifications when they publish new ones.

When an account is set to private, only its followers will be able to see its lists of followers/followings, published Activities, Activity entries, and managed Establishments (if applies).

#### Follow Requests

When a user wants to follow a private account, a Follow Request is created first, which must be accepted or rejected by the account owner.

## Enterprise Account

This account **represents legal entities**, such as businesses, brands, associations or organizations, and public figures. It also has the ability to **create and manage Establishments**, and organize Activities in them.

> To create an Activity or an Establishment, the Enterprise account must be verified by Vista's trusted partner: _to be discussed (Onfido, Trulioo or Veriff)_.