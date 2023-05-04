import { Text } from "react-native";
import { PopupSelector } from "../platform-specific/popup";
import { personas } from "../demo";
import { setGlobalProperty, useGlobalProperty } from "../util/localdata";

export function PersonaSelector() {
    const selectedPersona = useGlobalProperty('$personaKey');
    const itemKeys = Object.keys(personas);
    const items = itemKeys.map(key => ({key, label: personas[key].name}));
    return <PopupSelector value={selectedPersona} items={items} 
        onSelect={personalKey => setGlobalProperty('$personaKey', personalKey)} 
    />
}


