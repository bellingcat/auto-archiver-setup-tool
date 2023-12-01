# firebase-archiver-2

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


### Release process
1. install firebase locally
2. login to your firebase account with `firebase login`
3. make sure you have access to the project `firebase projects:list`
4. build `yarn build` and then release `firebase deploy --only hosting`
5. to update schedule functions `firebase deploy --only functions`