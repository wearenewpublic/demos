import { Image, StyleSheet } from "react-native";
import { useGlobalProperty, useObject } from "../util/localdata"

export function UserFace({userId, size = 32, faint=false}) {
    // const personaKey = useGlobalProperty('$personaKey')
    const persona = useObject('persona', userId);
    const faceImg = persona.face;
    return <Image 
        style ={{width: size, height: 32, borderRadius: size /2, opacity: faint ? 0.5 : 1}}
        source={{uri: 'https://new-public-demo.web.app/faces/' + faceImg}} />
}
