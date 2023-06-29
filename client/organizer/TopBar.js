import { StyleSheet, Text, View } from "react-native";
import { PersonaSelector } from "./PersonaSelector";
import { Entypo } from "@expo/vector-icons";
import { Card, Center, Clickable, HorizBox, Pad, PadBox, PrimaryButton, ScreenTitleText, SecondaryButton, SmallTitle } from "../component/basics";
import { setTitle } from "../platform-specific/url";
import { goBack, gotoPrototype, pushSubscreen } from "../util/navigate";
import { firebaseSignOut, useFirebaseUser } from "../util/firebase";
import { FaceImage, UserFace } from "../component/userface";
import { Popup } from "../platform-specific/popup";
import { useDatastore } from "../util/datastore";

export function TopBar({title, subtitle, showPersonas, params}) {
    const s = TopBarStyle;
    return <View style={s.topBox}>        
        <View style={s.leftRow}>    
            <Clickable onPress={() => goBack()}>
                <Entypo name='chevron-left' size={24} color='#666' />
            </Clickable>
            <View style={s.titleBox}>
                <Text numberOfLines={1} style={subtitle ? s.twoLineTitle : s.oneLineTitle}>
                    {typeof(title) == 'string' ?
                        <ScreenTitleText title={title}/>
                    : title}
                </Text>
                {subtitle ? 
                    <Text style={s.subtitle}>{subtitle}</Text>
                : null}
            </View>
        </View>
        {showPersonas ? 
            <PersonaSelector />
        : 
            <UserInfo />
        }
    </View>
}

const TopBarStyle = StyleSheet.create({
    topBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 8, 
        justifyContent: 'space-between',
        borderBottomColor: '#ddd', 
        borderBottomWidth: StyleSheet.hairlineWidth,
        backgroundColor: 'white',
    },
    leftRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1
    },
    oneLineTitle: {
        fontSize: 18, fontWeight: 'bold',
        marginVertical: 8,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    twoLineTitle: {
        fontSize: 15, fontWeight: 'bold',
        flexShrink: 1
    },
    subtitle: {
        fontSize: 13, color: '#666'
    },
    titleBox: {
        marginVertical: 2,
        marginLeft: 4,
        flexShrink: 1
    }

})


function UserInfo() {
    const s = UserInfoStyle;
    const fbUser = useFirebaseUser();

    function popup() {
        return <View>
            <HorizBox center>
                <FaceImage photoUrl={fbUser.photoURL} size={80} />
                <View style={s.right}>
                    <Text style={s.title}>{fbUser.displayName}</Text>
                    <Text style={s.email}>{fbUser.email}</Text>
                </View>
            </HorizBox>
            <Pad/>
            <Center>   
                <PrimaryButton onPress={firebaseSignOut}>Sign Out</PrimaryButton>
            </Center>
        </View>
    }

    if (fbUser) {
        return <Popup popupContent={popup}>
            <PadBox vert={0}>
                <FaceImage photoUrl={fbUser.photoURL} size={32} />
            </PadBox>
        </Popup>
    } else {        
        return <SecondaryButton onPress={() => pushSubscreen('login') }>
            Log In
        </SecondaryButton>
    }
}

const UserInfoStyle = StyleSheet.create({
    title: {
        fontSize: 18, fontWeight: 'bold',
    },
    right: {
        marginLeft: 12
    }
});