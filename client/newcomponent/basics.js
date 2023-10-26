import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Clickable } from "../component/basics";
import { colorGreyBorder, colorWhite } from "./color";

export function HoverView({style, hoverStyle, pressedStyle, children, onPress, setHover=()=>{}}) {
    const [localHover, setLocalHover] = useState(false);
    return <Clickable
        style={[style, localHover ? hoverStyle : null, {cursor: 'pointer'}]}
        onHoverChange={hover => {setLocalHover(hover); setHover(hover)}}
        onPress={onPress}>
            {children}
    </Clickable>
}

export function Card({children}) {
    const s = CardStyle;
    return <View style={s.card}>
        {children}
    </View>
}
const CardStyle = StyleSheet.create({
    card: {
        paddingVertical: 20,
        paddingHorizontal: 24,
        backgroundColor: colorWhite,
        borderColor: colorGreyBorder,
        borderWidth: 1
    }
});

export function Divider() {
    const s = DividerStyle;
    return <View style={s.divider} />
}
const DividerStyle = StyleSheet.create({
    divider: {
        height: 1,
        backgroundColor: colorGreyBorder,
    }
});

