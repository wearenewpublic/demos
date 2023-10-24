This is the directory where the main action happens.

Each file in this directory should be one fully self-contained prototype. 

If you find yourself needing more complexity than will fit in one file then you probably want to move some of the functionality into a reusable component, which will usually be in your org's [contrib](../contrib/README.md) directory.

Prototypes should not depend on each other. If you feel tempted to have one prototype import something from another one then you probably want to create a component (likely in [contrib](../contrib/README.md))

Each prototype file must import a struct describing the prototype. This struct should be added to the list in `index.js`. 

## Organizer Felds 

Some of these fields are mostly for use in the [organizer](../organizer/README.md)
* **description** - A short description of what the prototype does
* **name** - The name of the prototype.  
* **key** - A unique key that will form part of the prototype URL
* **author** - Link to an object from `data/authors.js` identifying the author of the prototype.
* **date** - The date the prototype was created. To get a correctly formatted string for the time right now, open a Javascript console and type `new Date().toString()`


## Instance Fields 

There are some fields to control instances of the prototype:
* **instance** - Contains a list of role play instances. Each contains the following fields:
    * **name** - The name of this instance
    * **key** - Key used in the URL for this instance
    * **language** - The language that the UI should be [translated](../translations/README.md) into.
    * The rest of the fields containt the initial data in the instance, which can be read with `useCollection` and `useGlobalData`.
* **newInstanceParams** - Describes the data expected by the prototype, and thus allows someone to create a new live instance


## Screen Fields

These fields define the core screens that the prototype renders
* **screen** - The react component used to render the root screen
* **subscreens** - A dictionary mapping the name of each sub-screen to a `{screen, title}` pair, where screen is a react component for the screen, and title is a react component for it's title.

