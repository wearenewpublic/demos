import { useContext } from "react";
import { useObject, usePersonaKey } from "../util/datastore";
import { PrototypeContext } from "../organizer/PrototypeContext";
import { getFirebaseUser } from "../util/firebase";
import { Image, StyleSheet, View } from "react-native";
import { IconCircleCheck } from "./icon";
import { UtilityText } from "./text";
import { Pad } from "../component/basics";
import { formatDate, formatMiniDate } from "./date";
import { colorTextGrey } from "./color";


export function ProfilePhoto({userId, type='large', faint=false, check=false}) {
    const persona = useObject('persona', userId);


    const {instance} = useContext(PrototypeContext);
    const meKey = usePersonaKey();

    if (meKey == userId && instance.isLive) {
        const fbUser = getFirebaseUser();
        if (fbUser) {
            return <FaceImage photoUrl={fbUser.photoURL} type={type} faint={faint} 
                check={check} />
        } else {
            return <AnonymousFace faint={faint} type={type} />
        }
    } else {
        const face = persona?.face;
        return <FaceImage face={face} photoUrl={persona?.photoUrl} type={type} faint={faint} check={check} />
    }
}

function FaceImage({face, photoUrl=null, type='small', faint=false, check=false}) {
    const sizeMap = {
        large: 40,
        small: 32,
        tiny: 24,
    }
    const size = sizeMap[type] ?? 32;

    const checkPadMap = {
        large: 2,
        small: 4,
        tiny: 8,
    }
    const checkPad = check ? checkPadMap[type ?? 'small'] : 0;


    return <View style={{position: 'relative', alignSelf: 'flex-start'}}>
        <Image 
            style ={{
                width: size, height: size, borderRadius: size /2, 
                opacity: faint ? 0.5 : 1, marginRight: checkPad
            }}
            source={{uri: photoUrl ?? ('https://new-public-demo.web.app/faces/' + face)}} />
    
            {check && <View style={{position: 'absolute', right: 0, bottom: 0}}>
                <IconCircleCheck />
            </View>
        }
    </View>
}

export function AnonymousFace({faint, size}) {
    return <FaceImage face='anonymous.jpeg' faint={faint} size={size} />
}

export function FacePile({type='large', userIdList}) {
    const s = FacePileStyle;
    const sizeMap = {
        large: 40,
        small: 32,
        tiny: 24,
    }
    const size = sizeMap[type] ?? 32;

    return <View style={s.outer}>
        {userIdList.map((userId, i) => <View key={i} 
                style={{position: 'relative', marginLeft: i == 0 ? 0 : -(size/4)}}>
            <ProfilePhoto userId={userId} type={type} border />
            <View style={{position: 'absolute', left: 0, top: 0, width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: 'white'}} />
        </View>)}
    </View>
}
const FacePileStyle = StyleSheet.create({
    outer: {
        flexDirection: 'row',
    }
})


export function Byline({type='large', userId, time}) {
    const s = BylineStyle
    const persona = useObject('persona', userId);''
    if (type == 'large') {
        return <View style={s.outer}>
            <ProfilePhoto userId={userId} type='large' /> 
            <View style={s.right}>
                <UtilityText bold text={persona?.name} />
                <UtilityText color={colorTextGrey} text={formatDate(time)} />
            </View>
        </View>
    } else {
        return <View style={s.smallOuter}>
            <ProfilePhoto userId={userId} type='small' /> 
            <Pad size={8} />
            <UtilityText bold text={persona?.name} />
            <Pad size={6} />
            <UtilityText color={colorTextGrey} text={formatMiniDate(time)} />
        </View>
    }
}

const BylineStyle = StyleSheet.create({
    outer: {
        flexDirection: 'row',
    },
    right: {
        marginLeft: 8,
        marginTop: 4,
        marginBottom: 4,
        justifyContent: 'space-between'
    },
    smallOuter: {
        flexDirection: 'row',
        alignItems: 'center',
    }
})

export function Persona({userId, type='small'}) {
    const s = PersonaStyle;
    const persona = useObject('persona', userId);
    return <View style={s.outer}>
        <ProfilePhoto userId={userId} type={type} /> 
        <View style={s.right}>
            <UtilityText bold text={persona?.name} />
        </View>
    </View>
}
const PersonaStyle = StyleSheet.create({
    outer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    right: {
        marginLeft: 8,
    },
})