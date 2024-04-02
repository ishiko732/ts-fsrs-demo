[![NPM Version](https://img.shields.io/npm/v/fsrs-browser.svg?style=flat)](https://www.npmjs.com/package/fsrs-browser)

# fsrs-browser

This project runs [fsrs-rs](https://github.com/open-spaced-repetition/fsrs-rs) in the browser with support for training FSRS parameters.

## Versioning

We git submodule [`fsrs-rs`](https://github.com/open-spaced-repetition/fsrs-rs/tree/fsrs-browser) and [`burn`](https://github.com/open-spaced-repetition/burn/tree/fsrs-browser) for reasons given [here](https://github.com/Tracel-AI/burn/pull/938#issuecomment-1925913866). As such, it will not be up to date with the latest `fsrs-rs`. `fsrs-browser`'s major and minor version numbers will match the version of `fsrs-rs` used. The patch version number is reserved for `fsrs-browser`'s use and may drift out of sync with `fsrs-rs`.

## Building and demoing

Run `./dev.sh` for fast builds or `./prod.sh` for fast runs.

Run the `/sandbox` project to demo various behavior.

I highly encourage `./prod.sh` if you intend to run training. On my machine training 24,394 revlogs on `./dev` takes days, while `./prod.sh` takes 3.5 seconds.
