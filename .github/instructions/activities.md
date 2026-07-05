Implements all endpoints of 'Activity operations' in [Swagger specification](../../src/types/schema/vista-spec.schema.ts)

# Overview

Activities are the main entities of the Vista social network. They can be created by Personal and Enterprise accounts and take place at an online website, in a generic location or in an Establishment.

Users can search for Activities filtering by their name, description, category, language, location, date start/end, price min/max, min/max entries, following accounts only, and in case of physical Activities they can also use the map.
Only Activities published by private accounts will not be visible to users unless they are currently following that account.

# Activity Categories

All Activities are classified (among other things) into categories, which are used to group them by type.
Categories are also organized as a tree structure, where each category can have one additional layer of subcategories.

Each parent category is named after a generic kind of activity and has a color associated with it, which is used to easily identify it.
Meanwhile, subcategories are named after a more specific kind of activity and will use the same color as their parent category as well as a representative icon.

Activities can **ONLY** be associated to subcategories.

# Activity Participants

Users with Personal accounts can participate in Activities by joining them.

# Activity Types

- **Online Activity**: An Activity that takes place on a website, such as a webinar, online class, or virtual event.
- **Onsite Activity**: An Activity that takes place in a physical location.

## Online Activities

This Activity type can be created by any account type (Personal or Enterprise) and requires a URL where it can be accessed, such as a video call link or a website link.

## Onsite Activities

This Activity type requires a location where it can be accessed, such as an Establishment address or coordinates on the map. Any account can create an Onsite Activity on a generic coordinate location on the map, but **ONLY Enterprise accounts** can create an Onsite Activity in an Establishment.