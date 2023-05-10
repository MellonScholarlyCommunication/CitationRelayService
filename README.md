# Citation Relay Service

The Citation Extractor Service (CES-Relay) is a Service Node in a [Value-Adding Network](https://www.eventnotifications.net).

CES-Relay watches an LDN Inbox for `as:Offer` notification messages about parsed publication citation events. For each citation in such document, CES-Relay will try to discover its LDN inbox and send an `as:Announce + ex:Citation` notification message.

## Installation

```
yarn install
yarn build
```

## Requirements

The demonstration requires a Solid pod running on port 3000 which provides an
LDN inbox on the endpoint https://localhost:3000/ces-relay/inbox/. Check the documentation of the [CSS Solid project](https://github.com/CommunitySolidServer/CommunitySolidServer) how to setup such as Solid pod.

## Example as:Offer

```(json)
{
    "@context" : "https://www.w3.org/ns/activitystreams",
    "id" : "urn:uuid:893ae89f-33f0-4c1a-8f94-7f4e4d27a69e",
    "type" : [
      "Offer",
      "http://example.org/CitationRelay"
    ],
    "actor" : {
      "id" : "https://biblio.ugent.be/profile/card#me",
      "type" : "Service",
      "name" : "Ghent University Academic Bibliography",
      "inbox" : "http://n062-07.wall2.ilabt.iminds.be:3000/inbox/"
    },
    "origin" : {
      "name" : "OAI-Bridge Demo Service",
      "id" : "https://github.com/MellonScholarlyCommunication/OAI-Bridge/profile/card#me",
      "type" : "Service"
    },
    "object" : {
      "id" : "http://n062-07.wall2.ilabt.iminds.be:3001/results/345d50ee-dde8-4dfc-9cfa-96167b1d3c86.ttl",
      "type" : [
         "Document",
         "http://example.org/ParsedCitationDocument"
      ]
    },
    "target" : {
      "id" : "http://n062-07.wall2.ilabt.iminds.be:3002/profile/card#me",
      "type" : "Service",
      "name" : "Citation Extraction Service",
      "inbox" : "http://n062-07.wall2.ilabt.iminds.be:3002/inbox/"
    }
}
```

## Demonstration

Fetch Offers from the CES-Relay inbox

```
yarn watch
```

Prepare the LDN extraction of all bibo:cites and lookup their LDN inboxes

```
yarn extract:prepare
```

Execute the extraction process

```
yarn extract:run
```

Prepare sending Announce messages to the experimental research network for all citations

```
yarn send:prepare
```

Execute sending Announce messages to the experimental network

```
yarn send:run
```

In this last step we created a mock network (generating LDN inboxes to send Announce notification messages).

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

- For every citation in the parsed citation document an LDN Inbox location lookup

### rules/announceCitations

A N3 rule file that:

- Send the parsed citation document to the LDN Inbox of the discovered cited artifact