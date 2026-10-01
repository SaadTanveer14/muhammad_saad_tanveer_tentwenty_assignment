# Movie DB API Integration Specification

> **Purpose:** Agent-readable API contract and integration guide for developers, coding agents, and AI assistants working on the Movie DB/TMDB integration.  
>   
> **Source:** Raw Movie DB API documentation supplied by the project.  
>   
> **Important:** The source documentation contains an access token. This specification intentionally uses `<TMDB_ACCESS_TOKEN>` instead of reproducing the token.

---

## 1\. Integration Overview

This integration exposes six operations:

1. **Upcoming Movies**  
2. **Movie Details**  
3. **Movie Videos**  
4. **Movie Images**  
5. **Movie Image URL Builder**  
6. **Search Movies**

### Base URLs

API\_BASE\_URL   \= https://api.themoviedb.org/3

IMAGE\_BASE\_URL \= https://image.tmdb.org/t/p/

### Authentication

All API requests use a Bearer token.

Authorization: Bearer \<TMDB\_ACCESS\_TOKEN\>

accept: application/json

Do not hardcode the token in source code, logs, screenshots, documentation, or client-side configuration.

---

# 2\. Core Data Flow

The central dependency in this integration is `movie_id`.

┌─────────────────────┐

│ Search Movies       │

│ OR                  │

│ Upcoming Movies     │

└──────────┬──────────┘

           │

           │ result.id

           ▼

┌─────────────────────┐

│ selectedMovieId     │

└──────────┬──────────┘

           │

     ┌─────┼──────────────┐

     │     │              │

     ▼     ▼              ▼

 Details Videos          Images

     │     │              │

     └─────┴──────┬───────┘

                  │

                  │ poster\_path /

                  │ backdrop\_path /

                  │ file\_path

                  ▼

          Image URL Builder

                  │

                  ▼

          https://image.tmdb.org/...

## Dependency Rules

- `Search Movies` and `Upcoming Movies` are entry-point APIs.  
- The `id` returned by either entry-point API becomes `selectedMovieId`.  
- `selectedMovieId` is required by:  
  - Movie Details  
  - Movie Videos  
  - Movie Images  
- Image URL construction depends on a path returned by another API:  
  - `poster_path`  
  - `backdrop_path`  
  - `file_path`  
- `image_size` is controlled by the application and is not returned by the movie APIs.  
- Details, Videos, and Images are independent of each other once `selectedMovieId` is known and may be requested in parallel.

---

# 3\. Global Request Contract

## Required Headers

accept: application/json

Authorization: Bearer \<TMDB\_ACCESS\_TOKEN\>

## Common API Error Shape

{

  "success": false,

  "status\_code": 34,

  "status\_message": "The resource you requested could not be found."

}

Agents should not assume every failure has exactly this `status_code`. Treat the response as an error object when `success` is `false` or the HTTP status indicates failure.

---

# 4\. API: Upcoming Movies

## Purpose

Retrieve a paginated list of movies based on release-date and discovery filters.

## HTTP

GET

## Endpoint

{API\_BASE\_URL}/discover/movie

## Source Query Parameters

include\_adult=false

include\_video=false

language=en-US

page=1

sort\_by=popularity.desc

with\_release\_type=2|3

release\_date.gte={min\_date}

release\_date.lte={max\_date}

## Complete Example

GET https://api.themoviedb.org/3/discover/movie?include\_adult=false\&include\_video=false\&language=en-US\&page=1\&sort\_by=popularity.desc\&with\_release\_type=2|3\&release\_date.gte={min\_date}\&release\_date.lte={max\_date}

## Variables

---

Variable              Required          Owner             Description

---

`min_date`            Yes               Application       Lower bound for release date

`max_date`            Yes               Application       Upper bound for release date

`page`                Yes               Application       Pagination page

`language`            Yes               Application       Response language

`include_adult`       Yes               Request           Whether adult configuration     titles are included

`include_video`       Yes               Request           Whether video configuration     titles are included

`sort_by`             Yes               Request           Sorting strategy configuration

## `with_release_type`   Yes               Request           Release type configuration     filter

## Response Structure

{

  "page": 1,

  "results": \[\],

  "total\_pages": 0,

  "total\_results": 0

}

## Movie Result Fields

Important fields observed in the source:

id

title

original\_language

original\_title

overview

popularity

poster\_path

backdrop\_path

release\_date

genre\_ids

vote\_average

vote\_count

adult

Video

Example response

{  
    "page": 1,  
    "results": \[  
        {  
            "adult": false,  
            "backdrop\_path": "/qeQJx07rK2xm8SD2sJxFKhE7gs0.jpg",  
            "genre\_ids": \[  
                878,  
                28,  
                12  
            \],  
            "id": 969681,  
            "title": "Spider-Man: Brand New Day",  
            "original\_language": "en",  
            "original\_title": "Spider-Man: Brand New Day",  
            "overview": "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves \- a powerful villain no one can even see.",  
            "popularity": 615.4834,  
            "poster\_path": "/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",  
            "release\_date": "2026-07-29",  
            "softcore": false,  
            "video": false,  
            "vote\_average": 7.864,  
            "vote\_count": 2949  
        },  
        {  
            "adult": false,  
            "backdrop\_path": "/3icyRAqgakNcQn6aDVz9libFmBA.jpg",  
            "genre\_ids": \[  
                27,  
                878,  
                12  
            \],  
            "id": 1423191,  
            "title": "Resident Evil",  
            "original\_language": "en",  
            "original\_title": "Resident Evil",  
            "overview": "Medical courier Bryan unwittingly finds himself fighting for survival as one fateful, horrifying night collapses around him in chaos.",  
            "popularity": 351.1056,  
            "poster\_path": "/i7UyjfPio0VFHB9rBUZSFyhOoM8.jpg",  
            "release\_date": "2026-09-16",  
            "softcore": false,  
            "video": false,  
            "vote\_average": 7.3,  
            "vote\_count": 617  
        },  
          
    \],  
    "total\_pages": 1001,  
    "total\_results": 20001  
}

## Important Agent Rule

When a user selects a movie from this response:

selectedMovieId \= results\[index\].id

Do not generate or derive the movie ID from the title.

---

# 5\. API: Search Movies

## Purpose

Search for movies using a user-provided text query.

## HTTP

GET

## Endpoint

{API\_BASE\_URL}/search/movie

## Query Parameters

query={query}

include\_adult=false

language=en-US

page=1

## Complete Example

GET https://api.themoviedb.org/3/search/movie?query={query}\&include\_adult=false\&language=en-US\&page=1

## Variables

Variable          Required   Owner                   Dependency

---

`query`           Yes        User/Application        User search text `include_adult`   Yes        Request configuration   Independent `language`        Yes        Application             Independent `page`            Yes        Application             Pagination

## Response Structure

{

  "page": 1,

  "results": \[\],

  "total\_pages": 0,

  "total\_results": 0

}

## Movie Result Fields

id

title

original\_title

overview

poster\_path

backdrop\_path

release\_date

genre\_ids

popularity

vote\_average

vote\_count

adult

video

Original\_language

**Example Response**  
{  
    "page": 1,  
    "results": \[  
        {  
            "adult": false,  
            "backdrop\_path": null,  
            "genre\_ids": \[  
                10402,  
                99  
            \],  
            "id": 925728,  
            "title": "Dream Theater: Riding the Train of Thought",  
            "original\_language": "en",  
            "original\_title": "Dream Theater: Riding the Train of Thought",  
            "overview": "Documentary on Dream Theater's 2004 Train of Thought tour leading up to the Live at Budokan concert.",  
            "popularity": 0.6854,  
            "poster\_path": "/h30GI7azqNQqpVaYgFQVMZGiBes.jpg",  
            "release\_date": "2004-10-05",  
            "softcore": false,  
            "video": true,  
            "vote\_average": 0,  
            "vote\_count": 0  
        },  
        {  
            "adult": false,  
            "backdrop\_path": "/u5NWHVhZ6HWc1fXnqn82cMar5St.jpg",  
            "genre\_ids": \[  
                18  
            \],  
            "id": 1241983,  
            "title": "Train Dreams",  
            "original\_language": "en",  
            "original\_title": "Train Dreams",  
            "overview": "A logger leads a life of quiet grace as he experiences love and loss during an era of monumental change in early 20th-century America.",  
            "popularity": 14.9109,  
            "poster\_path": "/jnaOmD9PmAkNjgVtCn17o7clOYe.jpg",  
            "release\_date": "2025-11-05",  
            "softcore": false,  
            "video": false,  
            "vote\_average": 7.325,  
            "vote\_count": 1197  
        },  
        {  
            "adult": false,  
            "backdrop\_path": null,  
            "genre\_ids": \[  
                18  
            \],  
            "id": 290877,  
            "title": "Train of Dreams",  
            "original\_language": "en",  
            "original\_title": "Train of Dreams",  
            "overview": "At 16, Tony is an English-speaking high-school drop-out in Montreal. In trouble with the law and at odds with his struggling single parent mother, Tony is sent to Juvie where he realizes that he's neither as tough or as disadvantaged as he thought. Then he comes home on a weekend pass only to find his younger brother following in his footsteps.",  
            "popularity": 0.6294,  
            "poster\_path": "/l5lmoZEG0OewsajRc8qpqYhoE5I.jpg",  
            "release\_date": "1987-01-02",  
            "softcore": false,  
            "video": false,  
            "vote\_average": 4.3,  
            "vote\_count": 3  
        },  
        {  
            "adult": false,  
            "backdrop\_path": "/yPFOaBsXLVeFHeUHRJCZVier9vm.jpg",  
            "genre\_ids": \[\],  
            "id": 1756590,  
            "title": "How to Fast Train Your Furious Dragon",  
            "original\_language": "en",  
            "original\_title": "How to Fast Train Your Furious Dragon",  
            "overview": "The dream chasers race nitro-injected street cars and join forces with dragon rider Hiccup in the wildest cross-over ever dreamed up as 'DREAMZzz', 'The Fast and the Furious' and 'How to train your Dragon' collide head on. But the Nightmare King is always scheming and plans to corrupt the friendly dragons of Berk, and our heroes soon find themselves in a desperate race to save the Dream World.",  
            "popularity": 2.1683,  
            "poster\_path": "/eS599ZhvoOm9GGNpENut5ChKLh4.jpg",  
            "release\_date": "2026-08-17",  
            "softcore": false,  
            "video": false,  
            "vote\_average": 5,  
            "vote\_count": 2  
        },  
        {  
            "adult": false,  
            "backdrop\_path": "/yAyvgUwNGeftgYK5IUPXTQdQsZf.jpg",  
            "genre\_ids": \[  
                10751,  
                16,  
                12  
            \],  
            "id": 207516,  
            "title": "How to Train Your Dragon: Legends",  
            "original\_language": "en",  
            "original\_title": "How to Train Your Dragon: Legends",  
            "overview": "How to Train Your Dragon: Legends is a DVD package that includes the shorts Legend of the Boneknapper Dragon, Gift of the Night Fury, and Book of Dragons. The first release that came out only contained Legend of the Boneknapper Dragon and Book of Dragon. A later version, titled How to Train Train Your Dragon: The Complete Shorts Collection, includes Dawn of the Dragon Racers.",  
            "popularity": 2.1738,  
            "poster\_path": "/4kEVqHV5egVoSl8OhDMImJozSaj.jpg",  
            "release\_date": "2010-11-15",  
            "softcore": false,  
            "video": true,  
            "vote\_average": 7.9,  
            "vote\_count": 78  
        }  
    \],  
    "total\_pages": 1,  
    "total\_results": 5  
}

## Dependency

Search is an entry-point API.

user enters query

       ↓

Search Movies

       ↓

results\[\]

       ↓

user selects result

       ↓

selectedMovieId \= result.id

       ↓

Details / Videos / Images

## Agent Rules

- `query` must come from the current search request.  
- `page` is owned by the UI/application.  
- Empty `results` is a valid response and should not automatically be treated as an API failure.  
- Use `total_pages` to determine whether another page can be requested.

---

# 6\. API: Movie Details

## Purpose

Retrieve detailed information for one selected movie.

## HTTP

GET

## Endpoint

{API\_BASE\_URL}/movie/{movie\_id}

## Query Parameters

language={language}

## Complete Example

GET https://api.themoviedb.org/3/movie/{movie\_id}?language={language}

## Variables

---

Variable          Required          Owner             Dependency

---

`movie_id`        Yes               Application state Must come from selected movie `id`

## `language`        Yes               Application       Independent

## Critical Dependency

Search Movies OR Upcoming Movies

        ↓

results\[\].id

        ↓

selectedMovieId

        ↓

Movie Details

Never call Movie Details with the movie title as the identifier.

## Response Fields

Important fields observed in the source:

id

title

original\_title

original\_language

overview

genres

homepage

imdb\_id

origin\_country

poster\_path

backdrop\_path

production\_companies

production\_countries

release\_date

runtime

spoken\_languages

status

tagline

vote\_average

vote\_count

video

## Example Response {

    "adult": false,  
    "backdrop\_path": null,  
    "belongs\_to\_collection": null,  
    "budget": 0,  
    "genres": \[  
        {  
            "id": 10402,  
            "name": "Music"  
        },  
        {  
            "id": 99,  
            "name": "Documentary"  
        }  
    \],  
    "homepage": "",  
    "id": 925728,  
    "imdb\_id": null,  
    "origin\_country": \[  
        "US"  
    \],  
    "original\_language": "en",  
    "original\_title": "Dream Theater: Riding the Train of Thought",  
    "overview": "Documentary on Dream Theater's 2004 Train of Thought tour leading up to the Live at Budokan concert.",  
    "popularity": 0.6854,  
    "poster\_path": "/h30GI7azqNQqpVaYgFQVMZGiBes.jpg",  
    "production\_companies": \[  
        {  
            "id": 167681,  
            "logo\_path": null,  
            "name": "Warner Strategic Marketing",  
            "origin\_country": ""  
        }  
    \],  
    "production\_countries": \[\],  
    "release\_date": "2004-10-05",  
    "revenue": 0,  
    "runtime": 29,  
    "softcore": false,  
    "spoken\_languages": \[  
        {  
            "english\_name": "English",  
            "iso\_639\_1": "en",  
            "name": "English"  
        },  
        {  
            "english\_name": "Japanese",  
            "iso\_639\_1": "ja",  
            "name": "日本語"  
        }  
    \],  
    "status": "Released",  
    "tagline": "",  
    "title": "Dream Theater: Riding the Train of Thought",  
    "video": true,  
    "vote\_average": 0,  
    "vote\_count": 0  
}

## Agent Rule

The returned `id` should correspond to the requested `movie_id`.

---

# 7\. API: Movie Videos

## Purpose

Retrieve videos associated with a selected movie.

## HTTP

GET

## Endpoint

{API\_BASE\_URL}/movie/{movie\_id}/videos

## Query Parameters

language={language}

## Complete Example

GET https://api.themoviedb.org/3/movie/{movie\_id}/videos?language={language}

## Variables

---

Variable          Required          Owner             Dependency

---

`movie_id`        Yes               Application state Must come from selected movie `id`

## `language`        Yes               Application       Independent

## Response Result Fields

iso\_639\_1

iso\_3166\_1

name

key

site

size

type

official

id

Published\_at  
**Example Response**  
{  
    "id": 1288445,  
    "results": \[  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "“Die Hard on the high seas.”",  
            "key": "c38ogNyQe3g",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a8f3a81185935d0af96c1d3",  
            "published\_at": "2026-08-26T18:51:19.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Moments that will make you STAY-tham",  
            "key": "pz2lYdhm5Gk",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a942cc8a6dbdb24bb8e7856",  
            "published\_at": "2026-08-24T16:02:09.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "The plan: VENGEANCE. You down?",  
            "key": "e4AzAqWaQyg",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a889c53805bb0c3d4c39847",  
            "published\_at": "2026-08-21T17:31:29.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Full speed ahead.",  
            "key": "t1zn2\_bSRtQ",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a8894d298dbd5677019a77b",  
            "published\_at": "2026-08-21T17:28:47.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Rough day? You should see the other guys.",  
            "key": "Tvg6PDnoSaA",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a8765773aa7393ef76e2a21",  
            "published\_at": "2026-08-20T19:00:25.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Hear it from Statham Nation themselves.",  
            "key": "KKx-Bckoqdo",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Featurette",  
            "official": true,  
            "id": "6a873e179b2a7ef80e4cb85c",  
            "published\_at": "2026-08-20T16:14:08.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Remember the name: JASON MF’IN STATHAM.",  
            "key": "RBrY2UDV5GM",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a864801f15a174ffb24c39b",  
            "published\_at": "2026-08-20T00:07:21.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "The mayhem meal",  
            "key": "9TphBN3mbSk",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Featurette",  
            "official": true,  
            "id": "6a8647b09b2a7ef80e4cad3e",  
            "published\_at": "2026-08-20T00:05:20.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Jason Statham and Annabelle Wallis on a MF boat",  
            "key": "nCdqYxKGpv4",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a80c69ee072aded406c9338",  
            "published\_at": "2026-08-15T16:00:21.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "F\*ck around and find out. Only in theaters in ONE WEEK.",  
            "key": "nn2zi9ELu48",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a7f77ca287f6988d5b327bf",  
            "published\_at": "2026-08-14T18:00:11.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "A getaway so good, it hurts.",  
            "key": "ZAe2qKPMxFM",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a7f845a36250202a7792cd3",  
            "published\_at": "2026-08-14T17:24:00.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "ONE WEEK until vengeance comes on board.",  
            "key": "WYryKpBj\_Os",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a7f8476287f6988d5b3283a",  
            "published\_at": "2026-08-14T17:21:23.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Jason Statham stars in Mutiny",  
            "key": "3vc6NCSL6p4",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a7efa36795f695b6cb08dfb",  
            "published\_at": "2026-08-13T19:12:55.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Check out the highlights from the MUTINY Hang Challenge.",  
            "key": "3bVRlJBhHAs",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Featurette",  
            "official": true,  
            "id": "6a7efa5d1e226d9dbbe70fd8",  
            "published\_at": "2026-08-13T19:08:28.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Jason Statham and Annabelle Wallis star in Mutiny",  
            "key": "7loXKUHUdwE",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a7e0dc3c80c0239f4e704d7",  
            "published\_at": "2026-08-13T16:41:49.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "His toughest job yet.",  
            "key": "xM9o-WmjReM",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a7e0e841352ea13332d27ad",  
            "published\_at": "2026-08-12T21:00:26.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Eyes to the skies.",  
            "key": "b1GRq0QvA68",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Featurette",  
            "official": true,  
            "id": "6a7e0e379a000b098d3da0ee",  
            "published\_at": "2026-08-12T19:19:53.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Official Clip ‘Face Off'",  
            "key": "Lx5W4XRRTZM",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Clip",  
            "official": true,  
            "id": "6a7e0e5070bcd707afbf869a",  
            "published\_at": "2026-08-12T16:30:01.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Hook, line, and sinker.",  
            "key": "Qxo-pcECJxk",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a7e0e99dc8a3213364bba56",  
            "published\_at": "2026-08-11T19:00:17.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "See Jason Statham & Annabelle Wallis in Mutiny",  
            "key": "hn-I\_sJtsco",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a7e0d90171baeae53b79eb0",  
            "published\_at": "2026-08-10T17:25:42.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Jason Statham & Annabelle Wallis star in Mutiny",  
            "key": "Lm\_i8NC1hyo",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a74c8e671abbca4383347b9",  
            "published\_at": "2026-08-06T16:21:06.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Official Clip ‘Ambush'",  
            "key": "0QsZHcO6BYY",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Clip",  
            "official": true,  
            "id": "6a73b098f4ffb088b7ac68e1",  
            "published\_at": "2026-08-05T19:00:01.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "PUSH THE F\*CKING BUTTON.",  
            "key": "ptJPjhnUWkw",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Featurette",  
            "official": true,  
            "id": "6a78c3631203ace048cab5dc",  
            "published\_at": "2026-08-05T16:00:22.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Special Feature 'Behind The Scenes'",  
            "key": "MXEbyDvqliQ",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Behind the Scenes",  
            "official": true,  
            "id": "6a73b0b33fa5a5b3e33d6474",  
            "published\_at": "2026-08-05T15:40:08.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "He makes it look so easy.",  
            "key": "hfDf-dn2\_OQ",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a72fbfe96bc262d8829f68a",  
            "published\_at": "2026-08-04T16:05:17.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Mayday, mayday.",  
            "key": "vd1toiNL8P0",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a72fe8f44680f1d8f9940f9",  
            "published\_at": "2026-08-03T17:12:59.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Jason Statham doesn't do small.",  
            "key": "NS9HxYwxXrQ",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Featurette",  
            "official": true,  
            "id": "6a708423cfb6a25eba9becfa",  
            "published\_at": "2026-08-02T17:43:39.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Tools of the trade.",  
            "key": "XDEtpedO1T0",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a6ba990607cfc2d3fe0db6f",  
            "published\_at": "2026-07-30T19:00:19.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Catch Jason Statham and Annabelle Wallis in Mutiny",  
            "key": "Y\_sD9O3xu34",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a6a37e2f8179b6476bb75dd",  
            "published\_at": "2026-07-29T17:00:05.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Jason Statham charges in for Mutiny",  
            "key": "Cy3UEwfdsz0",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a686c1a7ff85eb6ed945ae7",  
            "published\_at": "2026-07-27T17:11:22.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Bow down.",  
            "key": "9D7-U3rxppU",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a6476218667b0fb751a55fa",  
            "published\_at": "2026-07-24T17:44:41.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Greatest to ever do it.",  
            "key": "aQ7Glkzba-8",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a6326c5bc9c671cf677b9ae",  
            "published\_at": "2026-07-23T18:20:46.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Official UK Trailer",  
            "key": "2Iqvbe98Gb4",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Trailer",  
            "official": true,  
            "id": "6a631f77539571056af9a163",  
            "published\_at": "2026-07-23T11:00:26.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Adrenaline on tap. Jason Statham ups the ante in Mutiny.",  
            "key": "KWyElOAgcPM",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a61585d3b8b3bdda8fa7f91",  
            "published\_at": "2026-07-22T21:49:25.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "All hands on deck. We’re officially ONE MONTH away from Mutiny.",  
            "key": "2GD2uLTGQzg",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a61588c9a67999b7f742788",  
            "published\_at": "2026-07-21T16:00:17.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Fast car, faster hands. Catch these hands in Mutiny.",  
            "key": "eyUK6Cvi-r0",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a6158bcf250be26962d8b03",  
            "published\_at": "2026-07-20T17:17:49.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Official Trailer 2",  
            "key": "MPyXlWTZ32E",  
            "site": "YouTube",  
            "size": 2160,  
            "type": "Trailer",  
            "official": true,  
            "id": "6a4e5003b439bb055c7b9d3c",  
            "published\_at": "2026-07-08T13:15:01.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "This one’s for you.",  
            "key": "TosExIUHD1M",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a456f18bac4aaae3ef4974f",  
            "published\_at": "2026-06-24T19:00:29.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Stay ready.",  
            "key": "DNOmEiLNwJ0",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a2b16aa96074d84699a521a",  
            "published\_at": "2026-06-11T19:01:26.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Spelling it out for you.",  
            "key": "l-RHef0IV04",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "6a21bae188585545528255a2",  
            "published\_at": "2026-06-04T17:36:52.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "The hits keep coming.",  
            "key": "OwltW9kxSRg",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "69fda2fd32f359c6859bd369",  
            "published\_at": "2026-05-06T21:00:00.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "First round pick: Jason Statham.",  
            "key": "ZMMYJemXOX4",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "69ebc5a3292b674dedb4e4cd",  
            "published\_at": "2026-04-24T00:00:02.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "No hesitation, no mercy.",  
            "key": "dzKeYuG5kvI",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "69e02dc4863440316ab7fbe4",  
            "published\_at": "2026-04-15T21:23:34.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Locked in.",  
            "key": "x29173yRDXw",  
            "site": "YouTube",  
            "size": 1080,  
            "type": "Teaser",  
            "official": true,  
            "id": "69d849805f201a18d144a1a8",  
            "published\_at": "2026-04-09T22:02:27.000Z"  
        },  
        {  
            "iso\_639\_1": "en",  
            "iso\_3166\_1": "US",  
            "name": "Official Trailer",  
            "key": "FKSdXH89jbo",  
            "site": "YouTube",  
            "size": 2160,  
            "type": "Trailer",  
            "official": true,  
            "id": "69d7c4af0326559314d3bbcf",  
            "published\_at": "2026-04-09T15:05:06.000Z"  
        }  
    \]  
}

## Video Usage

The `key` is the important downstream value for a video player/link.

Movie Videos

    ↓

results\[\]

    ↓

selected video

    ↓

video.key

## Source Documentation Inconsistency

The raw documentation shows a request using movie ID `925728`, while its supplied sample response contains:

"id": 1288445

Agents must not assume the sample response belongs to the request merely because it appears in the same document. In implementation, use the response returned for the actual requested `movie_id`.

---

# 8\. API: Movie Images

## Purpose

Retrieve image metadata for a selected movie.

## HTTP

GET

## Correct Endpoint

{API\_BASE\_URL}/movie/{movie\_id}/images

## Important Source Correction

The raw document contains:

/movie/925728}/images

The extra `}` is a documentation typo. The variable form is:

/movie/{movie\_id}/images

## Variables

---

Variable          Required          Owner             Dependency

---

`movie_id`        Yes               Application state Must come from selected movie `id`

---

## Response

The source documents `backdrops` containing fields such as:

aspect\_ratio

height

iso\_3166\_1

iso\_639\_1

file\_path

vote\_average

vote\_count

Width

**Example Response:**

{  
    "backdrops": \[  
          
        {  
            "aspect\_ratio": 0.667,  
            "height": 3000,  
            "iso\_3166\_1": "HU",  
            "iso\_639\_1": "hu",  
            "file\_path": "/kIJI2gwVdHA9NsZMRu0yD40Bphh.jpg",  
            "vote\_average": 0,  
            "vote\_count": 0,  
            "width": 2000  
        }  
    \]  
}

## Critical Downstream Dependency

Movie Images

     ↓

backdrops\[\]

     ↓

file\_path

     ↓

Image URL Builder

---

# 9\. API: Movie Image URL Builder

## Purpose

Convert an image path returned by Movie DB APIs into a usable image URL.

This is not a movie-data API request. It is URL construction using the image host.

## Base

IMAGE\_BASE\_URL \= https://image.tmdb.org/t/p/

## Endpoint Pattern

{IMAGE\_BASE\_URL}/{image\_size}/{file\_path}

Example:

https://image.tmdb.org/t/p/w500/{file\_path}

## Variables

Variable       Required   Owner          Dependency

---

`image_size`   Yes        Application    UI/device requirement `file_path`    Yes        API response   Comes from movie/image response

## Valid Source Fields for `file_path`

poster\_path

backdrop\_path

backdrops\[\].file\_path

## Example Transformation

poster\_path \= /abc123.jpg

image\_size  \= w500

final URL:

https://image.tmdb.org/t/p/w500/abc123.jpg

## Normalization Rule

If `file_path` already begins with `/`, avoid producing:

https://image.tmdb.org/t/p/w500//abc123.jpg

Normalize the path before concatenation.

---

# 10\. Complete Application Flow

## Flow A: Upcoming Movies

1\. Determine min\_date and max\_date.

2\. Call Upcoming Movies.

3\. Receive results\[\].

4\. Display movie summaries.

5\. User selects a movie.

6\. Store results\[\].id as selectedMovieId.

7\. Call Movie Details.

8\. Call Movie Videos.

9\. Call Movie Images.

10\. Build image URLs from returned image paths.

## Flow B: Search

1\. User enters query.

2\. Call Search Movies.

3\. Receive results\[\].

4\. Display search results.

5\. User selects a movie.

6\. Store results\[\].id as selectedMovieId.

7\. Call Movie Details.

8\. Call Movie Videos.

9\. Call Movie Images.

10\. Build image URLs from returned image paths.

---

# 11\. Parallel Request Strategy

Once `selectedMovieId` exists, these requests do not depend on each other's responses:

selectedMovieId

      │

      ├──→ Movie Details

      │

      ├──→ Movie Videos

      │

      └──→ Movie Images

Therefore, the application may request them concurrently.

Do NOT wait for Movie Details before requesting Videos or Images unless the application architecture specifically requires sequential requests.

---

# 12\. Variable Ownership Matrix

---

Variable            Created By        Used By                 Depends On

---

`query`             User/UI           Search Movies           User input

`min_date`          Application       Upcoming Movies         Application date logic

`max_date`          Application       Upcoming Movies         Application date logic

`page`              UI/Application    Upcoming/Search         Pagination state

`language`          Application       Search/Details/Videos   App locale/config

`selectedMovieId`   Application state Details/Videos/Images   `results[].id`

`movie_id`          Path parameter    Details/Videos/Images   `selectedMovieId`

`poster_path`       API               Image URL Builder       Selected movie response

`backdrop_path`     API               Image URL Builder       Selected movie response

`file_path`         API               Image URL Builder       Movie Images response

`image_size`        Application       Image URL Builder       UI/device requirements

## `video.key`         API               Video UI/player         Movie Videos response

---

# 13\. Recommended Client Models

Agents implementing this integration should keep list/search data separate from detailed movie data.

## MovieSummary

id

title

original\_language

original\_title

overview

popularity

poster\_path

backdrop\_path

release\_date

genre\_ids

vote\_average

vote\_count

adult

video

## MovieDetails

id

title

original\_title

original\_language

overview

genres

homepage

imdb\_id

origin\_country

poster\_path

backdrop\_path

production\_companies

production\_countries

release\_date

runtime

spoken\_languages

status

tagline

vote\_average

vote\_count

video

## MovieVideo

iso\_639\_1

iso\_3166\_1

name

key

site

size

type

official

id

published\_at

## MovieImage

aspect\_ratio

height

iso\_3166\_1

iso\_639\_1

file\_path

vote\_average

vote\_count

width

---

# 14\. State Management Requirements

At minimum, the application should be able to represent:

searchQuery

upcomingPage

searchPage

selectedMovieId

upcomingMovies

searchResults

selectedMovieDetails

selectedMovieVideos

selectedMovieImages

loadingUpcoming

loadingSearch

loadingDetails

loadingVideos

loadingImages

upcomingError

searchError

detailsError

videosError

imagesError

The exact naming is implementation-dependent.

The important requirement is that `selectedMovieId` is the shared state connecting the entry-point movie lists to the dependent APIs.

---

# 15\. Pagination

Both Upcoming Movies and Search Movies expose:

page

total\_pages

total\_results

results

Recommended logic:

if currentPage \< totalPages:

    another page can be requested

else:

    stop pagination

Do not infer pagination availability from `results.length` alone.

---

# 16\. Empty Data Rules

Empty data is not automatically an API failure.

## Empty Search

results \= \[\]

total\_results \= 0

Display an appropriate "no results" state.

## Missing Poster

If:

poster\_path \= null

do not construct an image URL. Use the application's placeholder.

## Missing Backdrop

If:

backdrop\_path \= null

do not construct an image URL. Use the application's fallback presentation.

## No Videos

If the videos response contains no usable results:

results \= \[\]

hide or omit the video section rather than treating the entire movie request as failed.

---

# 17\. Error Handling

Handle these categories independently:

## Network Error

The request did not successfully reach the API.

## HTTP/API Error

The server returned an error status or an API error object.

Example:

{

  "success": false,

  "status\_code": 34,

  "status\_message": "The resource you requested could not be found."

}

## Parsing Error

The response was received but could not be converted into the expected model.

## Empty Response

The request succeeded but contains no relevant records.

Agents should not convert every empty result into an exception.

---

# 18\. Dependency Validation

Before calling dependent endpoints:

if selectedMovieId \== null:

    do not call Details

    do not call Videos

    do not call Images

Before building an image URL:

if file\_path \== null:

    do not build URL

Before opening a video:

if video.key \== null:

    do not attempt to construct the video URL

---

# 19\. Caching Recommendations

## Movie Details

Cache by:

movie\_id

## Videos

Cache by:

movie\_id \+ language

## Images

Cache by:

movie\_id

## Search

Cache by:

query \+ page \+ language

## Upcoming Movies

Cache using the request's relevant date range and page:

min\_date \+ max\_date \+ page \+ language

## Image Assets

Cache using the final image URL/path.

---

# 20\. Security Requirements

The source document contains an access token.

Treat any token present in the raw documentation as potentially exposed.

## Never

commit token to Git

hardcode token in source

put token in screenshots

print token in logs

include token in public documentation

send token to analytics

## Prefer

environment variables

secret managers

secure backend configuration

server-side proxy where appropriate

If the token from the source documentation is still active, rotate/revoke it.

---

# 21\. Agent Implementation Rules

When an AI/development agent works on this integration, follow these rules:

### Rule 1 \--- Preserve ID Dependency

Always use:

results\[\].id → selectedMovieId → movie/{movie\_id}

Never replace the ID with a title, slug, or locally generated identifier.

### Rule 2 \--- Do Not Invent API Fields

Only use fields documented or returned by the API.

If an undocumented field is needed, inspect the actual API response before adding it.

### Rule 3 \--- Keep Entry and Detail APIs Separate

Search/Upcoming results are summary data.

Details is detailed movie data.

Do not assume every field from Details exists in Search/Upcoming results.

### Rule 4 \--- Image Paths Are Not Complete URLs

A value such as:

/poster.jpg

is a path, not a complete URL.

Use:

IMAGE\_BASE\_URL \+ image\_size \+ file\_path

### Rule 5 \--- Handle Nullable Media

Poster, backdrop, and video data may be absent.

The UI must support missing media.

### Rule 6 \--- Do Not Depend on Sample IDs

IDs appearing in documentation examples are examples only.

Use IDs returned by the current API response.

### Rule 7 \--- Preserve Pagination

Do not discard:

page

total\_pages

total\_results

### Rule 8 \--- Keep Auth Out of Logs

Never log:

Authorization

Bearer token

access token

---

# 22\. Endpoint Dependency Table

Endpoint            Entry/Dependent     Required Dependency

---

Upcoming Movies     Entry               None Search Movies       Entry               User query Movie Details       Dependent           `selectedMovieId` Movie Videos        Dependent           `selectedMovieId` Movie Images        Dependent           `selectedMovieId` Image URL Builder   Dependent utility   `file_path` \+ `image_size`

---

# 23\. Minimal End-to-End Example

USER

 │

 │ search("Inception")

 ▼

Search Movies

 │

 │ results\[\]

 ▼

User selects movie

 │

 │ results\[i\].id

 ▼

selectedMovieId

 │

 ├───────────────┬────────────────┐

 ▼               ▼                ▼

Details         Videos           Images

 │               │                │

 │               │                └──→ file\_path

 │               │                         │

 │               └──→ video.key            │

 │                                         ▼

 └────────────────────────────────→ Image URL Builder

                                           │

                                           ▼

                                  Render movie details

---

# 24\. Implementation Checklist

Before considering the integration complete:

- [ ] API base URL configured.  
- [ ] Image base URL configured.  
- [ ] Bearer token loaded securely.  
- [ ] Upcoming Movies implemented.  
- [ ] Search Movies implemented.  
- [ ] Pagination implemented.  
- [ ] `selectedMovieId` stored after selection.  
- [ ] Movie Details implemented.  
- [ ] Movie Videos implemented.  
- [ ] Movie Images implemented.  
- [ ] Image URL construction implemented.  
- [ ] Null poster handling implemented.  
- [ ] Null backdrop handling implemented.  
- [ ] Empty video handling implemented.  
- [ ] Empty search handling implemented.  
- [ ] Network errors handled.  
- [ ] API errors handled.  
- [ ] Parsing errors handled.  
- [ ] API responses mapped to appropriate models.  
- [ ] Sensitive authentication values excluded from logs.  
- [ ] Dependent requests prevented when `movie_id` is missing.  
- [ ] Documentation/sample inconsistencies are not copied into runtime logic.

---

# 25\. Source Notes and Known Inconsistencies

The following points are intentionally preserved because they matter to agents implementing against the supplied source:

1. The Movie Images raw URL contains an extra `}` after the movie ID. Use `/movie/{movie_id}/images`.  
2. The Movie Videos section shows a request for movie ID `925728` but a sample response containing `id: 1288445`. Do not couple those example values.  
3. The raw documentation contains an access token. This file deliberately redacts it.  
4. Image paths returned by movie APIs must be combined with the image host and selected image size before being rendered.  
5. The central runtime dependency across detail-related APIs is `movie_id`.

---

# 26\. Agent Quick Reference

API\_BASE\_URL   \= https://api.themoviedb.org/3

IMAGE\_BASE\_URL \= https://image.tmdb.org/t/p/

ENTRY APIs:

\- GET /discover/movie

\- GET /search/movie

DEPENDENT APIs:

\- GET /movie/{movie\_id}

\- GET /movie/{movie\_id}/videos

\- GET /movie/{movie\_id}/images

IMAGE UTILITY:

\- {IMAGE\_BASE\_URL}/{image\_size}/{file\_path}

PRIMARY ID FLOW:

results\[\].id

    ↓

selectedMovieId

    ↓

movie\_id

    ├── Details

    ├── Videos

    └── Images

IMAGE FLOW:

poster\_path / backdrop\_path / file\_path

    ↓

image\_size

    ↓

IMAGE\_BASE\_URL

    ↓

final image URL

## End of Specification