import { ChatDemo } from "./Chat";
import { StubDemo } from "./Stub";
import { ThreadedCommentsDemo } from "./ThreadedComments";

export const demos = [
    StubDemo, ChatDemo, ThreadedCommentsDemo
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
    }
}
