import { Image, StyleSheet } from "react-native";
import { getPersonaKey, useGlobalProperty, useObject, usePersonaKey } from "../util/localdata"
import { PrototypeContext } from "../organizer/PrototypeContext";
import { useContext } from "react";

export function UserFace({userId, size = 32, faint=false}) {
    const persona = useObject('persona', userId);
    const {instance, fbUser} = useContext(PrototypeContext);
    const meKey = usePersonaKey();
    if (meKey == userId && instance.isLive && fbUser) {
        return <FaceImage photoUrl={fbUser.photoURL} size={size} faint={faint} />
    } else {
        const face = persona?.face;
        return <FaceImage face={face} photoUrl={persona?.photoUrl} size={size} faint={faint} />
    }
}

export function FaceImage({face, photoUrl=null, size=32, faint=false}) {
    return <Image 
        style ={{width: size, height: size, borderRadius: size /2, opacity: faint ? 0.5 : 1}}
        source={{uri: photoUrl ?? ('https://new-public-demo.web.app/faces/' + face)}} />
}

export function AnonymousFace({faint}) {
    return <FaceImage face='anonymous.jpeg' faint={faint} />
}
