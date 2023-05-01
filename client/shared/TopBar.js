import { Text, View } from "react-native";
import { PersonaSelector } from "./PersonaSelector";

export function TopBar({onSetPersona}) {
    return <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <PersonaSelector onSetPersona={onSetPersona} />
    </View>
}

