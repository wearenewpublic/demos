import { StyleSheet, Text, View } from "react-native";
import { PersonaSelector } from "./PersonaSelector";
import { Entypo } from "@expo/vector-icons";
import { Clickable } from "../component/basics";
import { setTitle } from "../platform-specific/url";
import { goBack } from "./navigate";

export function TopBar({title, subtitle, showPersonas}) {
    const s = TopBarStyle;
    setTitle(title);
    return <View style={s.topBox}>        
        <View style={s.leftRow}>    
            <Clickable onPress={() => goBack()}>
                <Entypo name='chevron-left' size={24} color='#666' />
            </Clickable>
            <View style={s.titleBox}>
                <Text numberOfLines={1} style={subtitle ? s.twoLineTitle : s.oneLineTitle}>{title}</Text>
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

