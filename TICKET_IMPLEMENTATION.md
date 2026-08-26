# Ticket system changes

Implemented:
- Tier 1 role: 1541110583108173905
- Tier 2 role: 1541110042307076206
- `/ticket rename <name>`
- `/ticket redirconfig <category>`
- `/ticket reopen`
- `/ticket unclaim`
- Tier 1: close, rename, reopen, unclaim
- Tier 2: all Tier 1 actions + delete
- Closed-ticket redirect category setting with backward compatibility for `ticketClosedCategoryId`
- Reopen/rename ticket lifecycle logging
- Existing feedback/review system retained and wired into ticket lifecycle
- Ticket command registration changed so Tier 1 users are not blocked by a global Manage Channels slash-command permission; setup/dashboard remain permission-gated internally.

Note: Discord cannot move a text ticket channel "inside" another text channel. The redirect target therefore must be a Discord Category. The configuration property is named `ticketClosedRedirectChannelId` to match the requested terminology.
