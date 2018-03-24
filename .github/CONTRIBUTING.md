# Contributing to Counter of Messenger

## How to contribute. Importing and assembling

If you have any questions, feel free to contact with me in English or Chinese.

### Before importation

- Make sure you are using *Node.js 8*.
- Install dependencies.

### Development

You can develop on both browser at same time.
```sh
npm run dev # Chrome
npm run dev-firefox # Firefox
```

> Hint: Going to firefox's about:config and toggling `network.websocket.allowInsecureFromHTTPS`.
> https:// to ws:// is disallowed by default on firefox.

#### Stages

| Stage   | env         | cmd                  |
|---------|-------------|----------------------|
| Release | production  | `npm run build`      |
| Beta    | production  | `npm run build-beta` |
| Dev     | development | `npm run dev`        |

> If you want to emulate beta stage in development mode: `npm run dev -- --env.BETA`

### Submitting Pull Request

> Please use meaningful commit messages.

- Create a new Branch with the changes you made.
- Submit your Pull Request with an explanation of what have you done and why.

> I really appreciate your efforts on contributing to this project.

## Working with translations

1. Firstly, you have to fork the repository by clicking the **Fork** button.
1. Clone your own forked repository to your workstation.
1. Create and switch Branch by typing `git checkout -b <new branch>` where `<new branch>` is the name of the Branch you want to work with. We recommend you to name it into the language you want to translate in.
1. Create a new directory named as a 2 letter ISO code of the language. For example `es` for Spanish, `ja` for Japanese.
1. Copy `src/_locales/en/messages.js` into the directory you have created.
1. Translate
1. Once you finished translating, add new files to the Git index using `git add src/_locales/??/messages.js` command and commit the changes using `git commit -m '<commit message>'`, where `<commit message>` is a short description of changes you made.
1. Push your local changes into your forked repository by typing `git push origin <new branch>`.
1. Finally, create a Pull Request from your Branch to our main Branch *master*.
