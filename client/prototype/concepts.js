import { authorToriSgarro } from "../data/authors";
import { statusConcept, tagConversation } from "../data/tags";

const description_comments_slider = `
This prototype shows a module that allows a user to respond to a question along a spectrum. 
The user moves a slider along the spectrum between two options in order to record their answer, 
and they can add a comment to accompany/explain their answer. After the user has submitted their 
own answer, they see a visualization of the distribution of others’ answers (and associated comments).

# Hypothesis

If people can reply and see others’ replies to a question across a spectrum (rather than 
according to a binary), then the discussion will be more nuanced and less polarizing, because a 
spectrum encourages more nuanced thinking and understanding.

# Questions

* Imagine that you are participating in a discussion on a controversial topic online. You can mark your sentiments along a spectrum and comment. And you can then see how others’ comments and sentiments are distributed along the spectrum as well. How do you feel about participating in a discussion framed this way? What might be appealing to you about this kind of experience? What might be unappealing?

    * Probe: What would you do next? Why?

* Can you think of a topic where this idea would be especially useful? Can you think of a topic where this idea would not work? Why?        
`

export const concept_comments_slider = {
    name: 'Comments Slider',
    key: 'comments_slider',
    author: authorToriSgarro,
    date: '2023-06-21',
    tags: [tagConversation],
    status: statusConcept,
    video: [
        {name: 'English', youtube: 'XE8cu11IUS4'},
        {name: 'German', youtube: 'ibFNi7caXK0'},
        {name: 'French', youtube: 'ANuznA__kQg'}
    ],
    description: description_comments_slider,
}

