import { StyleSheet, Text, View } from "react-native";
import { PopupSelector } from "../platform-specific/popup";
import { UserFace } from "../component/userface";
import { useDatastore, useGlobalProperty, usePersonaKey } from "../util/datastore";
import { translateLabel, useLanguage } from "../component/translation";
import { useContext } from "react";
import { PrototypeContext } from "./PrototypeContext";

export function PersonaSelector() {
    const s = PersonaSelectorStyle;
    const selectedPersona = usePersonaKey();
    const allPersonas = useGlobalProperty('persona');
    const language = useLanguage();
    const datastore = useDatastore();
    const {instance} = useContext(PrototypeContext);
    const itemKeys = Object.keys(allPersonas || {});    
    const items = itemKeys.map(key => ({key, label: getPersonaName({language, instance, personas: allPersonas, personaKey: key})}));
    return <View style={s.row}>
        <View style={{marginHorizontal: 4, marginVertical: 2}}>
            <PopupSelector value={selectedPersona} items={items} 
                onSelect={personalKey => datastore.setSessionData('personaKey', personalKey)} 
            />
        </View>
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

function getPersonaName({language, personas, instance, personaKey}) {
    const persona = personas[personaKey];
    if (instance?.personaTitle?.[personaKey]) {
        return persona.name + ' (' + instance?.personaTitle?.[personaKey] + ')';
    } else if (persona.label) {
        const tLabel = translateLabel({label: persona.label, language});
        return persona.name + ' (' + tLabel + ')';
    } else {
        return persona.name;
    }
}
