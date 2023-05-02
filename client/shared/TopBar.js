import { StyleSheet, Text, View } from "react-native";
import { PersonaSelector } from "./PersonaSelector";

export function TopBar({demo}) {
    return <View style={{flexDirection: 'row', paddingLeft: 8, justifyContent: 'space-between', alignItems: 'center', borderBottomColor: '#ddd', borderBottomWidth: StyleSheet.hairlineWidth}}>        
        <Text>{demo.name}</Text>
        <PersonaSelector />
    </View>
}

