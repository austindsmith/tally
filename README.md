# Tally

Tally is (going to be) a Chrome extension for my wife. It's a general data entry automater.

### Resources

#### Libraries

- [wxt framework](https://wxt.dev/)
- [googleapis/sheets](https://googleapis.dev/nodejs/googleapis/latest/sheets/classes/Sheets.html) Google APIs (change fetch possibly)
- [daisy ui](https://daisyui.com)
- [danfo.js](https://danfo.jsdata.org/) Like pandas
- [heroicons](https://heroicons.com/) For svg icons
- [zustand](https://zustand.docs.pmnd.rs/) State management
- [lodash](https://lodash.com/docs/4.17.23) Simpler data manipulation
- [auto-animate](https://auto-animate.formkit.com/) Form animations
- [shepherd.js](https://www.shepherdjs.dev/) Click through tutorial

#### Documentation

- [google oauth](https://developer.chrome.com/docs/extensions/how-to/integrate/oauth)
- [google sheets api](https://developers.google.com/workspace/sheets/api/reference/rest)

#### Miscellaneous

- [Testing Google Sheet](https://docs.google.com/spreadsheets/d/1aSm4nwINqe_GxEDEjNlBy21mJzHi9Ort5iZJtpGBCyQ/edit?usp=sharing)

#### Ideas

- Allow user to click "Configure"
  - Configure lets them click an element that will have a reference item, such as a name in a row.
  - Then they click the corresponding form field to fill in.
  - Both then set the selectors that the application will use for determining how to fill in the form (so it's dynamic)

#### Notes

- Call functions in `utils` from background.ts using `message.type ===` and then `const var = await functionFromUtils()`
- Content scripts are the only scripts that can access the page's DOM
