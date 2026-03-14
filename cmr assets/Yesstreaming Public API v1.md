# **Yesstreaming Public API**

*Reverse-Engineered Reference Documentation*

**Base Host:** https://ec2.yesstreaming.net:1150

*Last Updated: March 13 2026 • Status: In Progress*

This documentation is reverse-engineered by inspecting network traffic on cybermetalradio.com, analyzing frontend JavaScript bundles (sc\_player.js, status\_widget.js, status-widget.js, trackrequests-widget.js), and extracting Restangular service definitions from the admin dashboard bundle (index-Bp07COhG.js). No official documentation exists. Findings may be incomplete or change without notice.

This document covers **public endpoints only** — those accessible without authentication by listener-facing widgets and external integrations. Admin/authenticated endpoints are covered in a separate Admin API document.

---

## **Architecture Overview**

The server runs two completely separate API layers from the same host. They share the same underlying data models but differ in response format, authentication requirements, and available fields.

| Layer | Base URL | Notes |
| ----- | ----- | ----- |
| **DRF v2 (Primary)** | /api/v2/ | Django REST Framework. Public read endpoints for most resources. DefaultRouter only registers `forecast/` and `playlist_tracks/`; all others are path()-registered. No OpenAPI/Swagger schema (drf-spectacular not installed; /schema/, /docs/, /swagger/ all return 404). |
| **Tastypie (Legacy)** | /api/ | Older Django-Tastypie layer running alongside v2. Publicly accessible (no auth). Designed for frontend widget embeds (supports JSONP via `callback` param). Schema introspection available at `/api/{resource}/schema/`. Root `/api/` returns 404\. |

### **Response Envelope Difference**

**v2** returns bare JSON objects or arrays directly.

**Tastypie** always wraps responses in a meta/objects envelope:

{  
  "meta": { "limit": 20, "next": "...", "offset": 0, "previous": null, "total\_count": N },  
  "objects": \[...\]  
}

### **Polling Behavior**

The public-facing widgets poll the API at regular intervals:

| Widget | Endpoints Polled | Interval | Transport |
| ----- | ----- | ----- | ----- |
| SC Player (Vue/Axios) | v2/channels/, v2/history/, v2/djs/ | 10 seconds | JSON (CORS) |
| Status Widget — new (Vue/Axios) | v2/history/ | 15 seconds | JSON (CORS) |
| Status Widget — legacy (jQuery) | /api/channels/ (Tastypie) | 10 seconds | JSONP |
| Track Request Widget (jQuery) | /api/allmusic/, /api/playrequest/add/ | On demand | JSONP |

**API versioning note:** `/api/v1/` returns 404 (confirmed). Only v2 and the unversioned Tastypie layer exist.

---

## **Frontend Bundles**

### **Public Widget Scripts (embedded on cybermetalradio.com)**

| Script | Path | Framework | Purpose |
| ----- | ----- | ----- | ----- |
| SC Player | /media/static/js/sc\_player/sc\_player.js | Vue.js \+ Axios (webpack) | Main radio player. Channels, history, DJs, voting. |
| Status Widget (new) | /media/static/js/current\_track\_widget/status\_widget.js | Vue.js \+ Axios | Now Playing widget with voting. |
| Status Widget (legacy) | /media/static/js/external/status-widget.js | jQuery \+ JSONP | Legacy Now Playing. Polls Tastypie /api/channels/. |
| Track Request Widget | /media/static/js/request\_track\_widget/request\_widget.js | jQuery \+ JSONP | Song search and request submission. |
| RTPlayer | /media/static/js/jplayer/rt\_pl.js | jQuery \+ jPlayer | Basic audio stream player. |
| Messages Widget | /media/static/js/external/messages-widget.js | jQuery | Listener shoutbox/messages display. |

### **Admin Dashboard Bundle (not public-facing)**

| Script | Path | Framework |
| ----- | ----- | ----- |
| Admin App | /js/index-Bp07COhG.js | AngularJS 1.8.3 \+ UI-Router (Vite-bundled) |
| Vendor | /js/vendor-CJrKlZwc.js | jQuery 2.1.4, Lodash 4.17.21, Moment.js 2.30.1 |
| Charts | /js/auto-C6vnwv1V.js | Chart.js |
| Angular | /js/angular-BwHXWMpW.js | AngularJS 1.8.3 \+ UI-Router |

---

# **DRF API (v2) — Public Endpoints**

**Base:** https://ec2.yesstreaming.net:1150/api/v2/

## **Music Library**

GET  /api/v2/music/

Full music library, sorted alphabetically by default. Publicly accessible without authentication.

OPTIONS response confirms allowed methods: GET, POST, HEAD, OPTIONS. POST likely requires authentication and allows uploading new tracks. The server describes this as "A viewset for viewing and editing all music on the server."

### **Query Parameters**

| Field | Type | Description |
| ----- | ----- | ----- |
| search\_q | *string* | Full-text search across title and author fields. |
| with\_tags\_only | *boolean* | If true, returns only tracks that have cover art (tag\_image is non-null). |
| server | *integer* | Filter by server ID. |

### **Response Fields**

| Field | Type | Description |
| ----- | ----- | ----- |
| id | *integer* | Unique track ID (primary key). |
| filename | *string* | Formatted as 'ARTIST-TITLE'. |
| meta | *string* | Formatted as 'ARTIST \- TITLE'. |
| public\_path | *string* | Returns '/ARTIST-TITLE.mp3'. |
| path | *string (URL)* | Full server path to the MP3 file. |
| has\_waveform | *boolean* | Whether waveform data exists for this track. |
| region\_length | *?* | Unknown. Returns null. |
| max\_volume\_db | *float|null* | Volume ceiling if applied, otherwise null. |
| author | *string|null* | Artist name. |
| author\_other | *string|null* | Secondary artist name. |
| title | *string|null* | Track title. |
| genre | *string|null* | Genre tag. |
| performance\_type | *string|null* | Performance type tag. |
| composer | *string|null* | Track composer. |
| lyricist | *string|null* | Track lyricist. |
| publisher | *string|null* | Publisher name. |
| label | *string|null* | Record label. |
| album | *string|null* | Album name. |
| year | *string|null* | Release year. |
| comment | *string|null* | Currently stores original platform URL (e.g. Suno link). |
| length | *integer* | Duration in milliseconds. |
| samplerate | *integer* | Sample rate in Hz. |
| audio\_format | *integer* | Audio format as integer enum. Default: 1\. |
| mtime | *datetime* | Last modified timestamp (yyyy-MM-ddTHH:mm:ss). |
| atime | *datetime|null* | Date added timestamp. Auto-set on creation. |
| checksum | *string|null* | File checksum. |
| requestable | *boolean* | Whether track can be requested by listeners. Default: true. |
| requests\_number | *integer* | Request counter. Default: 0\. Schema confirms it is a genuine counter (verbose name: 'Requests number'), though observed values do not increment in real-time testing. |
| human\_up | *integer* | Positive vote count from listeners. Default: 0\. |
| human\_down | *integer* | Negative vote count from listeners. Default: 0\. |
| auto\_up | *integer* | Automated scheduling weight boost (verbose name: 'Growth the number of listeners'). Default: 0\. |
| auto\_down | *integer* | Automated scheduling weight penalty (verbose name: 'Reduce the number of listeners'). Default: 0\. |
| tag\_image | *string (URL)|null* | Cover art URL (small/ID3 tag size). |
| image\_medium | *string (URL)|null* | Medium cover art URL. |
| image\_large | *string (URL)|null* | Large cover art URL. Note: verbose\_name in schema erroneously says 'Medium size image' — appears to be a label copy-paste bug in their codebase. |
| gain\_db | *float|null* | Gain in dB. Default: 0\. |
| peak\_value | *float|null* | Peak audio value. |
| isrc | *string|null* | International Standard Recording Code. |
| mbid | *string|null* | MusicBrainz ID. |
| playback\_start\_time | *float|null* | Playback region start time in seconds. |
| playback\_end\_time | *float|null* | Playback region end time in seconds. |
| playback\_start\_bytes\_offset | *integer|null* | Byte offset for playback region start. |
| playback\_end\_bytes\_offset | *integer|null* | Byte offset for playback region end. |
| playback\_region\_calculation\_status | *integer|null* | Status of region calculation. Possibly an enum. |
| disable\_crossfade | *boolean* | If true, crossfade is disabled for this track. Default: false. |
| server | *related* | Foreign key to server. Integer ID in v2, resource URI in Tastypie. |

### **Individual Track**

GET  /api/v2/music/\[SONG\_ID\]/

Returns same fields as /music/. Also exposes the following sub-endpoints:

| Sub-endpoint | Method | Description |
| ----- | ----- | ----- |
| like/ | POST | Upvote this track. Response: `{ up: N, down: N }`. Returns 400 with `{ result: "already_voted" }` if IP has already voted. |
| dislike/ | POST | Downvote this track. Same response format as like/. |
| download/ | GET | Downloads the track file. |
| playlists/ | GET | Returns playlist IDs containing this track. |
| regions/ | GET | Playback region data. |
| waveform/ | GET | Waveform data for the track. |

---

## **Play History**

GET  /api/v2/history/

Log of all played tracks, newest first. Paginated with a **rolling window of 500 entries** (`count` field is always 500).

### **Query Parameters**

| Field | Type | Description |
| ----- | ----- | ----- |
| limit | *integer* | Number of entries per page. |
| offset | *integer* | Pagination offset. Example: `limit=1000&offset=1000` retrieves page 2\. |
| server | *integer* | Filter by server ID. |

### **Response Fields**

| Field | Type | Description |
| ----- | ----- | ----- |
| id | *integer* | Log entry ID. Separate namespace from Song ID. |
| ts | *integer* | **Unix milliseconds** timestamp of when track began playing. Example: `1760114188000`. |
| metadata | *string* | Formatted as 'ARTIST \- TITLE'. |
| author | *string* | Artist name. |
| author\_other | *string|null* | Secondary artist name. |
| title | *string* | Track title. |
| genre | *string|null* | Genre. |
| performance\_type | *string|null* | Performance type. |
| lyricist | *string|null* | Track lyricist. |
| composer | *string|null* | Track composer. |
| publisher | *string|null* | Publisher name. |
| label | *string|null* | Record label. |
| playlist\_title | *string* | Name of playlist track was played from. |
| dj\_name | *string* | DJ name if applicable. |
| n\_listeners | *integer* | Listener count at the moment the track began. Snapshot — does not update. |
| length | *integer* | Duration in **milliseconds**. Example: `345002` \= \~5:45. |
| all\_music\_id | *integer* | Song ID. Links to /api/v2/music/\[id\]/ entries. |
| jingle\_id | *integer|null* | Set when entry is a jingle; null for regular tracks. |
| album | *string|null* | Album name. |
| year | *string|null* | Year. |
| comment | *string|null* | Track comment field. |
| isrc | *string|null* | ISRC code. |
| img\_url | *string (URL)|null* | Cover art (small). |
| img\_medium\_url | *string (URL)|null* | Cover art (medium). |
| img\_large\_url | *string (URL)|null* | Cover art (large). |
| img\_fetched | *boolean* | Whether cover art has been fetched/cached by the server. |

The SC Player uses `history[0].ts` and `history[0].length` to calculate the progress bar position client-side: `elapsed = Date.now() - ts`, percentage \= `elapsed / length * 100`.

---

## **Channels**

GET  /api/v2/channels/?server=1

Current stream and server state information. Returns a bare JSON array (not paginated).

### **Response Fields**

| Field | Type | Description |
| ----- | ----- | ----- |
| id | *integer* | Channel ID. |
| listeners\_current | *integer* | Current listener count (real-time). |
| listeners\_peak | *integer* | Peak listener count. |
| traffic | *string* | Human-readable traffic total (e.g. "78.60 Gb"). |
| state | *integer* | Stream state code. |
| active | *boolean* | Whether channel is active. |
| bitrate | *string* | Stream bitrate (e.g. "320"). |
| s\_type | *string* | Server type (e.g. "icecast-kh"). |
| s\_format | *string* | Stream format (e.g. "mp3"). |
| listeners | *string* | Max listener cap (stored as string despite being numeric). |
| ip\_address | *string* | Streaming server IP. Default: '127.0.0.1'. |
| port | *integer* | Streaming port. |
| ssl\_port | *integer|null* | SSL port if configured. |
| mount\_point | *string* | Icecast mount point. |
| public | *boolean* | Whether listed in public directories. |
| traf | *integer* | Traffic counter (bytes). |
| traf\_month | *integer|null* | Monthly traffic counter. |
| autodj\_enabled | *boolean* | Whether AutoDJ is active. |
| centovacast\_compatible | *boolean* | CentovaCast compatibility flag. |
| stream\_url | *string* | Non-SSL stream URL (e.g. `http://ec2.yesstreaming.net:1320/stream`). |
| secure\_stream\_url | *string* | SSL stream URL (e.g. `https://ec2.yesstreaming.net:1325/stream`). |
| admin\_link | *string* | Admin panel link. |
| links\_html | *object* | Contains WindowsMedia, Winamp, iTunes, RealPlayer, WebPlayer download links. |
| proxy\_enabled / proxy\_status / proxy\_url\_path | *various* | Proxy configuration fields. |
| ssl\_proxy\_enabled / ssl\_proxy\_status / ssl\_proxy\_url\_path | *various* | SSL proxy configuration fields. |

### **Social Streaming Fields**

Each platform has a consistent set of fields (`_enabled`, `_key`, `_pid`, `_image`, `_image_resolution`). The v2 endpoint exposes image and resolution fields but does **not** expose stream keys (unlike the Tastypie endpoint — see Security Notes).

| Platform | Default RTMP URL |
| ----- | ----- |
| YouTube | rtmp://a.rtmp.youtube.com/live2 |
| Facebook | rtmp://live-api-s.facebook.com:80/rtmp/ |
| Telegram | rtmps://dc4-1.rtmp.t.me/s/ |
| VK | rtmp://stream2.vkuserlive.com:443/vlive |
| Rutube | rtmp://rtmp-lb.ost.rutube.ru/live\_push |

---

## **DJs**

GET  /api/v2/djs/?server=1

Returns a bare JSON array of DJs for the specified server. Used by the SC Player to display the current on-air DJ.

### **Response Fields**

| Field | Type | Description |
| ----- | ----- | ----- |
| id | *integer* | DJ ID. |
| name | *string* | DJ display name. |
| active | *boolean* | Whether DJ account is active. |
| cat | *string* | Type category: 'auto' \= AutoDJ, 'ws' \= WebSocket (browser-based), 'real' \= external encoder, 'server' \= relay. |
| connected | *boolean* | Whether DJ is currently connected to the server. |
| on\_air | *boolean* | Whether DJ is currently broadcasting. |
| port | *string|null* | DJ's stream connection port. |
| stream\_url | *string|null* | DJ's stream URL (for relay-type DJs). |
| priority | *integer* | DJ priority level (0 \= highest). |
| metadata | *string* | Currently playing track formatted as 'ARTIST \- TITLE'. |
| image | *string (URL)* | Full-size DJ avatar URL. |
| image\_thumbnail | *string (URL)* | Thumbnail avatar (cached/resized). |
| image\_medium | *string (URL)* | Medium avatar (cached/resized). |
| meta\_charset | *string* | Character encoding for metadata (e.g. "UTF-8"). |
| volume\_change | *integer* | Volume adjustment applied to this DJ's stream. |
| do\_recording | *boolean* | Whether recordings are enabled for this DJ. |
| do\_recording\_hourly | *boolean* | Whether hourly recording splits are enabled. |
| dt\_connect | *datetime|null* | Connection timestamp. |
| dt\_disconnect | *datetime|null* | Disconnection timestamp. |
| server | *integer* | Server ID. |

The SC Player filters for `active && on_air` to find the current DJ. The legacy status widget queries the Tastypie `/api/djs/` endpoint with explicit filters: `?server=1&active=true&connected=true&on_air=true&limit=1`.

---

## **Playlists**

All playlist write operations require authentication.

GET  /api/v2/playlists/?server=1

All playlists with track count and runtime.

### **Response Fields**

| Field | Type | Description |
| ----- | ----- | ----- |
| id | *integer* | Playlist ID (separate namespace from Song IDs). |
| name | *string* | Playlist name. |
| duration | *integer* | Total runtime in milliseconds. |
| tracks\_num | *integer* | Number of tracks in playlist. |
| playlist\_files\_per\_page | *integer* | Pagination setting. |
| is\_default | *boolean* | Whether this is the default playlist. |
| is\_random | *boolean* | Whether playlist plays in random order. |
| on\_air | *boolean* | Whether currently on air. |
| directory\_name | *string* | Server-side directory name. |
| current\_track\_order | *integer* | Current position in playlist. |
| server | *integer* | Server ID. |

### **Playlist Tracks**

GET  /api/v2/playlists/\[PLAYLIST\_ID\]/tracks/  
GET  /api/v2/playlists/\[PLAYLIST\_ID\]/tracks/\[SONG\_ID\]/  
GET  /api/v2/playlists/\[PLAYLIST\_ID\]/tracks/?q=\[SEARCH\_TERM\]

All tracks within a playlist. List returns same fields as /music/. Individual track entry includes: `id`, `order`, `flag`, `added_ts`, plus a nested `track` object with full /music/ fields.

---

## **Track Requests**

GET  /api/v2/track\_requests/?server=1

### **Query Parameters**

| Field | Type | Description |
| ----- | ----- | ----- |
| server | *integer* | Filter by server ID. |
| with\_music | *boolean* | Embeds full music object in response. Identical effect to `with_details=true`. |
| with\_details | *boolean* | Identical effect to `with_music=true`. |
| show\_pending | *boolean* | When true (with `with_message=false&with_name=false`), reveals ghost/anonymous requests hidden by default. |
| limit | *integer* | Page size. |
| offset | *integer* | Pagination offset. |

### **Response Fields**

| Field | Type | Description |
| ----- | ----- | ----- |
| id | *integer* | Request log entry number. |
| dttm | *integer* | Unix milliseconds timestamp of when request was made. |
| played\_at | *integer* | Unix milliseconds timestamp of when request was played. |
| all\_music | *object* | Embedded music object when `with_music=true`. |
| person | *string* | Requester display name. |
| message | *string* | Request message text. |
| src\_ip | *string* | IP address of requester. |
| moderated | *boolean* | Whether request was approved by a moderator. |
| server | *integer* | Server ID. |

---

## **Listening Hours**

GET  /api/v2/listening\_hours/?date1={unix\_ts}\&date2={unix\_ts}\&server=1

Total listening hours for a date range. Returns nothing if date params are omitted.

| Field | Type | Description |
| ----- | ----- | ----- |
| total\_time | *integer* | Total listening time across all dates in range. |
| dates | *array* | Array of `{ date, time }` objects for each day in the range. |

Excel export available at: `/api/v2/listening_hours/?date1=...&date2=...&server=...&excel=1`

---

## **Track Stats**

GET  /api/v2/track\_stats/?server=1

Track playback statistics. Supports date range filtering.

### **Sub-endpoints**

| Endpoint | Description |
| ----- | ----- |
| `GET /api/v2/track_stats/?date1=...&date2=...&server=1` | Track stats for date range. |
| `GET /api/v2/track_stats/best/?server=1` | Top-rated tracks (by listener votes). |
| `GET /api/v2/track_stats/worst/?server=1` | Worst-rated tracks. |
| `GET /api/v2/track_stats/csv/?date1=...&date2=...&server=1` | CSV export. |
| `GET /api/v2/track_stats/best_excel?server=1` | Excel export of top tracks. |
| `GET /api/v2/track_stats/worst_excel?server=1` | Excel export of worst tracks. |

---

## **Jingles**

GET  /api/v2/jingles/tree/?server=1  
GET  /api/v2/jingle\_schemes/?server=1  
GET  /api/v2/jingle\_categories/?server=1

Field detail for jingle endpoints is work in progress.

---

## **Other v2 Public Endpoints**

| Endpoint | Description |
| ----- | ----- |
| /api/v2/rotations/?server=1 | Rotation schedule data. |
| /api/v2/news/ | News entries (CRUD available with auth). |
| /api/v2/player\_widget\_settings/1/ | Player widget configuration. |
| /api/v2/catalog/free\_port/ | Returns available port. |
| /api/v2/podcasts/?server=1 | Returns empty array — no podcasts currently configured on CMR. |
| /api/v2/podcasts\_settings/?server=1 | Podcast page config (title\_tag, description\_tag, block\_footer\_html, display\_player). |
| /api/v2/copyright\_settings/ | White-labeling/branding info (logo, copyright text). |
| /api/v2/settings/ | Global application/radio settings. |
| /api/podcast\_feed/{server\_id}/ | RSS podcast feed (not a v2 endpoint — separate path). |

### **Auth-Required v2 Endpoints (listed for reference)**

| Endpoint | Notes |
| ----- | ----- |
| /api/v2/stereo\_tool\_settings/ | Stereo Tool DSP settings. Requires login. |
| /api/v2/api-token-auth/ | Token generation. POST `{ username, password }`. |
| /api/v2/playlist\_tracks/ | Returns empty array without auth. |
| /api/v2/forecast/ | Returns HTTP 500\. Purpose unknown. |

---

# **Legacy Tastypie API — Public Endpoints**

**Base:** https://ec2.yesstreaming.net:1150/api/

Older Django-Tastypie API layer running alongside v2. All endpoints below are publicly accessible. Schema introspection is available at `/api/{resource}/schema/` for any Tastypie resource. Supports JSONP via `callback` query parameter for cross-domain widget embedding.

## **All Music**

GET  /api/allmusic/?server=1  
GET  /api/allmusic/schema/  (full field schema with types and defaults)  
GET  /api/allmusic/\[SONG\_ID\]/

Full music library. Exposes more fields than v2/music/ including `waveform` (as string), `category`, and `resource_uri`.

### **Query Parameters**

| Field | Type | Description |
| ----- | ----- | ----- |
| server | *integer* | Required. Server ID. |
| filter | *string* | Alphabetical letter filter. |
| query | *string* | Full-text search across title and author. Use this for search-to-request flows. |
| requestable | *boolean (exact)* | Filter by requestable status. Confirmed valid via schema. Use `requestable=true` to return only requestable tracks. |
| limit | *integer* | Page size. Default: 20\. |
| offset | *integer* | Pagination offset. |

---

## **Play Request (Submit a Track Request)**

GET  /api/playrequest/add/?server=1\&allmusic={song\_id}\&person={name}\&message={text}

Accepts GET only. POST returns HTTP 405\.

### **Query Parameters**

| Field | Type | Description |
| ----- | ----- | ----- |
| server | *integer* | Required. Server ID. |
| allmusic | *integer* | Required. Track ID from /api/allmusic/ or /api/v2/music/. |
| person | *string* | Required. Display name of the requester. |
| message | *string* | Required. Request message text. |
| timeoutIP | *integer* | IP-based cooldown in milliseconds. |
| timeoutTrack | *integer* | Per-track cooldown in milliseconds. |

**On success:** returns empty body with HTTP 200\. The request appears in history formatted as 'ARTIST \- TITLE \[Requested by {person}: {message}\]'.

**Error responses:** `track_not_found`, `ip_timeout`, `track_timeout`.

---

## **Bot Request Flow**

Recommended implementation pattern for a bot or integration:

1. User issues a request command with a search term.  
2. `GET /api/allmusic/?server=1&filter={term}&limit=10&requestable=true`  
3. Filter results where `requestable === true` (client-side safety check in addition to server-side filter).  
4. Present a numbered list to the user.  
5. `GET /api/playrequest/add/?server=1&allmusic={id}&person={username}&message={text}`

---

## **DJs (Tastypie)**

GET  /api/djs/?server=1

### **Query Parameters (schema-confirmed)**

| Field | Type | Description |
| ----- | ----- | ----- |
| server | *integer* | Required. Server ID. |
| active | *boolean* | Filter to active DJs only. |
| connected | *boolean* | Filter to currently connected DJs. |
| on\_air | *boolean* | Filter to DJs currently on air. |

### **Response Fields**

Same fields as v2/djs/ with the following differences: `server` is a resource URI string (e.g. `/api/servers/1/`) instead of an integer, and `resource_uri` is included. The `image_thumbnail` and `image_medium` cached fields are not present — only `image`.

---

## **Channels (Tastypie)**

GET  /api/channels/?server=1  
GET  /api/channels/schema/  (full field schema with types and defaults)

More detailed than v2/channels/. Key field differences from v2:

| Field | Description |
| ----- | ----- |
| listeners\_air | Current live listener count (integer). This is the real-time count; v2 uses `listeners_current` for the same purpose. |
| pid | Process ID of the Icecast stream process. |
| host | Hostname (not present in v2). |
| config\_file | Server-side Icecast config file path (e.g. `/var/users/matworpex/conf/icecast_1.conf`). |
| burst\_size | Icecast burst size in bytes. Default: 131072 (128 KB). |
| queue\_size | Icecast queue size in bytes. Default: 524288 (512 KB). |
| samplerate | Audio sample rate in Hz. |
| allow\_auth\_listeners\_only | Restrict to authenticated listeners only. |
| sc\_authhash / shoutcast\_license\_key / shoutcast\_uid | ShoutCast-specific credentials. |

All social streaming fields are present with their `_enabled`, `_key`, `_pid`, `_url`, `_image`, `_image_resolution` variants.

**⚠ SECURITY CONCERN:** This endpoint returns live social streaming keys (YouTube, Facebook, VK, Telegram, Rutube) in plaintext to unauthenticated JSONP requests. The YouTube stream key has been confirmed present in HAR captures. The v2/channels/ endpoint does NOT expose stream keys. See Security Notes.

---

## **History (Tastypie)**

GET  /api/history/?server=1\&limit=10

Legacy play history. Similar to v2/history/ but with different field structure.

Key difference from v2: uses `dttm` field instead of `ts`. The `dttm` format in Tastypie needs independent verification — v2/history/ uses `ts` (Unix milliseconds) exclusively and does not include a `dttm` field.

Supports `format=jsonp` query parameter for JSONP cross-domain requests.

---

## **Servers**

GET  /api/servers/1/

| Field | Type | Description |
| ----- | ----- | ----- |
| id | *integer* | Server ID. |
| title | *string* | Server title. |
| description | *string* | Server description. |
| genre | *string* | Genre tag. |
| image | *string (URL)* | Server logo URL. |
| url\_address | *string* | Public website URL. |
| autodj\_version | *string* | AutoDJ software version string. |
| minisite\_display | *boolean* | Whether to show mini-site. |
| default | *boolean* | Whether this is the default server. |
| pid | *integer* | Server process ID. |
| resource\_uri | *string* | Tastypie resource URI. |

---

## **Authentication**

POST  /api/v2/api-token-auth/

**Payload:** `{ "username": "...", "password": "..." }`

Token-based authentication. POST credentials to receive a token. Include in subsequent requests as:

Authorization: Token {key}

The admin dashboard uses a JWT variant (`Authorization: JWT {token}`) for its own API calls. Public endpoints require no authentication.

API keys can also be generated in the admin panel at `/settings/api_keys` — preferred over reusing main account credentials.

---

# **Security Notes**

**YouTube Stream Key Exposure:** The Tastypie `/api/channels/` endpoint returns the live YouTube stream key (`youtube_stream_key` field) in plaintext to unauthenticated JSONP requests. This is actively exploitable — anyone loading the public radio site can extract the stream key from the JSONP response. The v2/channels/ endpoint does NOT return stream keys. This is a Tastypie-specific leak.

**Exposed Server Internals (Tastypie channels):** The Tastypie channels response also exposes: server config file paths (`/var/users/matworpex/conf/icecast_1.conf`), process IDs, and internal IP addresses. The v2 endpoint is more conservative but still exposes `admin_link`.

**No Rate Limiting Observed:** No rate limiting has been observed on any public endpoint. The polling widgets themselves operate on 10-15 second intervals.

---

# **Coverage Summary**

| Endpoint | Status | Notes |
| ----- | ----- | ----- |
| /api/v2/music/ | **Public** | GET confirmed. POST allowed (OPTIONS-confirmed) but likely requires auth. |
| /api/v2/music/\[id\]/ | **Public** | GET confirmed. Sub-endpoints: like/, dislike/, download/, playlists/, waveform/, regions/. |
| /api/v2/history/ | **Public** | Paginated. Rolling window of 500 entries. `ts` is Unix milliseconds. |
| /api/v2/channels/ | **Public** | Stream state and social streaming config. Does NOT expose stream keys. |
| /api/v2/djs/ | **Public** | DJ list with thumbnail/medium cached images. |
| /api/v2/track\_requests/ | **Public** | Supports show\_pending flag. Admin can DELETE/approve via authenticated calls. |
| /api/v2/listening\_hours/ | **Public** | Requires date1 and date2 params. Excel export available. |
| /api/v2/track\_stats/ | **Public** | Includes best/worst sub-endpoints and CSV/Excel exports. |
| /api/v2/playlists/ | **Public read** | Write requires auth. |
| /api/v2/playlists/\[id\]/tracks/ | **Public** |  |
| /api/v2/jingles/tree/ | **Public** | Field detail WIP. |
| /api/v2/jingle\_schemes/ | **Public** |  |
| /api/v2/jingle\_categories/ | **Public** |  |
| /api/v2/rotations/ | **Public** |  |
| /api/v2/news/ | **Public read** | CRUD with auth. |
| /api/v2/player\_widget\_settings/1/ | **Public** |  |
| /api/v2/podcasts/ | **Public** | Returns empty array on CMR. |
| /api/v2/podcasts\_settings/ | **Public** |  |
| /api/v2/catalog/free\_port/ | **Public** |  |
| /api/v2/copyright\_settings/ | **Public** | White-labeling info. |
| /api/v2/settings/ | **Public** | Global settings. |
| /api/v2/api-token-auth/ | **Auth endpoint** | POST credentials for token. |
| /api/v2/stereo\_tool\_settings/ | **Auth Required** |  |
| /api/v2/playlist\_tracks/ | **Auth Required** | Empty without auth. |
| /api/v2/forecast/ | **Broken** | Returns HTTP 500\. |
| /api/allmusic/ | **Public** | Tastypie. requestable=true confirmed as valid filter. |
| /api/playrequest/add/ | **Public** | Tastypie. GET only — POST returns 405\. |
| /api/djs/ | **Public** | Tastypie. Supports active/connected/on\_air filters. |
| /api/channels/ | **Public** | Tastypie. ⚠ Leaks stream keys. More fields than v2. |
| /api/history/ | **Public** | Tastypie. Different field structure than v2. |
| /api/servers/1/ | **Public** | Tastypie. |
| /api/podcast\_feed/{id}/ | **Public** | RSS feed (separate from v2). |
| /api/v2/schema/ (and /docs/, /swagger/) | **Dead End** | All return 404\. No OpenAPI schema installed. |
| /api/ (Tastypie root) | **Dead End** | Returns 404\. No resource registry. |
| /api/v1/ | **Dead End** | Returns 404\. No v1 exists. |

---

*Sources: HAR capture of cybermetalradio.com, beautified sc\_player.js (Vue/Axios widget), beautified index-Bp07COhG.js (AngularJS admin bundle — 28 Restangular service definitions extracted), Radio Players embed code (Google Doc), OPTIONS/schema endpoint probes.*

*Last updated: March 2026*

