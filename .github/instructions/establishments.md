Implements all endpoints of 'Establishment operations' in [Swagger specification](../../src/types/schema/vista-spec.schema.ts)

# Overview

Establishments are physical locations where Activities can take place. They can be created and managed by **Enterprise accounts ONLY**, which must be verified by Vista's trusted partner: _to be discussed: Onfido, Trulioo, or Veriff_.

When an Activity is created in an Establishment, it will be associated with that Establishment, allowing users to see the location details and interact with it.
Users can also query for Activities by Establishment.

## Addresses

Establishments can be associated with a specific address, which is used to identify their physical location.
This address will be unique and will be used to prevent duplicate Establishments.

## Establishment Requests

Other Enterprise accounts can send requests to a specific Establishment to organize Activities in it.
These requests can be accepted or rejected by the Establishment owner, allowing them to manage which Activities can take place in their location.