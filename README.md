# Citation Relay Service

The Citation Extractor Service (CES-Relay) is a Service Node in a [Value-Adding Network](https://www.eventnotifications.net).

CES-Relay watches an LDN Inbox for `as:Offer` notification messages about parsed publication citation events. For each citation in such document, CES-Relay will try to discover its LDN inbox and send an `as:Announce + ex:Citation` notification message.

## Installation

```
yarn install
yarn build
```

## Configuration

### config.jsonld

Definition of all orchestration and policy execution plugins that will be used.

- `urn:koreografeye:reasonerInstance` - Definition of the N3 reasoner component
- `http://example.org/sendNotification` - Definition of the LDN sender component
- `http://example.org/serializeAs` - Definition of the N3 store serialization component
- `http://example.org/inboxCreator` - Definition of an LDN inbox creator component (used in local experiments)
- `http://example.org/inboxLocator` - Definition of an LDN inbox discovery component

### rules/citationInboxLookup

A N3 rule file that requests:

- For every bibo:mention|citation in the parsed citation document an LDN Inbox location lookup

### rules/announceCitations

A N3 rule file that:

- Send the parsed citation document to the LDN Inbox of the discovered cited artifact