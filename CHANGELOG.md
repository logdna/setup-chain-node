## Changelog

# 1.0.0 (2021-05-06)


### Bug Fixes

* **parser**: rework syntax and relax parser for arbitrary values [acb4045](https://github.com/logdna/setup-chain-node/commit/acb4045cbd43ec2aab73c0129b97c1f1cff782f1) - Eric Satterwhite
* allow function argument separator in arguments [8e1cd62](https://github.com/logdna/setup-chain-node/commit/8e1cd62ea85ce7b81fb49d597045b92f5b4a7c89) - Eric Satterwhite
* **chain**: Do not auto-expose action handlers that exist in the child [8f65161](https://github.com/logdna/setup-chain-node/commit/8f65161c41106f1f2d13ff03abaac2477f2c8992) - Eric Satterwhite


### Chores

* **deps**: answerbook/commitlint-config-logdna@1.5.0 [7be55c9](https://github.com/logdna/setup-chain-node/commit/7be55c971c3fc23f7986a19068fddd8d6f0a911c) - Eric Satterwhite
* **deps**: answerbook/stdlib@1.2.0 [70835e9](https://github.com/logdna/setup-chain-node/commit/70835e9f5175731585fde47cdde9869bfe3fca6e) - Eric Satterwhite
* **deps**: configure renovate to scan a different branch [93929cb](https://github.com/logdna/setup-chain-node/commit/93929cb2f3abda75206154153309d336b32ca3f8) - Eric Satterwhite
* **deps**: eslint-config-logdna@4.0.0 [74b90d4](https://github.com/logdna/setup-chain-node/commit/74b90d4b028d37773e11de64d7d635b63eb43bd4) - Eric Satterwhite
* **deps**: revert renovate config [bbc5e56](https://github.com/logdna/setup-chain-node/commit/bbc5e564bc061080d875f522107849f0a99b4eb3) - Eric Satterwhite
* **package**: Prepare this package for open source [4091cba](https://github.com/logdna/setup-chain-node/commit/4091cbaf891e688cbcabe5a04e5b45f3eba6cc42) - Eric Satterwhite
* fix state object in readme [e880879](https://github.com/logdna/setup-chain-node/commit/e880879876761056b5ed1b335830fe6f5ac6a294) - Eric Satterwhite


### Continuous Integration

* fix publish step [81bd847](https://github.com/logdna/setup-chain-node/commit/81bd84716081a13883616e6a97cc543ceb1de001) - Eric Satterwhite
* Replaces github actions with jenkins [5099a13](https://github.com/logdna/setup-chain-node/commit/5099a13c55ad5bde580b87945e6c8573976fecc3) - Eric Satterwhite


### Features

* **chain**: add `template` built-in chain function [9f9c149](https://github.com/logdna/setup-chain-node/commit/9f9c149e54e5d6ea4aa4e7bdf78f979feb3b2e2e) - Eric Satterwhite
* **chain**: allow moment object to pass through lookup functions [a8df377](https://github.com/logdna/setup-chain-node/commit/a8df3771502cfab1537db144c3a232d0568589f3) - Eric Satterwhite
* **chain**: convert `set` function to action [fa1b311](https://github.com/logdna/setup-chain-node/commit/fa1b311c8c8715f769819807e198fd6af6dbc387) - Eric Satterwhite
* **parser**: Implement ast parser for lookup syntax [81cb3cd](https://github.com/logdna/setup-chain-node/commit/81cb3cd0f0a22fdb60f0536417f6ab515eb4d8dd) - Eric Satterwhite
* **pkg**: expose commitlint as npm script [8e78927](https://github.com/logdna/setup-chain-node/commit/8e78927803aa68b22baf10307ea427097ade8078) - Eric Satterwhite


### Miscellaneous

* Add renovate.json [c9803a6](https://github.com/logdna/setup-chain-node/commit/c9803a696d405c043d5bd5c6c2c7af587cc44600) - Eric Satterwhite
* @answerbook/eslint-config-logdna@5.2.0 [11431f8](https://github.com/logdna/setup-chain-node/commit/11431f832502b61fa1cb780527e81f2a4a8c731c) - Eric Satterwhite
* Add .repeat(), .map(), .sort() and custom action signatures [70d2ba6](https://github.com/logdna/setup-chain-node/commit/70d2ba696a87450f326367575b3e0d9f5b5d6212) - Eric Satterwhite
* expose actions as top level functions on the chain instance [cc1467b](https://github.com/logdna/setup-chain-node/commit/cc1467ba050bd44d19edc96536d8fa416da019e9) - Eric Satterwhite
* initial class for seeding test data [44098bf](https://github.com/logdna/setup-chain-node/commit/44098bf602cdc694d46f9b64de1b059c65e297e7) - Eric Satterwhite
* Initial commit [625b407](https://github.com/logdna/setup-chain-node/commit/625b407569ea078459ae12ea90395fac8b63c054) - Darin Spivey
* moment@2.27.0 [5721ff6](https://github.com/logdna/setup-chain-node/commit/5721ff6008cecbb37e6f97e2484be03cb1d99cc0) - Eric Satterwhite
* update documentation for repeat() action params [1085daf](https://github.com/logdna/setup-chain-node/commit/1085daf64e33f6da51e1fb57de288dc3cdaaaead) - Eric Satterwhite
* Initial commit [f31caf0](https://github.com/logdna/setup-chain-node/commit/f31caf034ba122cb1c00a32848782a99ac013501) - Eric Satterwhite


### **BREAKING CHANGES**

* **chain:** the set function is an action an defered until execute
* **chain:** the set function may throw on invalid lookup syntax

Ref: LOG-8400
Semver: major
* **parser:** replaces simple string parser with full syntax grammar
* **parser:** plain object path values are invalid lookups `('a.b')`
* **parser:** identifiers with symbols must be quoted `('"f:b"')`

Ref: LOG-8260
Semver: major