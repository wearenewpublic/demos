import { deepClone } from "../util/util";

  
  export const personaAngry = {
    key: 'angry',
    name: 'Angry Alice',
    face: 'face9.jpeg'
  };
  
  export const personaNew = {
    key: 'new',
    name: 'Newbie Natalie',
    face: 'face4.jpeg'
  };
  
  export const personaTimid = {
    key: 'timid',
    name: 'Timid Tim',
    face: 'face2.jpeg'
  };
  
  export const personaPeacemaker = {
    key: 'peacemaker',
    name: 'Peacemaker Pete',
    face: 'face3.jpeg'
  };
  
  export const personaLeader = {
    key: 'leader',
    name: 'Leader Laura',
    face: 'face5.jpeg',
    admin: true
  };
  
  export const personaSilly = {
    key: 'silly',
    name: 'Silly Sarah',
    face: 'face8.jpeg'
  };
  
  export const personaBoring = {
    key: 'boring',
    name: 'Boring Bob',
    face: 'face10.jpeg'
  };
  
  export const personaLeft = {
    key: 'left',
    name: 'Lefty Larry',
    face: 'face6.jpeg'
  };
  
  export const personaRight = {
    key: 'right',
    name: 'Righty Rita',
    face: 'face7.jpeg'
  };
  
  export const personaRobo = {
    key: 'robo',
    name: 'Robot',
    face: 'robo.jpeg'
  };
  
  export const personaTrek = {
    key: 'trek',
    name: 'Trekkie Trisha',
    face: 'face7.jpeg',
    member: true
  };
  
  export const personaWars = {
    key: 'wars',
    name: 'Star Wars Simon',
    face: 'face6.jpeg',
    member: true
  };

  export const personaGuest = {
    key: 'guest',
    name: 'Guest Garry',
    face: 'face2.jpeg',
    member: false
  }
  


export const defaultPersona = 'angry';

export const defaultPersonaList = [personaAngry, personaNew, personaTimid, personaPeacemaker, personaLeader, 
    personaSilly, personaBoring, personaLeft, personaRight, personaRobo, personaTrek, personaWars]


export function personaListToMap(personas) {
    const result = {};
    personas.forEach(persona => result[persona.key] = deepClone(persona));
    return result;
}    

