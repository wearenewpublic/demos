import { Entypo } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Clickable, Pad } from "./basics";
import { useTranslation } from "./translation";

export function ExpandSection({title, defaultOpen=false, children}) {
    const s = ExpandSectionStyle;
    const [expanded, setExpanded] = useState(defaultOpen);
    const tTitle = useTranslation(title);

    return <View style={s.outer}>
        <Clickable onPress={() => setExpanded(!expanded)}>
            <View style={s.topBar}>
                <Text style={s.title}>{tTitle}</Text>
                <Entypo name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color='#999' />
            </View>
        </Clickable>
        {expanded ? <Pad size={4}/> : null}
        {expanded ? children : null}
    </View>
}

const ExpandSectionStyle = StyleSheet.create({
    outer: {
        margin: 4,
        maxWidth: 500,
        borderColor: '#ddd',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'white'
    },  
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    title: {
        fontSize: 15, fontWeight: 'bold'
    }
})

