# n8n-nodes-rowfeed

n8n community node for [Rowfeed](https://apify.com/rowfeed) Apify Actors: SEO, keyword and lead data in your n8n workflows and AI agents.

## Operations

| Operation | What you get | Price (paid to Apify, per event) |
|---|---|---|
| Keyword Search Volume | Google/Bing volume, CPC, competition, trend for a few keywords | $0.04 per lookup + $0.003 per keyword |
| Keyword Search Volume (Bulk) | the same for big lists | $0.60 per 1,000 keywords |
| Google Maps Leads | businesses with phone, website, rating, optional e-mails | from $0.002 per place |
| Website Contacts | company e-mails, phones, socials, contact forms | $0.002 per website |
| Company Enrichment by Domain | name, socials, tech stack, mail provider, domain age | $0.002 per company |
| Impressum / Company Data | legal name, address, HRB number, VAT ID, directors (DE/AT/CH) | $0.002 per website |
| Google Search Results | organic results for any query and country | $0.003 per page |
| Backlinks, Domain Authority, Website Traffic, SEO Site Audit, Competitor Keywords | SEO data per domain | see each Actor |
| Google Maps Reviews, YouTube Transcript | reviews and transcripts | see each Actor |
| Run Any Rowfeed Actor | any Actor from apify.com/rowfeed with your own JSON input | see each Actor |

Each operation takes a list (one entry per line), plus location and language where it matters. **Additional Input (JSON)** passes any other field from the Actor's input. The node starts the run, waits for it to finish and returns one n8n item per result row. It also works as a tool for the n8n AI Agent.

## Setup

1. In n8n: Settings > Community Nodes > Install > `n8n-nodes-rowfeed`.
2. Create a **Rowfeed (Apify) API** credential with your Apify API token (Apify Console > Settings > API & Integrations). A free Apify account works for the examples; live data needs any paid Apify plan for most Actors.
3. Add the **Rowfeed** node, pick an operation and run.

Runs are billed to your own Apify account at each Actor's pay-per-event price; there is no other fee.

## License

MIT
