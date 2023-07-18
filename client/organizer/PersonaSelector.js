import { StyleSheet, Text, View } from "react-native";
import { PopupSelector } from "../platform-specific/popup";
import { UserFace } from "../component/userface";
import { useDatastore, useGlobalProperty, usePersonaKey } from "../util/datastore";

export function PersonaSelector() {
    const s = PersonaSelectorStyle;
    const selectedPersona = usePersonaKey();
    const allPersonas = useGlobalProperty('persona');
    const datastore = useDatastore();
    const itemKeys = Object.keys(allPersonas || {});    
    const items = itemKeys.map(key => ({key, label: allPersonas[key].name}));
    return <View style={s.row}>
        <PopupSelector value={selectedPersona} items={items} 
            onSelect={personalKey => datastore.setSessionData('personaKey', personalKey)} 
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
