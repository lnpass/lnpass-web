lnpass
===

A key manager for Lightning and nostr.

## Demo
Download the source and run the application locally, if you want to try things for yourself.

Or see [lnpass.github.io](https://lnpass.github.io) for a current snapshot of the code.\
Please keep in mind that this is using public relays.

## Features

- [x] BIP32: Hierarchical Deterministic Wallets
- [x] BIP85: Deterministic Entropy From BIP32 Keychains
- [x] LUD04: auth base spec (lnurl-auth)
- [x] NIP06: Basic key derivation from mnemonic seed phrase
- [x] NIP19: bech32-encoded entities (nsec/npub)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## License

The project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Resources
- BIP32: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
- BIP85: https://github.com/scgbckbone/bips/blob/passwords/bip-0085.mediawiki
- BIP85-passwords: https://github.com/Coldcard/firmware/blob/master/docs/bip85-passwords.md
- LUD04: https://github.com/lnurl/luds/blob/luds/04.md
- NIP06: https://github.com/nostr-protocol/nips/blob/master/06.md
- NIP19: https://github.com/nostr-protocol/nips/blob/master/19.md
---
- scure-bip32 (GitHub): https://github.com/paulmillr/scure-bip32
- tailwind: https://tailwindcss.com/
- flowbite: https://flowbite-react.com/
- heroicons: https://heroicons.com/
- react-router: https://reactrouter.com/
- html5-qrcode: https://github.com/mebjas/html5-qrcode
