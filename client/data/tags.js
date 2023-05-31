import { Entypo, FontAwesome, Ionicons } from "@expo/vector-icons"
import { getHuesForNamedList } from "../shared/util"


export const tagConversation = {
    name: 'Conversation',
    description: 'Shows a way of having conversations'
}

export const tagOnboarding = {
    name: 'Onboarding',
    description: 'Ways to onboard new users'
}

export const tagModeration = {
    name: 'Moderation',
    description: 'Ways to moderate conversations'
}

export const tagArticle = {
    name: 'Articles',
    description: 'Ways to have conversations around articles'
}

export const tagAudioVideo = {
    name: 'Audio/Video',
    description: 'Explores conversation types other than text'
}

export const tags = [tagConversation, tagOnboarding, tagModeration, tagArticle, tagAudioVideo]

export const tagHues = getHuesForNamedList(tags);


export const statusTentative = {
    name: 'Tentative',
    iconName: 'question-circle', 
    iconSet: FontAwesome,
    description: 'An early idea that we are not yet confident about',
}

export const statusConfident = {
    name: 'Confident',
    description: 'An idea we have confidence in and are persuing further',
    name: 'checkmark-circle',
    iconSet: Ionicons
}

export const statusStartingPoint = {
    name: 'Starting Point',
    iconName: 'controller-play', 
    iconSet: Entypo,
    description: 'Illustrates a standard social product structure. Useful as a starting point for more interesting prototypes'
}

export const statusTutorial = {
    name: 'Tutorial',
    iconName: 'book',
    iconSet: Entypo,
    description: 'A prototype created for the purpose of illustrating how the prototype system works',
}

export const statusExperiment = {
    name: 'Experiment',
    iconName: 'lab-flask',
    iconSet: Entypo,
    description: 'Not a usable prototype, but lets you explore an idea.'
}

export const statuses = [statusTentative, statusConfident, statusStartingPoint, statusTutorial]

