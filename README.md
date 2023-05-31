# New Public Prototype Garden

This is a prototyping space for trying out new designs for social products.

## Design Principles

A prototype should be a simple demonstration of an idea that makes the idea concrete enough that others can play with it and see what they think of it. As such, prototypes intentionally have several limitations:

* **No persistent data** - All data is stored locally on the client and reset when you re-load the prototype. This avoids the need to worry about breaking existing data when modifying a prototype, reduces abuse risks, and prevents people from thinking prototyes are real products.
* **No login** - You can switch between multiple personas to see how the product looks from their points of view.
* **Single visual style** - Components don't provide the ability to change their visual styling from the default theme. This allows prototypes to focus on the product structure over the visuals, and ensures all components look reasonable when combined.
* **Slowness is okay** - Sometimes it's easier to do things slowly than fast (particularly when using GPT back ends). That's okay for a prototype.
* **Web only** - Making a prototype work as a mobile app is extra work. We want to focus on showing the ideas. 
* **No fancy indexing** - Data is stored as a simple array for each data type, and non-scalable operations like filtering and sorting are used to find the data we want. This wouldn't scale to large data sets but keeps things simple for a demonstration.

In the near future we are likely to introduce a second category of "One time Product" prototypes that relax some of these limitations, but that isn't supported yet.


## Core Architecture

* **Expo + React Native front end**  
* **Google Firebase Back end** 
* **ChatGPT for AI**

These are all chosen because they are simple to use, which is a priority for rapid prototyping.


## Bringing up your Dev Environment

Make sure you have already installed [git](https://github.com/git-guides/install-git) and [yarn](https://classic.yarnpkg.com/lang/en/docs/install).

Clone the prototype garden repository:
```
git clone https://github.com/wearenewpublic/prototypes.git
cd prototypes
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

Sign up for an OpenAI key [here](https://openai.com/blog/openai-api).

Create a file called `functions/keys.js` with the following content:
```
exports.OPENAI_KEY = 'your OPENAI key'`
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
yarn functions
```


## Creating a new prototype

* Choose a prototype that you'd like to use as the starting point for your prototype. E.g. "Chat", "Article", and "ThreadedComments" are specifically designed to be used as starting points.
* Copy that prototype's file from `client/prototype` into a file with the name of your new prototype.
* Edit the prototype metadata at the top of the file. Make sure you change the `key` which forms part of it's URL path.
* Add your prototype to the `prototypes` list in `client/prototyep/index.js`.
* Edit the code for the prototype's screen to have the behavior you want.


## Using Data

The prototype garden uses a very simple data model, with the following functions:
* **useCollection** - Fetch items from a particular table, given sorting rules. This function is a React hook, and so your component will automatically refresh when data changes.
* **useObject** - Fetch an individual data item by its key.
* **addObject** - Add a new object to a table. The ``from``, ``time``, and ``key`` fields are automatically filled in with the current user, time, and object key so you don't need to provide them. 
* **modifyObject** - Modify an object in a table. For prototyes there are no security rules here. When we introduce one time products we will add constraints on what can be modified.
* **usePersona** - Get the current user.
* **useGlobalData** - Get a global variable that isn't part of a collection
* **useSessionData** - Get a variable that is specific to this particular user session.
* **getCollection/Object etc** - Non-hook equivalents of the `use` functions that can be used in a callback.


## Using GPT 

* Play with `chat.openai.com` until you have a prompt that works well
* Add your prompt to `functions/prompts` as a new `.txt` file.
* Within your prompt, write variables in `mustache` format, as `{{param}}`
* Tell your prompt to produce it's final output as JSON format (see the other prompts for examples)
* In your client code, call `gptProcessAsync({promptKey, $params})` 

## Any other Questions
 
 * Email me at `rob@newpublic.org`. I want to have the prototype garden be super easy to use, and I promise to reply to every email.











