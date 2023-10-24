import { useContext } from "react";
import { useObject, usePersonaKey } from "../util/datastore";
import { PrototypeContext } from "../organizer/PrototypeContext";
import { getFirebaseUser } from "../util/firebase";
import { Image, View } from "react-native";
import { CircleCheck } from "./icon";


export function ProfilePhoto({userId, sizeType='large', faint=false, check=false}) {
    const persona = useObject('persona', userId);


    const {instance} = useContext(PrototypeContext);
    const meKey = usePersonaKey();

    if (meKey == userId && instance.isLive) {
        const fbUser = getFirebaseUser();
        if (fbUser) {
            return <FaceImage photoUrl={fbUser.photoURL} sizeType={sizeType} faint={faint} 
                check={check} />
        } else {
            return <AnonymousFace faint={faint} sizeType={sizeType} />
        }
    } else {
        const face = persona?.face;
        return <FaceImage face={face} photoUrl={persona?.photoUrl} sizeType={sizeType} faint={faint} check={check} />
    }
}

function FaceImage({face, photoUrl=null, sizeType='small', faint=false, check=false}) {
    const sizeMap = {
        large: 48,
        small: 32,
        xs: 24,
    }
    const size = sizeMap[sizeType] ?? 32;

    const checkPadMap = {
        large: 2,
        small: 4,
        xs: 8,
    }
    const checkPad = check ? checkPadMap[sizeType ?? 'small'] : 0;


    return <View style={{position: 'relative', alignSelf: 'flex-start'}}>
        <Image 
            style ={{
                width: size, height: size, borderRadius: size /2, 
                opacity: faint ? 0.5 : 1, marginRight: checkPad
            }}
            source={{uri: photoUrl ?? ('https://new-public-demo.web.app/faces/' + face)}} />
    
            {check && <View style={{position: 'absolute', right: 0, bottom: 0}}>
                <CircleCheck />
            </View>
        }
    </View>
}

export function AnonymousFace({faint, size}) {
    return <FaceImage face='anonymous.jpeg' faint={faint} size={size} />
}
