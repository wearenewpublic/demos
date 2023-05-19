import { ChatDemo } from "./Chat";
import { RoboMediatorChatDemo } from "./RoboMediatorChat";
import { RuleEnforcerChatDemo } from "./RuleEnforcer";
import { ExampleDemo } from "./Example";
import { ThreadedCommentsDemo } from "./ThreadedComments";
import { VideoResponse } from "./VideoResponse";
import { SimulatedChat } from "./SimulatedChat";

export const demos = [
    ExampleDemo, ChatDemo, ThreadedCommentsDemo, RoboMediatorChatDemo, RuleEnforcerChatDemo, VideoResponse,
    SimulatedChat
]

export const defaultPersona = 'angry';
export const personas = {
    'angry': {
        name: 'Angry Alice',
        face: 'face9.jpeg'
    },
    'new': {
        name: 'Newbie Natalie',
        face: 'face4.jpeg'
    }, 
    'timid': {
        name: 'Timid Tim',
        face: 'face2.jpeg'
    },
    'peacemaker': {
        name: 'Peacemaker Pete',
        face: 'face3.jpeg'
    },
    'leader': {
        name: 'Leader Laura',
        face: 'face5.jpeg'
    },
    'silly': {
        name: 'Silly Sam',
        face: 'face2.jpeg'
    },
    'boring': {
        name: 'Boring Bob',
        face: 'face10.jpeg'
    },
    'left': {
        name: 'Lefty Larry',
        face: 'face6.jpeg'
    },
    'right': {
        name: 'Righty Rita',
        face: 'face7.jpeg'
    },
    'robo': {
        name: 'Robot',
        face: 'robo.jpeg'
    }
}
