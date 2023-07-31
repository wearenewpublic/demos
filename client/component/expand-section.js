import { Entypo } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Clickable, Pad } from "./basics";
import { useTranslation } from "./translation";

export function ExpandSection({title, defaultOpen=false, shadow=true, children}) {
    const s = ExpandSectionStyle;
    const [expanded, setExpanded] = useState(defaultOpen);
    const tTitle = useTranslation(title);

    return <View style={[s.outer, shadow ? s.shadow : null]}>
        <Clickable onPress={() => setExpanded(!expanded)}>
            <View style={s.topBar}>
                <Text style={s.title}>{tTitle}</Text>
                <Entypo name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color='#999' />
            </View>
        </Clickable>
        {expanded ? <Pad size={4}/> : null}
        {expanded ? <View style={s.inner}>{children}</View> : null}
    </View>
}

const ExpandSectionStyle = StyleSheet.create({
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 1,
    },
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
    inner: {
        marginVertical: 4
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

