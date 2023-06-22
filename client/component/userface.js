import { Image, StyleSheet } from "react-native";
import { useGlobalProperty, useObject } from "../util/localdata"

export function UserFace({userId, size = 32, faint=false}) {
    // const personaKey = useGlobalProperty('$personaKey')
    const persona = useObject('persona', userId);
    const faceImg = persona.face;
    return <Image 
        style ={{width: size, height: size, borderRadius: size /2, opacity: faint ? 0.5 : 1}}
        source={{uri: 'https://new-public-demo.web.app/faces/' + faceImg}} />
}

export function FaceImage({face, size=32, faint=false}) {
    return <Image 
        style ={{width: size, height: size, borderRadius: size /2, opacity: faint ? 0.5 : 1}}
        source={{uri: 'https://new-public-demo.web.app/faces/' + face}} />
}

export function AnonymousFace({faint}) {
    return <FaceImage face='anonymous.jpeg' faint={faint} />
}
