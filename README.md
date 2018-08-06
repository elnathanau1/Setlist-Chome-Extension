# Setlist-Chome-Extension
This Chrome extension provides an easy way for users to add playlists of set lists from setlist.fm to their Spotify account.

## Getting Started

This project is currently still under development. Installation instructions set to change once complete.

## Current Progress

### Front end
Extension currently properly recognizes when the user is on setlist.fm. Once on setlist.fm, the Create Playlist button is enabled. On the options menu, there is a Login button that allows the user to authenticate with Spotify.

### Back end - Spotify
Once the user enters their credentials with Spotify, we are able to receive an authentication token from Spotify. We are then able to exchange this token for access and refresh tokens. Also, methods have been written to:
* get current user's id
* create a playlist for user
* search for tracks in Spotify
* add tracks to Spotify playlist

### Back end - Setlist.fm
We are able to identify what page the user is on, and access the setlist.fm api to acquire a JSON with the set list.

## Next Steps


## Process Flow Chart
* [draw.io](https://www.draw.io/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1#G1sXyfNucKvjiMAFeiKV1HCDKZ7_TKvwHi)


## Authors

* **Elnathan Au** - [elnathanau1](https://github.com/elnathanau1)
* **Iris Chen** - [ichen8](https://github.com/ichen8)
