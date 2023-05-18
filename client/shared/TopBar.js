import { StyleSheet, Text, View } from "react-native";
import { PersonaSelector } from "./PersonaSelector";
import { Entypo } from "@expo/vector-icons";
import { Clickable } from "../component/basics";
import { goBack } from "./url";

export function TopBar({title, subtitle, showPersonas}) {
    const s = TopBarStyle;
    return <View style={{flexDirection: 'row', paddingLeft: 8, justifyContent: 'space-between', alignItems: 'center', borderBottomColor: '#ddd', borderBottomWidth: StyleSheet.hairlineWidth}}>        
        <View style={{flexDirection: 'row', alignItems: 'center'}}>    
            <Clickable onPress={() => goBack()}>
                <Entypo name='chevron-left' size={24} color='#666' />
            </Clickable>
            <View style={s.titleBox}>
                <Text style={subtitle ? s.twoLineTitle : s.oneLineTitle}>{title}</Text>
                {subtitle ? 
                    <Text style={s.subtitle}>{subtitle}</Text>
                : null}
            </View>
        </View>
        {showPersonas ? 
            <PersonaSelector />
        : null}
    </View>
}

const TopBarStyle = StyleSheet.create({
    oneLineTitle: {
        fontSize: 18, fontWeight: 'bold',
        marginVertical: 8
    },
    twoLineTitle: {
        fontSize: 15, fontWeight: 'bold'
    },
    subtitle: {
        fontSize: 13, color: '#666'
    },
    titleBox: {
        marginVertical: 2,
        marginLeft: 4
    }

})

