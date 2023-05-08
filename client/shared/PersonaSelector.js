import { StyleSheet, Text, View } from "react-native";
import { PopupSelector } from "../platform-specific/popup";
import { personas } from "../demo";
import { setGlobalProperty, useGlobalProperty } from "../util/localdata";
import { UserFace } from "../component/userface";

export function PersonaSelector() {
    const s = PersonaSelectorStyle;
    const selectedPersona = useGlobalProperty('$personaKey');
    const itemKeys = Object.keys(personas);
    const items = itemKeys.map(key => ({key, label: personas[key].name}));
    return <View style={s.row}>
        <PopupSelector value={selectedPersona} items={items} 
            onSelect={personalKey => setGlobalProperty('$personaKey', personalKey)} 
        />
        <UserFace userId={selectedPersona} size={32} />
    </View>
}

const PersonaSelectorStyle = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8
    }
})
