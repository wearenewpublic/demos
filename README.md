# New Public Prototype Garden

This is an environment for rapidly prototyping lots of different social product ideas.


## Instance Types

A prototype can be instantiated in three different ways:
* **Role Play Instance** - The user can switch between multiple alphabetically-named fake users and role play interactions between them. There is no persistent state.
* **Live Instance** - Users log in with their real identities using Google Login. Data is stored persistently using Google Firebase.
* **Embedded Instance** (work in progress) - Prototype is embedded in a page on another website, bit inserting a special snippet of javascript.

The same prototype can be instantiated all three ways. This allows us to test the same idea in increasing levels of fidelity.


## Current Limitations

Our current focus is on making it easy to quickly implement and test lots of very different ideas. This has led us to a design that is very simple and flexible, but comes with multiple limitations:

* **Chrome Only** - Some features may not work on other browsers. 
* **Web Only** - We use React Native, in anticipaton of supporting iOS and Android in the future, but currently only support Web.
* **Limited Security and Privacy Guarantees** - A determined hacker could read and write all messages in conversations they have access to.
* **Slowness is Okay** - Sometimes it's easier to do things slowly than fast (particularly when using GPT back ends). That's okay for a prototype.
* **No fancy indexing** - Data is stored as a simple array for each data type, and non-scalable operations like filtering and sorting are used to find the data we want. This wouldn't scale to large data sets but keeps things simple for a demonstration.

We expect to fix all of these limitations as prototypes get closer to production, but these limitations are acceptable for prototyping, and the correct way to address these limitations will be more obvious once we have a better sense of what prototypes people care about.


## Core Architecture

* **Expo + React Native front end**  
* **Google Firebase Back end** 
* **ChatGPT for AI**

These are all chosen because they are simple to use, which is a priority for rapid prototyping.


## Bringing up your Dev Environment

Make sure you have already installed [git](https://github.com/git-guides/install-git) and [yarn](https://classic.yarnpkg.com/lang/en/docs/install).

Clone the prototype garden repository:
```
git clone https://github.com/wearenewpublic/demos.git
cd demos
```

Install the package dependencies:
```
cd functions
yarn
cd ../client
yarn 
cd ..
```

Install the firebase and expo command line tools:
```
yarn global add firebase-tools
yarn global add expo-cli
```

Sign up for an OpenAI key [here](https://openai.com/blog/openai-api), or find your existing OpenAI key [here](https://platform.openai.com/account/api-keys).

Create a file called `functions/keys.js` with the following content:
```
exports.OPENAI_KEY = 'your OPENAI key'
```


## Running Prototypes

In one terminal, start the front end:
```
cd client
yarn web
```

In another terminal, start the back end:
```
cd functions
yarn emulate
```

Use Google Chrome to view [http://localhost:19006/all](http://localhost:19006/all) to see a list of all prototypes in the [organizer](client/organizer/README.md). 


## Creating a new prototype

* Choose a prototype that you'd like to use as the starting point for your prototype. E.g. "Chat", "Article", and "ThreadedComments" are specifically designed to be used as starting points.
* Copy that prototype's file from `client/prototype` into a file with the name of your new prototype.
* Edit the prototype metadata at the top of the file. Make sure you change the `key` which forms part of it's URL path.
* Add your prototype to the `prototypes` list in `client/prototype/index.js`.
* Edit the code for the prototype's screen to have the behavior you want.


## Using Data

The prototype garden uses a very simple data model, with the following functions:
* **useCollection(typename, {filter, sortBy})** - Fetch items from a particular table, given sorting rules. This function is a React hook, and so your component will automatically refresh when data changes.
* **useObject(typename, key)** - Fetch an individual data item by its key.
* **usePersona()** - Get the current user.
* **useGlobalData(key)** - Get a global variable that isn't part of a collection
* **useSessionData(key)** - Get state that is specific to this particular user session. Use together with `datastore.setSessionState(key, value)` to manage global UI state.
* **useDatastore()** - Get a `datastore` object that can be used to modify the datastore from inside a callback.
* **datastore.getCollection/Object etc** - Non-hook equivalents of the `use` functions that can be used to read data within a callback.
* **datastore.addObject/setObject/setSessionData/modifyObject** - Methods to modify the state from within a callback, in response to user actions.

Search for a method name in current prototypes to see how to use these in practice. As with other React apps, you should avoid using global variables to manage state.


## Using GPT 

* Play with `chat.openai.com` until you have a prompt that works well
* Add your prompt to `functions/prompts` as a new `.txt` file.
* Within your prompt, write variables in `mustache` format, as `{{param}}`
* Tell your prompt to produce it's final output as JSON format (see the other prompts for examples)
* In your client code, call `gptProcessAsync({promptKey, $params})` 


## Internationalization

Each prototype instance specifies the language that it is in using the `language` field. This can currently be one of `languageEnglish`, `languageFrench`, or `languageGerman`.

If a string is a hard-coded UI string rather than user content, it should be displayed using `<TranslatableText>` rather than `<Text>`. If a translation is missing for a string then you'll see a message in the javascript console. You can add new translation by editing `translations/[language]/ui_[language].js`.

You can also place translated versions of example content from the `data` directory in equivalently named files in `translations`.


## Any other Questions
 
 * Email me at `rob@newpublic.org`. I want to have the prototype garden be super easy to use, and I promise to reply to every email. Don't worry about asking stupid questions. If this code isn't super-easy to understand then that means I need to make it clearer.


## Directory Layout

Here is a rough overview of what is in each directory:

* **client** - Front end React code that runs in the browser.
  * **assets** - Icon images. You can mostly ignore this.
  * **components** - Shared React components maintained by New Public. If you aren't working for New Public then you should put your components in `contrib` instead. If you want to change one of these components then create your own copy in `contrib`.
  * **contrib** - Shared React components created by people other than New Public. Use a sub-directory with your name or your organization's name. Some contrib components may later graduate to the `components` directory.
  * **data** - English-language data for role-play prototype instances. 
  * **organizer** - Simple UI for browsing prototypes and their instances. You can mostly ignore this.
  * **platform-specific** - Components that need to be implemented differently for Web vs iOS and Android. Right now iOS and Android support is minimal. 
  * **prototype** - This is where the prototypes go. Each one should be in a single self-contained file. Look at existing prototypes to get a feel for how they work.
  * **translations** - Files for [internationalization](#internationalization). 
  * **util** - Shared code that isn't a react component. In particular `datastore` contains hooks for [using data](#using-data). 
* **functions** - Back end Node.js code that runs as Firebase Cloud Functions
  * **bot/botutil** - Experimental support for integrating prototypes with Slack. You can mostly ignore this.
  * **component** - This is where server-side APIs are implemented. Likely the main component you'll want to call is [GPT](#using-gpt). Contact [rob] 
  * **prompts** - [GPT prompts](#using-gpt).
* **public** - Static files, including faces for role play users and images for example articles. If you change anything here you'll need to run `client/update_hosted_files.sh` to see changes reflected in the emulated server.
