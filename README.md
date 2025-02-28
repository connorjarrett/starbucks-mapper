# starbucks-mapper
Graph your addiction

## Installation
1. Clone the repo to your local machine
2. Create a `.env` file in the repository
3. Log in to [starbucks.co.uk](starbucks.co.uk) on your browser
4. In the web inspector, find `auth` under
    - `Storage / Local Storage / www.starbucks.co.uk` (Safari 18.3)
    -  `Application / Storage / Local Storage / www.starbucks.co.uk` (Chrome 133.0)
5. Paste the `auth` token into `.env` as `STARBUCKS_BEARER`
    - `STARBUCKS_BEARER='...'`
6. If you want location data, go to [Google Cloud Console](https://console.cloud.google.com) and create a new project
7. Under `APIs & Services`, enable [Custom Search API](https://console.cloud.google.com/apis/api/customsearch.googleapis.com/)
8. Create an API key, as well as a search context limited to `starbucks.co.uk` (or any other region)
9. Paste your Google API key into `.env` as `GOOGLE_KEY`
    - `GOOGLE_KEY='...'`
10. Run the script with `node index.js`, and when it's complete - open the directory in your browser to see the graphs.

## Information Displayed
### From Starbucks API Key
- Monthly Purchases & Free drinks
- Pie chart of most visited stores
- Monthly spend

### From Google API Key
- Map of stores, with size correlating to number of visits