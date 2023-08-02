import { StyleSheet, Text, View } from "react-native";
import { PersonaSelector } from "./PersonaSelector";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Card, Center, Clickable, HorizBox, Pad, PadBox, PrimaryButton, ScreenTitleText, SecondaryButton, SmallTitleLabel } from "../component/basics";
import { setTitle } from "../platform-specific/url";
import { goBack, gotoPrototype, pushSubscreen } from "../util/navigate";
import { firebaseSignOut, useFirebaseUser } from "../util/firebase";
import { FaceImage, UserFace } from "../component/userface";
import { Popup } from "../platform-specific/popup";
import { useDatastore, useGlobalProperty, usePersonaKey } from "../util/datastore";
import { useContext } from "react";
import { PrototypeContext } from "./PrototypeContext";

export function TopBar({title, subtitle, showPersonas, showBack=true, params}) {
    const s = TopBarStyle;
    const {instanceKey} = useContext(PrototypeContext);
    return <View style={s.topBox}>        
        <View style={s.leftRow}>    
            {showBack ? 
                <Clickable onPress={() => goBack()}>
                    <Entypo name='chevron-left' size={24} color='#666' />
                </Clickable>
            : null}
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
        <HorizBox center>
            {instanceKey ? 
                <AdminPopup />
            : null}
            {showPersonas ? 
                <PersonaSelector />
            : 
                <UserInfo />
            }
        </HorizBox>
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


function AdminPopup() {
    const {prototype} = useContext(PrototypeContext);
    const admin = useGlobalProperty('admin');
    const personaKey = usePersonaKey();

    function popup() {
        return <View>
            <Clickable onPress={() => pushSubscreen('members')}>
            <Text>Members</Text>
            </Clickable>
        </View>
    }

    if (admin && admin == personaKey && prototype.hasMembers) {
        return <Popup popupContent={popup}>
            <Entypo name='menu' size={32} color='#666' />
        </Popup>
    }
}


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
                <PrimaryButton onPress={firebaseSignOut} label='Sign Out' />
            </Center>
        </View>
    }

    if (fbUser) {
        return <Popup popupContent={popup}>
            <PadBox vert={6}>
                <FaceImage photoUrl={fbUser.photoURL} size={32} />
            </PadBox>
        </Popup>
    } else {        
        return <SecondaryButton onPress={() => pushSubscreen('login')} label='Log In' />
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